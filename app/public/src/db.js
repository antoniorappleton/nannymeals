import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp
} from "./firebase-init.js";

/**
 * Módulo de Abstração Firestore (Refatorado)
 */

export const getHousehold = async (hid) => {
  const snap = await getDoc(doc(db, "households", hid));
  return snap.exists() ? snap.data() : null;
};

export const saveHousehold = async (hid, data) => {
  await setDoc(doc(db, "households", hid), data, { merge: true });
};

export const getLastPlan = async (hid) => {
  const q = query(collection(db, "weeklyPlans"), where("householdId", "==", hid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))[0];
};

export const submitMealFeedback = async (planId, mealIndex, feedback) => {
  const planRef = doc(db, "weeklyPlans", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) return;

  const meals = planSnap.data().meals;
  meals[mealIndex].feedback = {
    ...feedback,
    timestamp: new Date().toISOString()
  };

  await updateDoc(planRef, { meals });
  
  // Also log to global feedback for analysis
  await addDoc(collection(db, "feedback"), {
    planId,
    mealIndex,
    recipeId: meals[mealIndex].recipeId,
    ...feedback,
    timestamp: serverTimestamp(),
  });
};

export const swapMeal = async (planId, mealIndex, newRecipeId, reason) => {
  const recipe = await getRecipe(newRecipeId);
  if (!recipe) return;

  const planRef = doc(db, "weeklyPlans", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) return;

  const meals = planSnap.data().meals;
  const oldMeal = meals[mealIndex];

  meals[mealIndex] = {
    recipeId: newRecipeId,
    recipeName: recipe.name,
    prepTime: recipe.prepTime,
    completed: false,
    isReplacement: true,
    replacedReason: reason,
    originalRecipeId: oldMeal.recipeId
  };

  await updateDoc(planRef, { meals });
};

export const getHouseholdStats = async (hid) => {
  // In a real app, this might be a complex aggregation.
  // For this UI demo, we'll return mock data or fetch from a stats doc.
  const statsRef = doc(db, "households", hid, "stats", "current");
  const snap = await getDoc(statsRef);
  
  if (snap.exists()) return snap.data();
  
  // Default mock stats for the UI
  return {
    monthlySavings: 124,
    wasteReduced: 3.2,
    satisfactionRate: 95,
    insights: [
      {
        title: "Too much Spinach",
        description: "You've consistently had 200g leftover every week this month.",
        action: "Adjust Next Order",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDH2CxyKXnAhv9vKQ6xcO6DUCEvLBu9QAn-LbF6NIT9FfFDkbUUE_KHeNsVU8zU7K1Nwvqk-tRie98a_fgSQdSMU3Tmu0Ckph3EHpk7Ctpt1EFvwRm_A75tILyPzX8J3BqP-Yx1i37AFmoO6T9VqYs2hJRWII9552GX6O1d4MfRDLRAMxkYDAslx2fuUz00m3q47biBAeWbax1Tt3uhCU-3tiwReNm70-zY08YLmbVKQKcycXi0bj7gLLHIh0svpWWj9fAoBldNzGj_"
      }
    ],
    trend: [80, 65, 50, 35] // Waste trend over weeks
  };
};

