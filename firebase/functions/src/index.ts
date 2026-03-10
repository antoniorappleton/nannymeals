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

// safely load the API key from environment or config
let SPOON_API_KEY = process.env.SPOONACULAR_API_KEY || "";
if (!SPOON_API_KEY) {
  try {
    const cfg = functions.config() as any;
    if (cfg && cfg.spoonacular && cfg.spoonacular.key) {
      SPOON_API_KEY = cfg.spoonacular.key;
    }
  } catch (e) {
    console.warn("Unable to load Spoonacular config from functions.config():", e);
    // continue with empty key; it will fail when actually used
  }
}

// auth object passed for callable functions is of type AuthData
// which is less strict than DecodedIdToken. We'll accept any and check
// type assertions at runtime.
function isAdmin(auth: any) {
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
// Core enrichment implementation extracted so it can be reused by both
// the callable and an HTTP endpoint that supports CORS.
const doEnrichAllRecipes = async () => {
  const rSnap = await db.collection("recipes").get();
  let count = 0;

  for (const rDoc of rSnap.docs) {
    const data = rDoc.data();
    if (!data.calories || !data.pricePerServing) {
      const searchData: any = await fetchSpoonacular(
        `/recipes/complexSearch?query=${encodeURIComponent(data.name)}&addRecipeInformation=true&number=1`
      );
      const details = (searchData.results && searchData.results[0]) || null;
if (details) {
        // Convert USD to EUR with 2.3% inflation rate (EUR/USD = 0.92, inflation = 1.023)
        const usdToEur = 0.92 * 1.023;
        const priceEur = details.pricePerServing ? (details.pricePerServing / 100) * usdToEur : null;
        const totalCostEur = details.pricePerServing && details.servings ? (details.pricePerServing * details.servings / 100) * usdToEur : null;
        
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
          pricePerServing: priceEur ? priceEur.toFixed(2) : null,
          totalCost: totalCostEur ? totalCostEur.toFixed(2) : null,
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
};

// Callable wrapper
export const enrichAllRecipes = onCall(async (request) => {
  if (!request.auth || !isAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Only admin may trigger enrichment");
  }
  return await doEnrichAllRecipes();
});

// HTTP wrapper with explicit CORS support so the admin UI can call it via fetch.
export const enrichAllRecipesHttp = functions.https.onRequest(async (req, res) => {
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

    const result = await doEnrichAllRecipes();
    res.status(200).json(result);
    return;
  } catch (err: any) {
    console.error('enrichAllRecipesHttp error:', err);
    res.status(500).json({ error: err.message || String(err) });
    return;
  }
});

/**
 * ADMIN callable: Import and enrich recipes from Spoonacular into Firestore.
 * request.data: { filters: object, pages?: number }
 */
export const importRecipes = onCall(async (request) => {
  // Delegate to shared implementation
  const filters = request.data?.filters || {};
  const pages = parseInt(request.data?.pages || "1", 10) || 1;
  const number = parseInt(request.data?.number || "20", 10) || 20;

  if (!request.auth || !isAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Only admin may import recipes");
  }

  return await doImportRecipes(filters, pages, number);
});

/**
 * Core implementation of the import logic extracted so it can be used
 * by both the callable function and an HTTP proxy (with explicit CORS).
 */
const doImportRecipes = async (filters: any, pagesIn: number, numberIn: number, completeOnly: boolean = true) => {
  const pages = pagesIn || 1;
  const perPage = Math.min(numberIn || 20, 50);

  const imported: any[] = [];
  const skipped: any[] = [];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // retry wrapper around fetchSpoonacular
  const callSpoon = async (path: string, attempt = 0): Promise<any> => {
    try {
      return await fetchSpoonacular(path);
    } catch (err: any) {
      if (attempt < 3) {
        const backoff = 500 * Math.pow(2, attempt);
        console.warn(`Spoonacular call failed, retrying in ${backoff}ms`, err.message || err);
        await sleep(backoff);
        return callSpoon(path, attempt + 1);
      }
      throw err;
    }
  };

  // Validate if a recipe is "complete" - has image, ingredients with amounts/units, and instructions
  const isCompleteRecipe = (details: any): { complete: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    
    // Check for image
    if (!details.image) {
      reasons.push("Sem imagem");
    }
    
    // Check for ingredients with amounts and units
    const ingredients = details.extendedIngredients || details.ingredients || [];
    if (!ingredients || ingredients.length === 0) {
      reasons.push("Sem ingredientes");
    } else {
      // Check if at least some ingredients have amounts/units
      const ingredientsWithData = ingredients.filter((ing: any) => ing.amount && ing.unit);
      if (ingredientsWithData.length === 0) {
        reasons.push("Ingredientes sem quantidades/unidades");
      }
    }
    
    // Check for instructions - either plain text or analyzed instructions with steps
    const hasInstructions = details.instructions && details.instructions.length > 0;
    const hasAnalyzedInstructions = details.analyzedInstructions && 
      details.analyzedInstructions.length > 0 && 
      details.analyzedInstructions.some((inst: any) => inst.steps && inst.steps.length > 0);
    
    if (!hasInstructions && !hasAnalyzedInstructions) {
      reasons.push("Sem instruções");
    }
    
    return {
      complete: reasons.length === 0,
      reasons
    };
  };

  // Normalize a single spoonacular recipe payload into the app schema
  const normalizeRecipe = (details: any) => {
    const title = details.title || details.name || "";
    const servings = details.servings || 1;
    const readyInMinutes = details.readyInMinutes || details.preparationMinutes || details.cookingMinutes || 0;

    // Ingredients normalization
    const ingredients = (details.extendedIngredients || details.ingredients || []).map((ing: any) => {
      const measures = ing.measures || ing.measure || {};
      return {
        spoonacularIngredientId: ing.id || null,
        name: ing.name || ing.originalName || (ing.original || "").split(" ").slice(1).join(" ") || "",
        originalName: ing.originalName || ing.name || ing.original || "",
        original: ing.original || ing.originalString || ing.raw || "",
        amount: ing.amount || ing.measures?.metric?.amount || null,
        unit: ing.unit || ing.unitLong || (measures.metric && measures.metric.unitShort) || null,
        aisle: ing.aisle || null,
        consistency: ing.consistency || null,
        image: ing.image || null,
        meta: ing.meta || ing.metaInformation || [],
        measures: {
          metric: {
            amount: measures.metric?.amount ?? null,
            unitLong: measures.metric?.unitLong ?? null,
            unitShort: measures.metric?.unitShort ?? null,
          },
          us: {
            amount: measures.us?.amount ?? null,
            unitLong: measures.us?.unitLong ?? null,
            unitShort: measures.us?.unitShort ?? null,
          },
        },
        estimatedCost: ing.estimatedCost || (ing.estimatedCost?.value ? ing.estimatedCost : null) || null,
        shoppingListUnits: ing.shoppingListUnits || [],
        possibleUnits: ing.possibleUnits || [],
        nutrition: ing.nutrition || null,
      };
    });

    // Heuristics
    const inferSkillLevel = (r: any) => {
      const numIng = (r.extendedIngredients || r.ingredients || []).length;
      const time = r.readyInMinutes || 0;
      if (time <= 20 && numIng <= 6) return "beginner";
      if (time <= 45 && numIng <= 10) return "intermediate";
      return "advanced";
    };

    const inferLeftoverFriendly = (r: any) => {
      const servingsLocal = r.servings || 1;
      const dishTypes = r.dishTypes || [];
      const tags = dishTypes.map((d: string) => d.toLowerCase());
      if (servingsLocal >= 4) return true;
      if (tags.includes("meal prep") || tags.includes("batch")) return true;
      return false;
    };

    const buildTags = (r: any) => {
      const t: string[] = [];
      const flags: any = {
        vegetarian: r.vegetarian,
        vegan: r.vegan,
        "gluten-free": r.glutenFree,
        "dairy-free": r.dairyFree,
        ketogenic: r.ketogenic,
        "low-fodmap": r.lowFodmap,
        whole30: r.whole30,
      };
      Object.keys(flags).forEach((k) => { if (flags[k]) t.push(k); });
      if (r.dishTypes) t.push(...r.dishTypes.map((d: string) => d.toLowerCase()));
      if (r.cuisines) t.push(...r.cuisines.map((c: string) => c.toLowerCase()));
      if (r.cheap) t.push("cheap");
      if ((r.readyInMinutes || 0) <= 20) t.push("quick");
      if ((r.servings || 1) >= 4) t.push("family-friendly");
      return Array.from(new Set(t));
    };

    // nutrition map
    const nutritionArray = details.nutrition?.nutrients || [];
    const nutrition = {} as any;
    const want = ["Calories", "Protein", "Fat", "Carbohydrates", "Sugar", "Fiber", "Sodium"];
    want.forEach((k) => {
      const n = nutritionArray.find((x: any) => x.name === k);
      if (n) {
        const key = k.toLowerCase();
        nutrition[key] = { amount: n.amount, unit: n.unit };
      }
    });

    const normalized = {
      id: `spoonacular_${details.id}`,
      spoonacularId: details.id,
      name: title,
      image: details.image || null,
      prepTime: details.readyInMinutes || 0,
      preparationMinutes: details.preparationMinutes || 0,
      cookingMinutes: details.cookingMinutes || 0,
      servings,
      pricePerServing: details.pricePerServing ? (details.pricePerServing / 100) : null,
      cheap: !!details.cheap,
      healthScore: details.healthScore || null,
      spoonacularScore: details.spoonacularScore || details.spoonacularScore || null,
      diets: details.diets || [],
      cuisines: details.cuisines || [],
      dishTypes: details.dishTypes || [],
      flags: {
        vegetarian: !!details.vegetarian,
        vegan: !!details.vegan,
        glutenFree: !!details.glutenFree,
        dairyFree: !!details.dairyFree,
        ketogenic: !!details.ketogenic,
        lowFodmap: !!details.lowFodmap,
        sustainable: !!details.sustainable,
        veryHealthy: !!details.veryHealthy,
        veryPopular: !!details.veryPopular,
        whole30: !!details.whole30,
      },
      tags: buildTags(details),
      skillLevel: inferSkillLevel(details),
      leftoverFriendly: inferLeftoverFriendly(details),
      summary: (details.summary || "").replace(/<[^>]*>/g, ""),
      instructions: details.instructions || null,
      analyzedInstructions: details.analyzedInstructions || [],
      nutrition: Object.keys(nutrition).length ? nutrition : null,
      ingredients,
      sourceName: details.sourceName || null,
      sourceUrl: details.sourceUrl || null,
      spoonacularSourceUrl: details.spoonacularSourceUrl || details.spoonacularSource || null,
      importSource: "spoonacular",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // aggregate search text
    (normalized as any).searchText = `${normalized.name} ${(normalized.tags || []).join(" ")} ${(normalized.dishTypes || []).join(" ")}`;

    return normalized;
  };

  // Upsert into Firestore under doc id 'spoonacular_<id>'
  const upsertRecipe = async (recipeDoc: any) => {
    const ref = db.collection("recipes").doc(recipeDoc.id);
    await ref.set(recipeDoc, { merge: true });
    return recipeDoc.id;
  };

  // Main import loop per page
  for (let p = 0; p < pages; p++) {
    const offset = p * perPage;
    // Build complexSearch query string
    const params = [] as string[];
    if (filters.query) params.push(`query=${encodeURIComponent(filters.query)}`);
    if (filters.cuisine) params.push(`cuisine=${encodeURIComponent(filters.cuisine)}`);
    if (filters.diet) params.push(`diet=${encodeURIComponent(filters.diet)}`);
    if (filters.intolerances) params.push(`intolerances=${encodeURIComponent(filters.intolerances)}`);
    if (filters.includeIngredients) params.push(`includeIngredients=${encodeURIComponent(filters.includeIngredients)}`);
    if (filters.excludeIngredients) params.push(`excludeIngredients=${encodeURIComponent(filters.excludeIngredients)}`);
    if (filters.type) params.push(`type=${encodeURIComponent(filters.type)}`);
    if (filters.maxReadyTime) params.push(`maxReadyTime=${encodeURIComponent(filters.maxReadyTime)}`);
    if (filters.minServings) params.push(`minServings=${encodeURIComponent(filters.minServings)}`);
    if (filters.maxServings) params.push(`maxServings=${encodeURIComponent(filters.maxServings)}`);
    if (filters.sort) params.push(`sort=${encodeURIComponent(filters.sort)}`);
    if (filters.sortDirection) params.push(`sortDirection=${encodeURIComponent(filters.sortDirection)}`);
    params.push(`offset=${offset}`);
    params.push(`number=${perPage}`);
    params.push(`addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true&addRecipeInstructions=true&instructionsRequired=true`);

    const path = `/recipes/complexSearch?${params.join("&")}`;
    const searchData: any = await callSpoon(path);
    const results = searchData.results || [];

    const ids = results.map((r: any) => r.id).filter(Boolean);
    if (ids.length === 0) continue;

    // fetch in bulk
    const chunks: number[][] = [];
    for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

    for (const chunk of chunks) {
      const bulkPath = `/recipes/informationBulk?ids=${chunk.join(",")}&includeNutrition=true`;
        const bulkData: any = await callSpoon(bulkPath);
        const bulkResults: any[] = bulkData || [];

      for (const details of bulkResults) {
        // Validate essential fields
        if (!details.title || !details.servings || !details.readyInMinutes || !(details.extendedIngredients || details.ingredients)) {
          // fallback to single fetch
          try {
            const single = await callSpoon(`/recipes/${details.id}/information?includeNutrition=true`);
            Object.assign(details, single || {});
          } catch (e) {
            console.warn(`Skipping recipe ${details.id} due to missing fields`);
            continue;
          }
        }

        // SKIPPED: This was making 1 API call per ingredient = TOO EXPENSIVE!
        // The fillIngredients=true in complexSearch already gives us enough data
        // Each ingredient info call costs 2 points - with 20 recipes x 10 ingredients = 200 points!
        /*
        for (const ing of (details.extendedIngredients || details.ingredients || []) as any[]) {
          if ((!ing.estimatedCost || !ing.estimatedCost.value) && ing.id) {
            try {
              const ingInfo: any = await callSpoon(`/food/ingredients/${ing.id}/information`);
              if (ingInfo) {
                ing.estimatedCost = ingInfo.estimatedCost || ing.estimatedCost || null;
                ing.aisle = ing.aisle || ingInfo.aisle || null;
                ing.shoppingListUnits = ing.shoppingListUnits || ingInfo.shoppingListUnits || [];
                ing.possibleUnits = ing.possibleUnits || ingInfo.possibleUnits || [];
                ing.nutrition = ing.nutrition || ingInfo.nutrition || null;
                await sleep(120);
              }
            } catch (e) {
              // ignore ingredient enrich failure
            }
          }
        }
        */

        // Check if recipe is complete (only when completeOnly is true)
        if (completeOnly) {
          const completenessCheck = isCompleteRecipe(details);
          if (!completenessCheck.complete) {
            console.log(`Skipping incomplete recipe ${details.id}: ${completenessCheck.reasons.join(", ")}`);
            skipped.push({ 
              id: `spoonacular_${details.id}`, 
              spoonacularId: details.id,
              title: details.title,
              reasons: completenessCheck.reasons 
            });
            continue;
          }
        }

        const normalized = normalizeRecipe(details);
        await upsertRecipe(normalized);
        imported.push({ id: normalized.id, spoonacularId: normalized.spoonacularId });
      }
      // small delay between bulk calls
      await sleep(250);
    }
  }

  return { importedCount: imported.length, imported, skippedCount: skipped.length, skipped };
};

// HTTP proxy with CORS support for admin UI. Expects Authorization: Bearer <idToken>
export const importRecipesHttp = functions.https.onRequest(async (req, res) => {
  // Basic CORS handling
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

    const body = req.body || {};
    const filters = body.filters || {};
    const pages = parseInt(body.pages || '1', 10) || 1;
    const number = parseInt(body.number || '20', 10) || 20;
    const completeOnly = body.completeOnly !== undefined ? body.completeOnly : true;

    const result = await doImportRecipes(filters, pages, number, completeOnly);
    res.status(200).json(result);
    return;
  } catch (err: any) {
    console.error('importRecipesHttp error:', err);
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
