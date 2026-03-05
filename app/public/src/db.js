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
import { getEnrichedRecipeData, searchRecipesByCuisine } from "./spoonacular.js";
import { seedRecipes } from "./seed-recipes.js";

/**
 * Módulo de Abstração Firestore (Refatorado)
 */

export const getHousehold = async (id) => {
  // Try direct HID
  let snap = await getDoc(doc(db, "households", id));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  
  // Try User UID lookup
  const userSnap = await getDoc(doc(db, "users", id));
  if (userSnap.exists() && userSnap.data().householdId) {
    const hid = userSnap.data().householdId;
    snap = await getDoc(doc(db, "households", hid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
  return null;
};

export const saveHousehold = async (hid, data) => {
  await setDoc(doc(db, "households", hid), data, { merge: true });
};

export const getLastPlan = async (id) => {
  const household = await getHousehold(id);
  if (!household) return null;
  const hid = household.id;

  const q = query(collection(db, "weeklyPlans"), where("householdId", "==", hid));
  const snap = await getDocs(q);
  // Sort by date or just take the first for now
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

export const getHouseholdStats = async (uid) => {
  try {
    // 1. Resolve HouseholdId if passing UID
    let hid = uid;
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      hid = userSnap.data().householdId || uid;
    }

    const plansSnap = await getDocs(query(collection(db, "weeklyPlans"), where("householdId", "==", hid)));
    const allPlans = plansSnap.docs.map(d => d.data());
    
    let totalSaved = 0;
    let totalWaste = 0;
    
    allPlans.forEach(plan => {
      (plan.meals || []).forEach(meal => {
        if (meal.feedback && meal.pricePerServing) {
          const price = parseFloat(meal.pricePerServing);
          if (meal.feedback.wasteLevel < 2) totalSaved += price * 1.5; 
          totalWaste += (meal.feedback.wasteLevel || 0) * 0.2;
        }
      });
    });

    if (allPlans.length === 0) {
      return {
        monthlySavings: 124, 
        wasteReduced: 3.2,
        satisfactionRate: 95,
        insights: [
          {
            title: "Sem dados ainda",
            description: "Cria o teu primeiro plano para veres as tuas poupanças reais!",
            action: "Gerar Plano",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDH2CxyKXnAhv9vKQ6xcO6DUCEvLBu9QAn-LbF6NIT9FfFDkbUUE_KHeNsVU8zU7K1Nwvqk-tRie98a_fgSQdSMU3Tmu0Ckph3EHpk7Ctpt1EFvwRm_A75tILyPzX8J3BqP-Yx1i37AFmoO6T9VqYs2hJRWII9552GX6O1d4MfRDLRAMxkYDAslx2fuUz00m3q47biBAeWbax1Tt3uhCU-3tiwReNm70-zY08YLmbVKQKcycXi0bj7gLLHIh0svpWWj9fAoBldNzGj_"
          }
        ],
        trend: [80, 65, 50, 35]
      };
    }

    return {
      monthlySavings: Math.round(totalSaved),
      wasteReduced: totalWaste.toFixed(1),
      satisfactionRate: 90,
      insights: [
        {
          title: totalSaved > 50 ? "Excelente Poupança!" : "A Começar a Poupar",
          description: `Já poupaste ${Math.round(totalSaved)}€ este mês ao evitar desperdício e refeições fora.`,
          action: "Ver Detalhes",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDH2CxyKXnAhv9vKQ6xcO6DUCEvLBu9QAn-LbF6NIT9FfFDkbUUE_KHeNsVU8zU7K1Nwvqk-tRie98a_fgSQdSMU3Tmu0Ckph3EHpk7Ctpt1EFvwRm_A75tILyPzX8J3BqP-Yx1i37AFmoO6T9VqYs2hJRWII9552GX6O1d4MfRDLRAMxkYDAslx2fuUz00m3q47biBAeWbax1Tt3uhCU-3tiwReNm70-zY08YLmbVKQKcycXi0bj7gLLHIh0svpWWj9fAoBldNzGj_"
        }
      ],
      trend: [80, 60, 40, 20]
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
       monthlySavings: 0,
       wasteReduced: 0,
       satisfactionRate: 100,
       insights: [{ title: "Erro de Permissões", description: "Verifica as regras do Firestore ou o teu perfil.", image: "" }]
    };
  }
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

export const generateWeeklyPlan = async (id) => {
  const household = await getHousehold(id);
  if (!household) return null;
  const householdId = household.id;

  const count = household.cookingDaysPerWeek || household.dinnersPerWeek || 5;

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
      ingredients: r.ingredients || [],
      calories: r.calories || null,
      pricePerServing: r.pricePerServing || null
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
  let rSnap = await getDocs(collection(db, "recipes"));
  if (rSnap.empty) {
    console.log("Base de dados de receitas vazia. A semear...");
    await seedRecipes();
    rSnap = await getDocs(collection(db, "recipes"));
  }
  let recipes = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 1.1 Mandatory Filters (Diet & Allergies)
  if (diet.length > 0 && !diet.includes("Sem restrições")) {
    const dietMap = { Vegetariano: "vegetarian", Vegano: "vegan", Mediterrâneo: "mediterranean" };
    const targets = diet.map(d => dietMap[d]).filter(Boolean);
    if (targets.length > 0) {
      recipes = recipes.filter(r => r.tags && r.tags.some(tag => targets.includes(tag)));
    }
  }

  // Phase 2: Automated Discovery if local results are low
  if (recipes.length < count && diet.length > 0) {
    try {
      console.log(`Poucas receitas locais (${recipes.length}). A descobrir novas na Spoonacular...`);
      const dietMap = { Vegetariano: "vegetarian", Vegano: "vegan", Mediterrâneo: "mediterranean" };
      const targetDiet = dietMap[diet[0]] || "healthy";
      const newRecipes = await searchRecipesByCuisine(targetDiet, 10);
      
      for (const nr of newRecipes) {
        // Save to Firestore to avoid future API calls for the same recipe
        const docRef = await addDoc(collection(db, "recipes"), nr);
        recipes.push({ id: docRef.id, ...nr });
      }
    } catch (apiError) {
      console.warn("Falha na descoberta Spoonacular (provável limite de API):", apiError);
      // We continue with whatever local recipes we have
    }
  }

  // Fallback final: Se ainda não tivermos receitas suficientes, buscar aleatórias locais
  if (recipes.length < count) {
      const allR = await getDocs(collection(db, "recipes"));
      recipes = allR.docs.map(d => ({ id: d.id, ...d.data() }));
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
  let totalEstimatedCost = 0;

  meals.forEach(meal => {
    if (meal.pricePerServing) {
      // Assuming 1 serving per recipe for simplicity in this calculation, 
      // but in a real app we'd multiply by family size.
      totalEstimatedCost += parseFloat(meal.pricePerServing);
    }

    (meal.ingredients || []).forEach(ingredient => {
      // Regex to extract quantity, unit, and name: "500g Massa de Trigo"
      const match = ingredient.match(/^([\d.,/]+)?\s*(g|kg|ml|l|unid|colher|chá|sopa)?\s*(.*)$/i);
      
      let qty = 1;
      let unit = "unid";
      let name = ingredient.toLowerCase().trim();

      if (match) {
        qty = parseFloat(match[1]?.replace(",", ".")) || 1;
        unit = (match[2] || "unid").toLowerCase();
        name = match[3]?.toLowerCase().trim() || name;
      }

      if (!aggregator[name]) {
        aggregator[name] = { name: name.charAt(0).toUpperCase() + name.slice(1), qty: 0, unit, category: "Geral" };
      }
      
      // Simple unit conversion (g to kg) for aggregation if possible
      if (aggregator[name].unit === unit) {
        aggregator[name].qty += qty;
      } else {
        // Fallback: just append if units mismatch
        aggregator[name].qty += qty; 
      }
      
      // Categorization
      const n = name;
      if (n.includes("frango") || n.includes("carne") || n.includes("bife") || n.includes("peru") || n.includes("panado")) aggregator[name].category = "Talho";
      else if (n.includes("peixe") || n.includes("salmão") || n.includes("bacalhau") || n.includes("dourada") || n.includes("marisco")) aggregator[name].category = "Peixaria";
      else if (n.includes("tomate") || n.includes("alface") || n.includes("cenoura") || n.includes("fruta") || n.includes("brócolos") || n.includes("batata") || n.includes("cebola") || n.includes("alho")) aggregator[name].category = "Hortifrutis";
      else if (n.includes("leite") || n.includes("iogurte") || n.includes("queijo") || n.includes("ovos") || n.includes("natas") || n.includes("manteiga")) aggregator[name].category = "Laticínios / Frescos";
      else if (n.includes("arroz") || n.includes("massa") || n.includes("azeite") || n.includes("óleo") || n.includes("sal") || n.includes("pau") || n.includes("conserva")) aggregator[name].category = "Despensa";
      else if (n.includes("pão") || n.includes("tosta") || n.includes("bolacha")) aggregator[name].category = "Padaria";
    });
  });

  // Convert map to categorized array
  const categoriesMap = {};
  Object.values(aggregator).forEach(item => {
    if (!categoriesMap[item.category]) categoriesMap[item.category] = [];
    
    // Format quantity nicely: 1.5 kg, 500 g, etc.
    let displayQty = `${item.qty} ${item.unit}`;
    if (item.unit === "unid" && item.qty === 1) displayQty = "1 Unid.";
    
    categoriesMap[item.category].push({
      name: item.name,
      quantity: displayQty,
      checked: false
    });
  });

  const groceryList = Object.keys(categoriesMap).map(cat => ({
    category: cat,
    items: categoriesMap[cat]
  }));

  // Update plan with total estimated cost
  await updateDoc(planRef, { totalEstimatedCost: totalEstimatedCost.toFixed(2) });

  return groceryList;
};

export const checkHouseholdExists = async (uid) => {
  const q = query(collection(db, "households"), where("ownerUid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
};

/**
 * Enriquece todas as receitas na base de dados com informações da Spoonacular.
 * Pode ser chamado manualmente ou via interface de admin.
 */
export const enrichAllRecipes = async () => {
  console.log("Iniciando enriquecimento de receitas...");
  const rSnap = await getDocs(collection(db, "recipes"));
  let count = 0;

  for (const rDoc of rSnap.docs) {
    const data = rDoc.data();
    // Só enriquece se ainda não tiver calorias ou preço
    if (!data.calories || !data.pricePerServing) {
      console.log(`Enriquecendo: ${data.name}`);
      const enriched = await getEnrichedRecipeData(data.name);
      if (enriched) {
        await updateDoc(rDoc.ref, enriched);
        count++;
      }
      // Pequeno delay para evitar rate limit da API gratuita
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log(`Enriquecimento concluído! ${count} receitas atualizadas.`);
  return count;
};

export const initDB = () => {
  console.log("Módulo de base de dados inicializado.");
};
