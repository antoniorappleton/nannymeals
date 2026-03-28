import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Weekly Plan Generator
 * Runs every Monday at 06:00
 */
export const weeklyPlanJob = onSchedule("0 6 * * 1", async (event) => {
  const households = await db.collection("households").get();
  
  for (const doc of households.docs) {
    const hid = doc.id;
    const settings = doc.data();
    
    // Logic to fetch recipes based on settings and generate a plan
    // This would involve filtering by allergies, time, and budget
    console.log(`Generating plan for household: ${hid}`);
  }
});

// Scheduled cleanup function executed daily at 02:00 UTC
export const cleanupExpiredPlans = onSchedule("0 2 * * *", async (event) => {
  const now = admin.firestore.Timestamp.now();
  const plansRef = db.collection("weeklyPlans");
  const expiredSnap = await plansRef
    .where("expiresAt", "<", now)
    .where("locked", "==", false)
    .get();

  let count = 0;
  for (const plan of expiredSnap.docs) {
    console.log(`Removing expired plan ${plan.id}`);
    await plan.ref.delete();
    count++;
  }
  console.log(`cleanupExpiredPlans removed ${count} plans`);
});
/**
 * Adaptation Trigger
 * Updates adaptationState when feedback is submitted
 */
export const onFeedbackWrite = onDocumentCreated("feedback/{fid}", async (event) => {
  const feedback = event.data?.data();
  if (!feedback) return;

  const { householdId, rating, kidsEatenPct, leftoversLevel, actualTimeOver, stress } = feedback;
  
  const stateRef = db.collection("adaptationState").doc(householdId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(stateRef);
    const data = doc.data() || { tagWeights: {}, recipeWeights: {} };
    const state = {
      tagWeights: data.tagWeights || {},
      recipeWeights: data.recipeWeights || {},
      ...data,
    };
    
    // Adaptation Algorithm v1
    // Simplistic weight adjustment based on feedback
    if (stress > 3) {
      state.tagWeights["quick"] = (state.tagWeights["quick"] || 0) + 1;
    }
    
    if (rating >= 4) {
      state.recipeWeights[feedback.recipeId] = (state.recipeWeights[feedback.recipeId] || 0) + 1;
    }

    t.set(stateRef, state, { merge: true });
  });
});

/**
 * Grocery List Aggregator
 */
export const buildGroceryList = onCall(async (request) => {
  const { householdId, planId } = request.data;
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const planDoc = await db.collection("weeklyPlans").doc(planId).get();
  if (!planDoc.exists) {
    throw new HttpsError("not-found", "Plan not found.");
  }

  const plan = planDoc.data();
  const aggregatedItems: any = {};

  // Fetch recipes and aggregate ingredients
  // Implementation details...

  return { items: aggregatedItems };
});

/**
 * Privacy: Export Data
 */
export const exportHouseholdData = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required.");
  
  const household = await db.collection("households").doc(uid).get();
  const plans = await db.collection("weeklyPlans").where("householdId", "==", uid).get();
  
  return {
    household: household.data(),
    plans: plans.docs.map(d => d.data())
  };
});

// --------- SUPERMARKET SCRAPER & ADMIN HELPERS ---------

import { extractFromContinente, extractFromPingoDoce, getPriceInStore } from "./scraper-service";

function isAdmin(auth: any) {
  return auth && auth.token && auth.token.email === "antonioappleton@gmail.com";
}

/**
 * ADMIN endpoint: Scrape a recipe from a URL and optionally match prices.
 * Supports: Continente and Pingo Doce.
 */
export const importFromUrlHttp = functions.https.onRequest(async (req, res) => {
  const origin = req.headers.origin || '*';
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  try {
    const authHeader = (req.headers.authorization || '').toString();
    if (!authHeader.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing Authorization header' }); return; }
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded || decoded.email !== 'antonioappleton@gmail.com') { res.status(403).json({ error: 'Forbidden' }); return; }

    const { url, storePreference, save = false } = req.body || {};
    if (!url) { res.status(400).json({ error: 'URL is required' }); return; }

    let recipe: any;
    if (url.includes('continente.pt')) {
      recipe = await extractFromContinente(url);
    } else if (url.includes('pingodoce.pt')) {
      recipe = await extractFromPingoDoce(url);
    } else {
      res.status(400).json({ error: 'Unsupported URL source' });
      return;
    }

    // Enrich with prices if requested
    if (storePreference) {
      let totalCost = 0;
      for (const ing of recipe.ingredients) {
        const price = await getPriceInStore(ing.name, storePreference);
        if (price) {
          ing.price = price;
          totalCost += price;
        }
      }
      recipe.totalCost = totalCost > 0 ? totalCost.toFixed(2) : null;
      recipe.pricePerServing = totalCost > 0 ? (totalCost / recipe.servings).toFixed(2) : null;
    }

    // Prepare for Firestore
    const finalRecipe = {
      ...recipe,
      id: `scraped_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      createdAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      importSource: 'scraper',
      searchText: `${recipe.name} ${recipe.sourceName}`,
    };

    if (save) {
      await db.collection("recipes").doc(finalRecipe.id).set(finalRecipe);
    }

    res.status(200).json(finalRecipe);
    return;
  } catch (err: any) {
    console.error('importFromUrlHttp error:', err);
    res.status(500).json({ error: err.message || String(err) });
    return;
  }
});

/**
 * Migration: Add members field to all existing weeklyPlans
 * This is a one-time operation to support the new members-based authorization.
 * For each plan, adds the household owner's UID to the members array.
 */
export const migrateWeeklyPlansMembers = functions.https.onRequest(
  async (req, res) => {
    const origin = req.headers.origin || '*';
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      // Verify admin
      const authHeader = (req.headers.authorization || '').toString();
      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing Authorization header' });
        return;
      }
      const idToken = authHeader.split(' ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      if (!decoded || decoded.email !== 'antonioappleton@gmail.com') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Get all plans without members field
      const plansSnap = await db.collection('weeklyPlans').get();
      let migrated = 0;

      for (const planDoc of plansSnap.docs) {
        const plan = planDoc.data();

        // Skip if already has members
        if (Array.isArray(plan.members)) {
          console.log(`Plan ${planDoc.id} already has members, skipping`);
          continue;
        }

        const householdId = plan.householdId;
        if (!householdId) {
          console.warn(`Plan ${planDoc.id} has no householdId, skipping`);
          continue;
        }

        // Get household to get owner UID
        const householdDoc = await db
          .collection('households')
          .doc(householdId)
          .get();
        const household = householdDoc.data();
        if (!household || !household.ownerUid) {
          console.warn(
            `Household ${householdId} not found or missing ownerUid, skipping plan ${planDoc.id}`
          );
          continue;
        }

        // Add members array with household owner
        const members = household.members || [household.ownerUid];
        if (!members.includes(household.ownerUid)) {
          members.push(household.ownerUid);
        }

        await planDoc.ref.update({ members });
        migrated++;
        console.log(
          `Migrated plan ${planDoc.id} with members: ${members.join(', ')}`
        );
      }

      res.status(200).json({
        success: true,
        message: `Migrated ${migrated} plans`,
        migrated,
        total: plansSnap.size,
      });
    } catch (err: any) {
      console.error('migrateWeeklyPlansMembers error:', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  }
);