export const getRecipe = async (rid) => {
  const snap = await getDoc(doc(db, "recipes", rid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const syncUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: serverTimestamp(),
    },
    { merge: true },
  );
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export const createHousehold = async (ownerUid, data) => {
  const householdRef = doc(collection(db, "households"));
  const householdId = householdRef.id;

  await setDoc(householdRef, {
    ...data,
    ownerUid,
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", ownerUid);
  await setDoc(userRef, { householdId }, { merge: true });

  return householdId;
};

export const generateWeeklyPlan = async (householdId) => {
  const hSnap = await getDoc(doc(db, "households", householdId));
  if (!hSnap.exists()) return null;

  const hData = hSnap.data();
  const count = hData.cookingDaysPerWeek || hData.dinnersPerWeek || 5;

  // 1. Get weighted recommendations
  const selected = await getMealRecommendations(householdId, count);

  if (!selected || selected.length === 0) {
    console.error("Nenhuma receita encontrada para os filtros aplicados.");
    return null;
  }

  const newPlan = {
    householdId,
    createdAt: serverTimestamp(),
    status: "active",
    meals: selected.map((r) => ({
      recipeId: r.id,
      recipeName: r.name,
      prepTime: r.prepTime,
      completed: false,
      ingredients: r.ingredients || [] // Store ingredients in the plan for easy list generation
    })),
  };

  const docRef = await addDoc(collection(db, "weeklyPlans"), newPlan);
  
  // 2. Generate and store grocery list for this plan
  const groceryList = await generateGroceryListFromPlan(docRef.id);
  await updateDoc(docRef, { groceryList });

  return { id: docRef.id, ...newPlan, groceryList };
};

/**
 * Algoritmo de recomendação ponderado
 */
export const getMealRecommendations = async (householdId, count) => {
  const hSnap = await getDoc(doc(db, "households", householdId));
  if (!hSnap.exists()) return [];
  const hData = hSnap.data();

  // Filters
  const diet = hData.dietStyle || hData.dietaryPreferences || [];
  const allergies = hData.allergies || [];
  const maxTime = hData.cookingTimeWeekday || 60;

  // 1. Fetch all recipes
  const rSnap = await getDocs(collection(db, "recipes"));
  let recipes = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 1.1 Mandatory Filters (Diet & Allergies)
  if (diet.length > 0 && !diet.includes("Sem restrições")) {
    const dietMap = { Vegetariano: "vegetarian", Vegano: "vegan", Mediterrâneo: "mediterranean" };
    const targets = diet.map(d => dietMap[d]).filter(Boolean);
    if (targets.length > 0) {
      recipes = recipes.filter(r => r.tags && r.tags.some(tag => targets.includes(tag)));
    }
  }

  if (allergies.length > 0) {
    recipes = recipes.filter(r => {
      const ingredientsStr = (r.ingredients || []).join(" ").toLowerCase();
      return !allergies.some(a => ingredientsStr.includes(a.toLowerCase()));
    });
  }

  // 2. Scoring (Heuristics)
  // Fetch historical feedback for scoring
  const fSnap = await getDocs(query(collection(db, "feedback"), where("recipeId", "!=", ""))); 
  const historicalFeedback = fSnap.docs.map(d => d.data());

  const scoredRecipes = recipes.map(r => {
    let score = 100; // Base score

    // Heuristic: Prep Time
    if (r.prepTime <= maxTime) score += 20;
    if (r.prepTime > maxTime + 10) score -= 30;

    // Heuristic: Feedback
    const recipeFeedbacks = historicalFeedback.filter(f => f.recipeId === r.id);
    if (recipeFeedbacks.length > 0) {
      const avgKidsLiked = recipeFeedbacks.reduce((acc, f) => acc + (f.kidsLiked ? 1 : 0), 0) / recipeFeedbacks.length;
      const totalWaste = recipeFeedbacks.reduce((acc, f) => acc + (f.wasteLevel || 0), 0);
      
      score += avgKidsLiked * 50;
      score -= totalWaste * 10;
    }

    // Heuristic: Variety (avoid repeats from extremely recent plans)
    // (Could be implemented by checking last 2 weeklyPlans)

    return { ...r, calculatedScore: score };
  });

  // 3. Weighted Random Selection
  return scoredRecipes
    .sort((a, b) => b.calculatedScore - a.calculatedScore)
    .slice(0, count * 2) // Take a larger pool
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, count); // Final selection
};

/**
 * Gerador de lista de compras agregada
 */
export const generateGroceryListFromPlan = async (planId) => {
  const planRef = doc(db, "weeklyPlans", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) return [];

  const meals = planSnap.data().meals;
  const aggregator = {};

  // Example implementation of ingredient parsing/aggregation
  meals.forEach(meal => {
    (meal.ingredients || []).forEach(ingredient => {
      // Basic normalization: "200g Massa" -> { name: "Massa", amount: 200, unit: "g" }
      // For this demo, we'll just group by name if they are simple strings
      const name = ingredient.toLowerCase().trim();
      if (!aggregator[name]) {
        aggregator[name] = { name: ingredient, count: 0, category: "Geral" };
      }
      aggregator[name].count += 1;
      
      // Attempt rudimentary categorization based on keywords
      if (name.includes("frango") || name.includes("carne") || name.includes("salmão") || name.includes("peixe")) {
        aggregator[name].category = "Talho / Peixaria";
      } else if (name.includes("tomate") || name.includes("alface") || name.includes("cenoura") || name.includes("fruta") || name.includes("brócolos") || name.includes("limão")) {
        aggregator[name].category = "Hortifrutis";
      } else if (name.includes("arroz") || name.includes("massa") || name.includes("azeite") || name.includes("sal") || name.includes("taco")) {
        aggregator[name].category = "Despensa";
      }
    });
  });

  // Convert map to categorized array
  const categories = {};
  Object.values(aggregator).forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push({
      name: item.name,
      quantity: item.count > 1 ? `${item.count} UNID/PACKS` : "1 UNID/PACK",
      checked: false
    });
  });

  return Object.keys(categories).map(cat => ({
    category: cat,
    items: categories[cat]
  }));
};

export const checkHouseholdExists = async (uid) => {
  const q = query(collection(db, "households"), where("ownerUid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
};

export const initDB = () => {
  console.log("Módulo de base de dados inicializado.");
};
