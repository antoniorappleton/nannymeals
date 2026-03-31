import * as functions from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

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
 */
export const onFeedbackWrite = onDocumentCreated("feedback/{fid}", async (event) => {
  const feedback = event.data?.data();
  if (!feedback) return;

  const { householdId, rating, stress } = feedback;
  
  const stateRef = db.collection("adaptationState").doc(householdId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(stateRef);
    const data = doc.data() || { tagWeights: {}, recipeWeights: {} };
    const state = {
      tagWeights: data.tagWeights || {},
      recipeWeights: data.recipeWeights || {},
      ...data,
    };
    
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
  const { planId } = request.data;
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const planDoc = await db.collection("weeklyPlans").doc(planId).get();
  if (!planDoc.exists) {
    throw new HttpsError("not-found", "Plan not found.");
  }

  return { items: {} };
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

import { extractFromContinente, extractFromPingoDoce, extractFromAuchan, extractFromMiniPreco, extractFromLidl, extractFromHtml, getPriceInStore } from "./scraper-service";

/**
 * Normalizes ingredient names to match frontend logic.
 */
function normalizeIngredientName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/^(fresh |fresco |fresca |dry |seco |seca )/i, "")
    .replace(/^(small |medium |large |pequeno |médio |grande )/i, "")
    .replace(/^(boneless |skinless |sem pele |sem osso )/i, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/cebola[s]? (?:francesa|galega)?/i, "cebola")
    .replace(/alho[s]? franc[e]?s/i, "alho")
    .replace(/tomate[s]? cereja/i, "tomate cereja")
    .replace(/batata[s]? doce[s]?/i, "batata doce")
    .replace(/batata[s]?[/ ]?frita[s]?/i, "batata frita")
    .replace(/pão[ -]?es?hambúrguer/i, "pão hambúrguer")
    .replace(/pão[ -]?de[ -]?hambúrguer/i, "pão hambúrguer")
    .replace(/filé[ -]?de[ -]?peixe/i, "filé de peixe")
    .trim();
}

/**
 * ADMIN endpoint: Scrape a recipe from a URL or pasted content.
 */
export const importFromUrlHttp = onRequest({ cors: true, timeoutSeconds: 300, memory: "256MiB" }, async (req, res) => {
  try {
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

    const { url, content, storePreference, save = false } = req.body || {};
    
    if (!url && !content) { 
      res.status(400).json({ error: 'URL or content is required' }); 
      return; 
    }

    let recipe: any;
    if (content) {
      recipe = extractFromHtml(content, url || '');
    } else if (url) {
      if (url.includes('continente.pt')) {
        recipe = await extractFromContinente(url);
      } else if (url.includes('pingodoce.pt')) {
        recipe = await extractFromPingoDoce(url);
      } else if (url.includes('auchan.pt')) {
        recipe = await extractFromAuchan(url);
      } else if (url.includes('minipreco.pt')) {
        recipe = await extractFromMiniPreco(url);
      } else if (url.includes('lidl.pt')) {
        recipe = await extractFromLidl(url);
      } else {
        res.status(400).json({ error: 'Unsupported URL source for automatic fetch' });
        return;
      }
    }

    if (!recipe) {
      res.status(500).json({ error: 'Failed to extract recipe data' });
      return;
    }

    // Price matching with Parallelism & Persistence
    if (storePreference && Array.isArray(recipe.ingredients)) {
      let totalCost = 0;
      const stores: ('continente'|'pingodoce'|'auchan'|'lidl')[] = ['continente', 'pingodoce', 'auchan', 'lidl'];
      
      const pricePromises = recipe.ingredients.map(async (ing: any) => {
        const normName = normalizeIngredientName(ing.name);
        if (!normName) return;

        // 1. Get current price for preferred store
        const price = await getPriceInStore(ing.name, storePreference);
        if (price) {
          ing.price = price;
          totalCost += price;
        }

        // 2. Persist to 'ingredients' collection for global use
        const docId = encodeURIComponent(normName).replace(/\./g, '%2E');
        const ingRef = db.collection("ingredients").doc(docId);
        
        // We update all stores if we have a moment, but prioritize the current one
        const prices: any = {};
        prices[storePreference] = price;

        await ingRef.set({
          name: normName,
          prices,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      await Promise.all(pricePromises);
      recipe.totalCost = totalCost > 0 ? totalCost.toFixed(2) : null;
      recipe.pricePerServing = totalCost > 0 ? (totalCost / recipe.servings).toFixed(2) : null;
    }

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
  } catch (err: any) {
    console.error('importFromUrlHttp error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});


/**
 * Migration: Add members field to all existing weeklyPlans
 */
export const migrateWeeklyPlansMembers = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
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

      const plansSnap = await db.collection('weeklyPlans').get();
      let migrated = 0;

      for (const planDoc of plansSnap.docs) {
        const plan = planDoc.data();
        if (Array.isArray(plan.members)) continue;

        const householdId = plan.householdId;
        if (!householdId) continue;

        const householdDoc = await db.collection('households').doc(householdId).get();
        const household = householdDoc.data();
        if (!household || !household.ownerUid) continue;

        const members = household.members || [household.ownerUid];
        if (!members.includes(household.ownerUid)) {
          members.push(household.ownerUid);
        }

        await planDoc.ref.update({ members });
        migrated++;
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
  });
});

/**
 * ADMIN: Sync known ingredients with their real supermarket prices.
 * Fetches unique ingredients from recipes and stores them in 'ingredients' collection.
 */
export const syncIngredientPrices = onRequest({ cors: true, timeoutSeconds: 540, memory: "512MiB" }, async (req, res) => {
  try {
    const authHeader = (req.headers.authorization || '').toString();
    if (!authHeader.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing Auth' }); return; }
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded || decoded.email !== 'antonioappleton@gmail.com') { res.status(403).json({ error: 'Forbidden' }); return; }

    const recipesSnap = await db.collection("recipes").get();
    const uniqueIngredients = new Set<string>();

    recipesSnap.forEach(doc => {
      const recipe = doc.data();
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ing: any) => {
           let targetName = '';
           if (typeof ing === 'string') targetName = ing;
           else if (ing.name) targetName = ing.name;
           
           if (targetName) {
             const norm = normalizeIngredientName(targetName);
             if (norm) uniqueIngredients.add(norm);
           }
        });
      }
    });

    const ingredientsToSync = Array.from(uniqueIngredients);
    const results = [];
    const stores: ('continente'|'pingodoce'|'auchan'|'lidl')[] = ['continente', 'pingodoce', 'auchan', 'lidl'];
    
    let processed = 0;
    for (const name of ingredientsToSync) {
      if (!name) continue;
      
      const docId = encodeURIComponent(name).replace(/\./g, '%2E');
      const ingRef = db.collection("ingredients").doc(docId);
      const ingDoc = await ingRef.get();
      
      // Skip if updated recently (within last 3 days) to avoid rate limits
      if (ingDoc.exists) {
        const data = ingDoc.data();
        const lastUpdated = data?.lastUpdated?.toDate();
        if (lastUpdated && (new Date().getTime() - lastUpdated.getTime()) < 3 * 24 * 60 * 60 * 1000) {
          continue;
        }
      }

      const prices: any = {};
      for (const store of stores) {
        const price = await getPriceInStore(name, store);
        if (price !== null) prices[store] = price;
      }

      await ingRef.set({
        name,
        prices,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      results.push({ name, prices });
      processed++;
      
      // Strict limit per request to prevent timeouts
      if (processed >= 15) break; 
    }

    res.status(200).json({ success: true, processed, totalUnique: ingredientsToSync.length, results });
  } catch (err: any) {
    console.error('syncIngredientPrices error:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});
