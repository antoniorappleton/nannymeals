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

// --------- SPOONACULAR PROXY & ADMIN HELPERS ---------

const SPOON_API_BASE = "https://api.spoonacular.com";
const SPOON_API_KEY = process.env.SPOONACULAR_API_KEY || functions.config().spoonacular.key;

function isAdmin(auth?: admin.auth.DecodedIdToken) {
  return auth && auth.token && auth.token.email === "antonioappleton@gmail.com";
}

async function fetchSpoonacular(path: string, opts: any = {}) {
  if (!SPOON_API_KEY) {
    throw new Error("Spoonacular key not configured");
  }
  const url = `${SPOON_API_BASE}${path}${path.includes("?") ? "&" : "?"}apiKey=${SPOON_API_KEY}`;
  const response = await fetch(url, opts);
  if (response.status === 402) {
    throw new HttpsError("resource-exhausted", "Spoonacular daily limit reached");
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spoonacular error ${response.status}: ${text}`);
  }
  return response.json();
}

/**
 * Callable proxy that forwards selected Spoonacular calls.
 * Only the administrator may invoke this.
 * request.data should contain { action:string, params:object }
 */
export const spoonacularProxy = onCall(async (request) => {
  if (!request.auth || !isAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Only admin may call Spoonacular API");
  }

  const { action, params } = request.data || {};
  switch (action) {
    case "enrichByName": {
      const q = encodeURIComponent(params.recipeName || "");
      return await fetchSpoonacular(`/recipes/complexSearch?query=${q}&addRecipeInformation=true&number=1`);
    }
    case "searchByCuisine": {
      const diet = encodeURIComponent(params.diet || "");
      const count = parseInt(params.count || 10, 10);
      return await fetchSpoonacular(`/recipes/complexSearch?diet=${diet}&addRecipeInformation=true&fillIngredients=true&number=${count}`);
    }
    default:
      throw new HttpsError("invalid-argument", `Unknown action: ${action}`);
  }
});

/**
 * Enrich all recipes stored in Firestore using Spoonacular data.
 * This operation runs under administrative privilege and should be
 * triggered by the admin dashboard or via Firebase CLI.
 */
export const enrichAllRecipes = onCall(async (request) => {
  if (!request.auth || !isAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Only admin may trigger enrichment");
  }

  const rSnap = await db.collection("recipes").get();
  let count = 0;

  for (const rDoc of rSnap.docs) {
    const data = rDoc.data();
    if (!data.calories || !data.pricePerServing) {
      const searchData = await fetchSpoonacular(
        `/recipes/complexSearch?query=${encodeURIComponent(data.name)}&addRecipeInformation=true&number=1`
      );
      const details = (searchData.results && searchData.results[0]) || null;
      if (details) {
        const enriched = {
          calories: Math.round(
            details.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount ||
              (details.healthScore > 0 ? details.healthScore * 5 + 200 : 350)
          ),
          protein: details.nutrition?.nutrients?.find((n: any) => n.name === "Protein")
            ? `${Math.round(
                details.nutrition.nutrients.find((n: any) => n.name === "Protein").amount
              )}g`
            : "20g",
          pricePerServing: (details.pricePerServing / 100).toFixed(2),
          totalCost: ((details.pricePerServing * (details.servings || 1)) / 100).toFixed(2),
          servings: details.servings || 1,
          image: details.image,
          spoonacularId: details.id,
          spoonacularSource: details.sourceUrl,
        } as any;
        await rDoc.ref.update(enriched);
        count++;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  return { updated: count };
});
