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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncIngredientPrices = exports.migrateWeeklyPlansMembers = exports.importFromUrlHttp = exports.exportHouseholdData = exports.buildGroceryList = exports.onFeedbackWrite = exports.cleanupExpiredPlans = exports.weeklyPlanJob = void 0;
const functions = __importStar(require("firebase-functions"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
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
exports.buildGroceryList = (0, https_2.onCall)(async (request) => {
    const { planId } = request.data;
    if (!request.auth) {
        throw new https_2.HttpsError("unauthenticated", "User must be logged in.");
    }
    const planDoc = await db.collection("weeklyPlans").doc(planId).get();
    if (!planDoc.exists) {
        throw new https_2.HttpsError("not-found", "Plan not found.");
    }
    return { items: {} };
});
exports.exportHouseholdData = (0, https_2.onCall)(async (request) => {
    var _a;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid)
        throw new https_2.HttpsError("unauthenticated", "Auth required.");
    const household = await db.collection("households").doc(uid).get();
    const plans = await db.collection("weeklyPlans").where("householdId", "==", uid).get();
    return {
        household: household.data(),
        plans: plans.docs.map(d => d.data())
    };
});
const scraper_service_1 = require("./scraper-service");
function normalizeIngredientName(name) {
    if (!name)
        return "";
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
exports.importFromUrlHttp = (0, https_1.onRequest)({ cors: true, timeoutSeconds: 300, memory: "256MiB" }, async (req, res) => {
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
        let recipe;
        if (content) {
            recipe = (0, scraper_service_1.extractFromHtml)(content, url || '');
        }
        else if (url) {
            if (url.includes('continente.pt')) {
                recipe = await (0, scraper_service_1.extractFromContinente)(url);
            }
            else if (url.includes('pingodoce.pt')) {
                recipe = await (0, scraper_service_1.extractFromPingoDoce)(url);
            }
            else if (url.includes('auchan.pt')) {
                recipe = await (0, scraper_service_1.extractFromAuchan)(url);
            }
            else if (url.includes('minipreco.pt')) {
                recipe = await (0, scraper_service_1.extractFromMiniPreco)(url);
            }
            else if (url.includes('lidl.pt')) {
                recipe = await (0, scraper_service_1.extractFromLidl)(url);
            }
            else {
                res.status(400).json({ error: 'Unsupported URL source for automatic fetch' });
                return;
            }
        }
        if (!recipe) {
            res.status(500).json({ error: 'Failed to extract recipe data' });
            return;
        }
        if (storePreference && Array.isArray(recipe.ingredients)) {
            let totalCost = 0;
            const stores = ['continente', 'pingodoce', 'auchan', 'lidl'];
            const pricePromises = recipe.ingredients.map(async (ing) => {
                const normName = normalizeIngredientName(ing.name);
                if (!normName)
                    return;
                const price = await (0, scraper_service_1.getPriceInStore)(ing.name, storePreference);
                if (price) {
                    ing.price = price;
                    totalCost += price;
                }
                const docId = encodeURIComponent(normName).replace(/\./g, '%2E');
                const ingRef = db.collection("ingredients").doc(docId);
                const prices = {};
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
    }
    catch (err) {
        console.error('importFromUrlHttp error:', err);
        res.status(500).json({ error: err.message || String(err) });
    }
});
exports.migrateWeeklyPlansMembers = functions.https.onRequest((req, res) => {
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
                if (Array.isArray(plan.members))
                    continue;
                const householdId = plan.householdId;
                if (!householdId)
                    continue;
                const householdDoc = await db.collection('households').doc(householdId).get();
                const household = householdDoc.data();
                if (!household || !household.ownerUid)
                    continue;
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
        }
        catch (err) {
            console.error('migrateWeeklyPlansMembers error:', err);
            res.status(500).json({ error: err.message || String(err) });
        }
    });
});
exports.syncIngredientPrices = (0, https_1.onRequest)({ cors: true, timeoutSeconds: 540, memory: "512MiB" }, async (req, res) => {
    var _a;
    try {
        const authHeader = (req.headers.authorization || '').toString();
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing Auth' });
            return;
        }
        const idToken = authHeader.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (!decoded || decoded.email !== 'antonioappleton@gmail.com') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const recipesSnap = await db.collection("recipes").get();
        const uniqueIngredients = new Set();
        recipesSnap.forEach(doc => {
            const recipe = doc.data();
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach((ing) => {
                    let targetName = '';
                    if (typeof ing === 'string')
                        targetName = ing;
                    else if (ing.name)
                        targetName = ing.name;
                    if (targetName) {
                        const norm = normalizeIngredientName(targetName);
                        if (norm)
                            uniqueIngredients.add(norm);
                    }
                });
            }
        });
        const ingredientsToSync = Array.from(uniqueIngredients);
        const results = [];
        const stores = ['continente', 'pingodoce', 'auchan', 'lidl'];
        let processed = 0;
        for (const name of ingredientsToSync) {
            if (!name)
                continue;
            const docId = encodeURIComponent(name).replace(/\./g, '%2E');
            const ingRef = db.collection("ingredients").doc(docId);
            const ingDoc = await ingRef.get();
            if (ingDoc.exists) {
                const data = ingDoc.data();
                const lastUpdated = (_a = data === null || data === void 0 ? void 0 : data.lastUpdated) === null || _a === void 0 ? void 0 : _a.toDate();
                if (lastUpdated && (new Date().getTime() - lastUpdated.getTime()) < 3 * 24 * 60 * 60 * 1000) {
                    continue;
                }
            }
            const prices = {};
            for (const store of stores) {
                const price = await (0, scraper_service_1.getPriceInStore)(name, store);
                if (price !== null)
                    prices[store] = price;
            }
            await ingRef.set({
                name,
                prices,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            results.push({ name, prices });
            processed++;
            if (processed >= 30)
                break;
        }
        res.status(200).json({ success: true, processed, totalUnique: ingredientsToSync.length, results });
    }
    catch (err) {
        console.error('syncIngredientPrices error:', err);
        res.status(500).json({ error: err.message || String(err) });
    }
});
//# sourceMappingURL=index.js.map