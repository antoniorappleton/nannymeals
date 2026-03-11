"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateWeeklyPlansMembers = exports.importRecipesHttp = exports.importRecipes = exports.enrichAllRecipesHttp = exports.enrichAllRecipes = exports.spoonacularProxy = exports.exportHouseholdData = exports.buildGroceryList = exports.onFeedbackWrite = exports.cleanupExpiredPlans = exports.weeklyPlanJob = void 0;
const functions = __importStar(require("firebase-functions"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
exports.weeklyPlanJob = (0, scheduler_1.onSchedule)("0 6 * * 1", async (event) => {
    const households = await db.collection("households").get();
    for (const doc of households.docs) {
        const hid = doc.id;
        const settings = doc.data();
        console.log(`Generating plan for household: ${hid}`);
    }
});
exports.cleanupExpiredPlans = (0, scheduler_1.onSchedule)("0 2 * * *", async (event) => {
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
exports.onFeedbackWrite = (0, firestore_1.onDocumentCreated)("feedback/{fid}", async (event) => {
    var _a;
    const feedback = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!feedback)
        return;
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
        if (stress > 3) {
            state.tagWeights["quick"] = (state.tagWeights["quick"] || 0) + 1;
        }
        if (rating >= 4) {
            state.recipeWeights[feedback.recipeId] = (state.recipeWeights[feedback.recipeId] || 0) + 1;
        }
        t.set(stateRef, state, { merge: true });
    });
});
exports.buildGroceryList = (0, https_1.onCall)(async (request) => {
    const { householdId, planId } = request.data;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be logged in.");
    }
    const planDoc = await db.collection("weeklyPlans").doc(planId).get();
    if (!planDoc.exists) {
        throw new https_1.HttpsError("not-found", "Plan not found.");
    }
    const plan = planDoc.data();
    const aggregatedItems = {};
    return { items: aggregatedItems };
});
exports.exportHouseholdData = (0, https_1.onCall)(async (request) => {
    var _a;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Auth required.");
    const household = await db.collection("households").doc(uid).get();
    const plans = await db.collection("weeklyPlans").where("householdId", "==", uid).get();
    return {
        household: household.data(),
        plans: plans.docs.map(d => d.data())
    };
});
const SPOON_API_BASE = "https://api.spoonacular.com";
let SPOON_API_KEY = process.env.SPOONACULAR_API_KEY || "";
if (!SPOON_API_KEY) {
    try {
        const cfg = functions.config();
        if (cfg && cfg.spoonacular && cfg.spoonacular.key) {
            SPOON_API_KEY = cfg.spoonacular.key;
        }
    }
    catch (e) {
        console.warn("Unable to load Spoonacular config from functions.config():", e);
    }
}
function isAdmin(auth) {
    return auth && auth.token && auth.token.email === "antonioappleton@gmail.com";
}
async function fetchSpoonacular(path, opts = {}) {
    if (!SPOON_API_KEY) {
        throw new Error("Spoonacular key not configured");
    }
    const url = `${SPOON_API_BASE}${path}${path.includes("?") ? "&" : "?"}apiKey=${SPOON_API_KEY}`;
    const response = await fetch(url, opts);
    if (response.status === 402) {
        throw new https_1.HttpsError("resource-exhausted", "Spoonacular daily limit reached");
    }
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Spoonacular error ${response.status}: ${text}`);
    }
    return response.json();
}
exports.spoonacularProxy = (0, https_1.onCall)(async (request) => {
    if (!request.auth || !isAdmin(request.auth)) {
        throw new https_1.HttpsError("permission-denied", "Only admin may call Spoonacular API");
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
            throw new https_1.HttpsError("invalid-argument", `Unknown action: ${action}`);
    }
});
const doEnrichAllRecipes = async () => {
    var _a, _b, _c, _d, _e;
    const rSnap = await db.collection("recipes").get();
    let count = 0;
    for (const rDoc of rSnap.docs) {
        const data = rDoc.data();
        if (!data.calories || !data.pricePerServing) {
            const searchData = await fetchSpoonacular(`/recipes/complexSearch?query=${encodeURIComponent(data.name)}&addRecipeInformation=true&number=1`);
            const details = (searchData.results && searchData.results[0]) || null;
            if (details) {
                const usdToEur = 0.92 * 1.023;
                const priceEur = details.pricePerServing ? (details.pricePerServing / 100) * usdToEur : null;
                const totalCostEur = details.pricePerServing && details.servings ? (details.pricePerServing * details.servings / 100) * usdToEur : null;
                const enriched = {
                    calories: Math.round(((_c = (_b = (_a = details.nutrition) === null || _a === void 0 ? void 0 : _a.nutrients) === null || _b === void 0 ? void 0 : _b.find((n) => n.name === "Calories")) === null || _c === void 0 ? void 0 : _c.amount) ||
                        (details.healthScore > 0 ? details.healthScore * 5 + 200 : 350)),
                    protein: ((_e = (_d = details.nutrition) === null || _d === void 0 ? void 0 : _d.nutrients) === null || _e === void 0 ? void 0 : _e.find((n) => n.name === "Protein"))
                        ? `${Math.round(details.nutrition.nutrients.find((n) => n.name === "Protein").amount)}g`
                        : "20g",
                    pricePerServing: priceEur ? priceEur.toFixed(2) : null,
                    totalCost: totalCostEur ? totalCostEur.toFixed(2) : null,
                    servings: details.servings || 1,
                    image: details.image,
                    spoonacularId: details.id,
                    spoonacularSource: details.sourceUrl,
                };
                await rDoc.ref.update(enriched);
                count++;
                await new Promise((r) => setTimeout(r, 500));
            }
        }
    }
    return { updated: count };
};
exports.enrichAllRecipes = (0, https_1.onCall)(async (request) => {
    if (!request.auth || !isAdmin(request.auth)) {
        throw new https_1.HttpsError("permission-denied", "Only admin may trigger enrichment");
    }
    return await doEnrichAllRecipes();
});
exports.enrichAllRecipesHttp = functions.https.onRequest(async (req, res) => {
    const origin = req.headers.origin || '*';
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
        const result = await doEnrichAllRecipes();
        res.status(200).json(result);
        return;
    }
    catch (err) {
        console.error('enrichAllRecipesHttp error:', err);
        res.status(500).json({ error: err.message || String(err) });
        return;
    }
});
exports.importRecipes = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    const filters = ((_a = request.data) === null || _a === void 0 ? void 0 : _a.filters) || {};
    const pages = parseInt(((_b = request.data) === null || _b === void 0 ? void 0 : _b.pages) || "1", 10) || 1;
    const number = parseInt(((_c = request.data) === null || _c === void 0 ? void 0 : _c.number) || "20", 10) || 20;
    if (!request.auth || !isAdmin(request.auth)) {
        throw new https_1.HttpsError("permission-denied", "Only admin may import recipes");
    }
    return await doImportRecipes(filters, pages, number);
});
const doImportRecipes = async (filters, pagesIn, numberIn, completeOnly = true) => {
    const pages = pagesIn || 1;
    const perPage = Math.min(numberIn || 20, 50);
    const imported = [];
    const skipped = [];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const callSpoon = async (path, attempt = 0) => {
        try {
            return await fetchSpoonacular(path);
        }
        catch (err) {
            if (attempt < 3) {
                const backoff = 500 * Math.pow(2, attempt);
                console.warn(`Spoonacular call failed, retrying in ${backoff}ms`, err.message || err);
                await sleep(backoff);
                return callSpoon(path, attempt + 1);
            }
            throw err;
        }
    };
    const isCompleteRecipe = (details) => {
        const reasons = [];
        if (!details.image) {
            reasons.push("Sem imagem");
        }
        const ingredients = details.extendedIngredients || details.ingredients || [];
        if (!ingredients || ingredients.length === 0) {
            reasons.push("Sem ingredientes");
        }
        else {
            const ingredientsWithData = ingredients.filter((ing) => ing.amount && ing.unit);
            if (ingredientsWithData.length === 0) {
                reasons.push("Ingredientes sem quantidades/unidades");
            }
        }
        const hasInstructions = details.instructions && details.instructions.length > 0;
        const hasAnalyzedInstructions = details.analyzedInstructions &&
            details.analyzedInstructions.length > 0 &&
            details.analyzedInstructions.some((inst) => inst.steps && inst.steps.length > 0);
        if (!hasInstructions && !hasAnalyzedInstructions) {
            reasons.push("Sem instruções");
        }
        return {
            complete: reasons.length === 0,
            reasons
        };
    };
    const normalizeRecipe = (details) => {
        var _a;
        const title = details.title || details.name || "";
        const servings = details.servings || 1;
        const readyInMinutes = details.readyInMinutes || details.preparationMinutes || details.cookingMinutes || 0;
        const ingredients = (details.extendedIngredients || details.ingredients || []).map((ing) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const measures = ing.measures || ing.measure || {};
            return {
                spoonacularIngredientId: ing.id || null,
                name: ing.name || ing.originalName || (ing.original || "").split(" ").slice(1).join(" ") || "",
                originalName: ing.originalName || ing.name || ing.original || "",
                original: ing.original || ing.originalString || ing.raw || "",
                amount: ing.amount || ((_b = (_a = ing.measures) === null || _a === void 0 ? void 0 : _a.metric) === null || _b === void 0 ? void 0 : _b.amount) || null,
                unit: ing.unit || ing.unitLong || (measures.metric && measures.metric.unitShort) || null,
                aisle: ing.aisle || null,
                consistency: ing.consistency || null,
                image: ing.image || null,
                meta: ing.meta || ing.metaInformation || [],
                measures: {
                    metric: {
                        amount: (_d = (_c = measures.metric) === null || _c === void 0 ? void 0 : _c.amount) !== null && _d !== void 0 ? _d : null,
                        unitLong: (_f = (_e = measures.metric) === null || _e === void 0 ? void 0 : _e.unitLong) !== null && _f !== void 0 ? _f : null,
                        unitShort: (_h = (_g = measures.metric) === null || _g === void 0 ? void 0 : _g.unitShort) !== null && _h !== void 0 ? _h : null,
                    },
                    us: {
                        amount: (_k = (_j = measures.us) === null || _j === void 0 ? void 0 : _j.amount) !== null && _k !== void 0 ? _k : null,
                        unitLong: (_m = (_l = measures.us) === null || _l === void 0 ? void 0 : _l.unitLong) !== null && _m !== void 0 ? _m : null,
                        unitShort: (_p = (_o = measures.us) === null || _o === void 0 ? void 0 : _o.unitShort) !== null && _p !== void 0 ? _p : null,
                    },
                },
                estimatedCost: ing.estimatedCost || (((_q = ing.estimatedCost) === null || _q === void 0 ? void 0 : _q.value) ? ing.estimatedCost : null) || null,
                shoppingListUnits: ing.shoppingListUnits || [],
                possibleUnits: ing.possibleUnits || [],
                nutrition: ing.nutrition || null,
            };
        });
        const inferSkillLevel = (r) => {
            const numIng = (r.extendedIngredients || r.ingredients || []).length;
            const time = r.readyInMinutes || 0;
            if (time <= 20 && numIng <= 6)
                return "beginner";
            if (time <= 45 && numIng <= 10)
                return "intermediate";
            return "advanced";
        };
        const inferLeftoverFriendly = (r) => {
            const servingsLocal = r.servings || 1;
            const dishTypes = r.dishTypes || [];
            const tags = dishTypes.map((d) => d.toLowerCase());
            if (servingsLocal >= 4)
                return true;
            if (tags.includes("meal prep") || tags.includes("batch"))
                return true;
            return false;
        };
        const buildTags = (r) => {
            const t = [];
            const flags = {
                vegetarian: r.vegetarian,
                vegan: r.vegan,
                "gluten-free": r.glutenFree,
                "dairy-free": r.dairyFree,
                ketogenic: r.ketogenic,
                "low-fodmap": r.lowFodmap,
                whole30: r.whole30,
            };
            Object.keys(flags).forEach((k) => { if (flags[k])
                t.push(k); });
            if (r.dishTypes)
                t.push(...r.dishTypes.map((d) => d.toLowerCase()));
            if (r.cuisines)
                t.push(...r.cuisines.map((c) => c.toLowerCase()));
            if (r.cheap)
                t.push("cheap");
            if ((r.readyInMinutes || 0) <= 20)
                t.push("quick");
            if ((r.servings || 1) >= 4)
                t.push("family-friendly");
            return Array.from(new Set(t));
        };
        const nutritionArray = ((_a = details.nutrition) === null || _a === void 0 ? void 0 : _a.nutrients) || [];
        const nutrition = {};
        const want = ["Calories", "Protein", "Fat", "Carbohydrates", "Sugar", "Fiber", "Sodium"];
        want.forEach((k) => {
            const n = nutritionArray.find((x) => x.name === k);
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
            createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
            createdAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        normalized.searchText = `${normalized.name} ${(normalized.tags || []).join(" ")} ${(normalized.dishTypes || []).join(" ")}`;
        return normalized;
    };
    const upsertRecipe = async (recipeDoc) => {
        const ref = db.collection("recipes").doc(recipeDoc.id);
        await ref.set(recipeDoc, { merge: true });
        return recipeDoc.id;
    };
    for (let p = 0; p < pages; p++) {
        const offset = p * perPage;
        const params = [];
        if (filters.query)
            params.push(`query=${encodeURIComponent(filters.query)}`);
        if (filters.cuisine)
            params.push(`cuisine=${encodeURIComponent(filters.cuisine)}`);
        if (filters.diet)
            params.push(`diet=${encodeURIComponent(filters.diet)}`);
        if (filters.intolerances)
            params.push(`intolerances=${encodeURIComponent(filters.intolerances)}`);
        if (filters.includeIngredients)
            params.push(`includeIngredients=${encodeURIComponent(filters.includeIngredients)}`);
        if (filters.excludeIngredients)
            params.push(`excludeIngredients=${encodeURIComponent(filters.excludeIngredients)}`);
        if (filters.type)
            params.push(`type=${encodeURIComponent(filters.type)}`);
        if (filters.maxReadyTime)
            params.push(`maxReadyTime=${encodeURIComponent(filters.maxReadyTime)}`);
        if (filters.minServings)
            params.push(`minServings=${encodeURIComponent(filters.minServings)}`);
        if (filters.maxServings)
            params.push(`maxServings=${encodeURIComponent(filters.maxServings)}`);
        if (filters.sort)
            params.push(`sort=${encodeURIComponent(filters.sort)}`);
        if (filters.sortDirection)
            params.push(`sortDirection=${encodeURIComponent(filters.sortDirection)}`);
        params.push(`offset=${offset}`);
        params.push(`number=${perPage}`);
        params.push(`addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true&addRecipeInstructions=true&instructionsRequired=true`);
        const path = `/recipes/complexSearch?${params.join("&")}`;
        const searchData = await callSpoon(path);
        const results = searchData.results || [];
        const ids = results.map((r) => r.id).filter(Boolean);
        if (ids.length === 0)
            continue;
        const chunks = [];
        for (let i = 0; i < ids.length; i += 50)
            chunks.push(ids.slice(i, i + 50));
        for (const chunk of chunks) {
            const bulkPath = `/recipes/informationBulk?ids=${chunk.join(",")}&includeNutrition=true`;
            const bulkData = await callSpoon(bulkPath);
            const bulkResults = bulkData || [];
            for (const details of bulkResults) {
                if (!details.title || !details.servings || !details.readyInMinutes || !(details.extendedIngredients || details.ingredients)) {
                    try {
                        const single = await callSpoon(`/recipes/${details.id}/information?includeNutrition=true`);
                        Object.assign(details, single || {});
                    }
                    catch (e) {
                        console.warn(`Skipping recipe ${details.id} due to missing fields`);
                        continue;
                    }
                }
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
            await sleep(250);
        }
    }
    return { importedCount: imported.length, imported, skippedCount: skipped.length, skipped };
};
exports.importRecipesHttp = functions.https.onRequest(async (req, res) => {
    const origin = req.headers.origin || '*';
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
        const body = req.body || {};
        const filters = body.filters || {};
        const pages = parseInt(body.pages || '1', 10) || 1;
        const number = parseInt(body.number || '20', 10) || 20;
        const completeOnly = body.completeOnly !== undefined ? body.completeOnly : true;
        const result = await doImportRecipes(filters, pages, number, completeOnly);
        res.status(200).json(result);
        return;
    }
    catch (err) {
        console.error('importRecipesHttp error:', err);
        res.status(500).json({ error: err.message || String(err) });
        return;
    }
});
exports.migrateWeeklyPlansMembers = functions.https.onRequest(async (req, res) => {
    const origin = req.headers.origin || '*';
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
            if (Array.isArray(plan.members)) {
                console.log(`Plan ${planDoc.id} already has members, skipping`);
                continue;
            }
            const householdId = plan.householdId;
            if (!householdId) {
                console.warn(`Plan ${planDoc.id} has no householdId, skipping`);
                continue;
            }
            const householdDoc = await db
                .collection('households')
                .doc(householdId)
                .get();
            const household = householdDoc.data();
            if (!household || !household.ownerUid) {
                console.warn(`Household ${householdId} not found or missing ownerUid, skipping plan ${planDoc.id}`);
                continue;
            }
            const members = household.members || [household.ownerUid];
            if (!members.includes(household.ownerUid)) {
                members.push(household.ownerUid);
            }
            await planDoc.ref.update({ members });
            migrated++;
            console.log(`Migrated plan ${planDoc.id} with members: ${members.join(', ')}`);
        }
        res.status(200).json({
            success: true,
            message: `Migrated ${migrated} plans`,
            migrated,
            total: plansSnap.size,
        });
    }
    catch (err) {
        console.error('migrateWeeklyPlansMembers error:', err);
        res.status(500).json({ error: err.message || String(err) });
    }
});
//# sourceMappingURL=index.js.map