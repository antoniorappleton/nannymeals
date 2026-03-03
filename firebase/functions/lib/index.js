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
exports.exportHouseholdData = exports.buildGroceryList = exports.onFeedbackWrite = exports.weeklyPlanJob = void 0;
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
//# sourceMappingURL=index.js.map