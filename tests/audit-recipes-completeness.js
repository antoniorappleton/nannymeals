/**
 * NannyMeals - Audit Recipes Completeness
 * Run: node tests/audit-recipes-completeness.js
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase config - UPDATE WITH YOUR PROJECT CONFIG
const firebaseConfig = {
  // Get from firebase-init.js or firebase.json
  apiKey: "AIzaSyD...",
  authDomain: "nannymeal-d966b.firebaseapp.com",
  projectId: "nannymeal-d966b",
  // ... full config needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// CRITERIA FOR COMPLETE RECIPE
function isComplete(recipe) {
  const issues = [];

  // 1. Must be in English (name check - simple heuristic)
  if (
    !recipe.name ||
    !/^[A-Z][a-z]/.test(recipe.name) ||
    recipe.name.match(/ç|ã|ó|é|í|ú/)
  ) {
    issues.push("NOT_ENGLISH");
  }

  // 2. Preparation steps
  if (
    !recipe.analyzedInstructions?.length ||
    !recipe.analyzedInstructions[0]?.steps?.length
  ) {
    issues.push("MISSING_STEPS");
  }

  // 3. Ingredients with quantities (ALL must have amount & unit, no null/q.b.)
  const allIngredientsComplete = (recipe.ingredients || []).every(
    (ing) =>
      ing.amount != null &&
      ing.amount > 0 &&
      ing.unit &&
      ing.unit !== "q.b." &&
      ing.unit !== null,
  );
  if (!allIngredientsComplete) {
    issues.push("INCOMPLETE_INGREDIENTS");
  }

  // 4. Nutritional values
  if (
    !recipe.nutrition?.calories?.amount ||
    recipe.nutrition.calories.amount <= 0
  ) {
    issues.push("MISSING_NUTRITION");
  }

  return {
    complete: issues.length === 0,
    issues,
    recipeId: recipe.id,
    name: recipe.name,
    ingredientCount: recipe.ingredients?.length || 0,
    stepCount: recipe.analyzedInstructions?.[0]?.steps?.length || 0,
  };
}

async function audit() {
  console.log("🔍 Auditing recipes completeness...\n");

  try {
    // Auth required by rules
    await signInAnonymously(auth);
    console.log("✅ Authenticated anonymously");

    const recipesSnap = await getDocs(collection(db, "recipes"));
    const recipes = recipesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 TOTAL RECIPES: ${recipes.length}\n`);

    const incomplete = [];
    let completeCount = 0;

    recipes.forEach((recipe) => {
      const status = isComplete(recipe);
      if (status.complete) {
        completeCount++;
      } else {
        incomplete.push(status);
      }
    });

    console.log(`✅ COMPLETE: ${completeCount}`);
    console.log(`❌ INCOMPLETE: ${incomplete.length}\n`);

    console.log("DELETION CANDIDATES (INCOMPLETE):");
    incomplete.forEach((r) => {
      console.log(`  ❌ ${r.recipeId}: "${r.name}"`);
      console.log(`     Issues: ${r.issues.join(", ")}`);
      console.log(
        `     Steps: ${r.stepCount}, Ingredients: ${r.ingredientCount}`,
      );
      console.log("");
    });

    // Export IDs for cleanup
    const deleteIds = incomplete.map((r) => r.recipeId);
    console.log("🚮 IDs TO DELETE:", deleteIds.join(", "));
    console.log("\n📋 Copy this for cleanup script:");
    console.log(`const IDS_TO_DELETE = ['${deleteIds.join("','")}'];`);

    return { completeCount, incompleteCount: incomplete.length, deleteIds };
  } catch (error) {
    console.error("❌ Audit failed:", error);
    return null;
  }
}

// Run if direct
if (import.meta.url === `file://${process.argv[1]}`) {
  audit().then((result) => {
    console.log("\n✅ Audit complete!");
    process.exit(result ? 0 : 1);
  });
}

export { audit, isComplete };
