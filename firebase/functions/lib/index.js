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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichAllRecipes = exports.spoonacularProxy = exports.exportHouseholdData = exports.buildGroceryList = exports.onFeedbackWrite = exports.cleanupExpiredPlans = exports.weeklyPlanJob = void 0;
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
exports.enrichAllRecipes = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c, _d, _e;
    if (!request.auth || !isAdmin(request.auth)) {
        throw new https_1.HttpsError("permission-denied", "Only admin may trigger enrichment");
    }
    const rSnap = await db.collection("recipes").get();
    let count = 0;
    for (const rDoc of rSnap.docs) {
        const data = rDoc.data();
        if (!data.calories || !data.pricePerServing) {
            const searchData = await fetchSpoonacular(`/recipes/complexSearch?query=${encodeURIComponent(data.name)}&addRecipeInformation=true&number=1`);
            const details = (searchData.results && searchData.results[0]) || null;
            if (details) {
                const enriched = {
                    calories: Math.round(((_c = (_b = (_a = details.nutrition) === null || _a === void 0 ? void 0 : _a.nutrients) === null || _b === void 0 ? void 0 : _b.find((n) => n.name === "Calories")) === null || _c === void 0 ? void 0 : _c.amount) ||
                        (details.healthScore > 0 ? details.healthScore * 5 + 200 : 350)),
                    protein: ((_e = (_d = details.nutrition) === null || _d === void 0 ? void 0 : _d.nutrients) === null || _e === void 0 ? void 0 : _e.find((n) => n.name === "Protein"))
                        ? `${Math.round(details.nutrition.nutrients.find((n) => n.name === "Protein").amount)}g`
                        : "20g",
                    pricePerServing: (details.pricePerServing / 100).toFixed(2),
                    totalCost: ((details.pricePerServing * (details.servings || 1)) / 100).toFixed(2),
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
});
//# sourceMappingURL=index.js.map