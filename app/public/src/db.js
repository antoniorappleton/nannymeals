 import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "./firebase-init.js";
import {
  getEnrichedRecipeData,
  searchRecipesByCuisine,
} from "./spoonacular.js";
import { seedRecipes } from "./seed-recipes.js";

/**
 * Módulo de Abstração Firestore (Refatorado)
 */

export const getHousehold = async (id) => {
  try {
    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);

    // Se o utilizador tem householdId registado
    if (userSnap.exists() && userSnap.data().householdId) {
      const hid = userSnap.data().householdId;
      const householdRef = doc(db, "households", hid);
      const householdSnap = await getDoc(householdRef);

      if (householdSnap.exists()) {
        return { id: householdSnap.id, ...householdSnap.data() };
      }
    }

    // Fallback: tentar directamente como householdId
    const snap = await getDoc(doc(db, "households", id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // Se chegou aqui, não tem household - CRIAR AUTOMATICAMENTE
    console.log(
      "Nenhuma household encontrada. A criar uma nova automaticamente...",
    );
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Utilizador não autenticado");
    }

    const newHouseholdId = await createHousehold(currentUser.uid, {
      name: `Família de ${currentUser.displayName || currentUser.email}`,
      dietaryPreferences: [],
      allergies: [],
      members: [], // Será preenchido quando outros membros aderirem
      createdAt: serverTimestamp(),
    });

    // Retornar a household recém criada
    const newSnap = await getDoc(doc(db, "households", newHouseholdId));
    return newSnap.exists() ? { id: newSnap.id, ...newSnap.data() } : null;
  } catch (error) {
    console.error("getHousehold error:", error);
    throw error;
  }
};

export const saveHousehold = async (hid, data) => {
  await setDoc(doc(db, "households", hid), data, { merge: true });
};

export const getLastPlan = async (id) => {
  const household = await getHousehold(id);
  if (!household) return null;
  const hid = household.id;

  const q = query(
    collection(db, "weeklyPlans"),
    where("householdId", "==", hid),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;

  // Sort in memory to avoid "Index still building" errors
  const plans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  plans.sort((a, b) => {
    const timeA = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : a.createdAt || 0;
    const timeB = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : b.createdAt || 0;
    return timeB - timeA;
  });

  return plans[0];
};

export const submitMealFeedback = async (planId, mealIndex, feedback) => {
  const planRef = doc(db, "weeklyPlans", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) return;
  const planData = planSnap.data();
  const meals = planData.meals || [];
  const householdId = planData.householdId || null;

  meals[mealIndex].feedback = {
    ...feedback,
    timestamp: new Date().toISOString(),
  };

  await updateDoc(planRef, { meals });

  // Also log to global feedback for analysis — include householdId for rules and functions
  await addDoc(collection(db, "feedback"), {
    householdId,
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
    originalRecipeId: oldMeal.recipeId,
  };

  await updateDoc(planRef, { meals });
};

export const getHouseholdStats = async (uid) => {
  try {
    console.debug("getHouseholdStats VTEST-1", {
      uid,
      currentUser: auth.currentUser
        ? { uid: auth.currentUser.uid, email: auth.currentUser.email }
        : null,
    });

    const household = await getHousehold(uid);
    if (!household) {
      throw new Error("Household não encontrada para o utilizador.");
    }

    const hid = household.id;

    console.debug(
      "getHouseholdStats VTEST-1: querying weeklyPlans for householdId",
      hid,
    );

    let plansSnap;
    try {
      plansSnap = await getDocs(
        query(collection(db, "weeklyPlans"), where("householdId", "==", hid)),
      );
    } catch (e) {
      console.error("getHouseholdStats: failed to query weeklyPlans", e);
      throw e;
    }

    const allPlans = plansSnap.docs.map((d) => d.data());

    let totalSaved = 0;
    let totalWaste = 0;

    allPlans.forEach((plan) => {
      (plan.meals || []).forEach((meal) => {
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
            description:
              "Cria o teu primeiro plano para veres as tuas poupanças reais!",
            action: "Gerar Plano",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDH2CxyKXnAhv9vKQ6xcO6DUCEvLBu9QAn-LbF6NIT9FfFDkbUUE_KHeNsVU8zU7K1Nwvqk-tRie98a_fgSQdSMU3Tmu0Ckph3EHpk7Ctpt1EFvwRm_A75tILyPzX8J3BqP-Yx1i37AFmoO6T9VqYs2hJRWII9552GX6O1d4MfRDLRAMxkYDAslx2fuUz00m3q47biBAeWbax1Tt3uhCU-3tiwReNm70-zY08YLmbVKQKcycXi0bj7gLLHIh0svpWWj9fAoBldNzGj_",
          },
        ],
        trend: [80, 65, 50, 35],
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
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDH2CxyKXnAhv9vKQ6xcO6DUCEvLBu9QAn-LbF6NIT9FfFDkbUUE_KHeNsVU8zU7K1Nwvqk-tRie98a_fgSQdSMU3Tmu0Ckph3EHpk7Ctpt1EFvwRm_A75tILyPzX8J3BqP-Yx1i37AFmoO6T9VqYs2hJRWII9552GX6O1d4MfRDLRAMxkYDAslx2fuUz00m3q47biBAeWbax1Tt3uhCU-3tiwReNm70-zY08YLmbVKQKcycXi0bj7gLLHIh0svpWWj9fAoBldNzGj_",
        },
      ],
      trend: [80, 60, 40, 20],
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      monthlySavings: 0,
      wasteReduced: 0,
      satisfactionRate: 100,
      insights: [
        {
          title: "Erro de Permissões",
          description: "Verifica as regras do Firestore ou o teu perfil.",
          image: "",
        },
      ],
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
  // Check if user already has a household
  const existingHid = await checkHouseholdExists(ownerUid);
  let householdRef;

  if (existingHid) {
    console.log("A atualizar família existente:", existingHid);
    householdRef = doc(db, "households", existingHid);
  } else {
    console.log("A criar nova família...");
    householdRef = doc(collection(db, "households"));
  }

  const householdId = householdRef.id;

  const docData = {
    ...data,
    ownerUid,
    updatedAt: serverTimestamp(),
  };

  if (!existingHid) {
    docData.createdAt = serverTimestamp();
  }

  await setDoc(householdRef, docData, { merge: true });

  const userRef = doc(db, "users", ownerUid);
  await setDoc(userRef, { householdId }, { merge: true });

  return householdId;
};

export const generateWeeklyPlan = async (id) => {
  const household = await getHousehold(id);
  if (!household) return null;
  const householdId = household.id;

  const count = household.cookingDaysPerWeek || household.dinnersPerWeek || 5;

  const selected = await getMealRecommendations(householdId, count);

  if (!selected || selected.length === 0) {
    console.error("Nenhuma receita encontrada para os filtros aplicados.");
    return null;
  }

  const meals = [];

  for (const r of selected) {
    const recipe = await getRecipe(r.id);
    if (!recipe) continue;

    meals.push({
      recipeId: recipe.id,
      recipeName: recipe.name,
      prepTime: recipe.prepTime,
      completed: false,
      ingredients: recipe.ingredients || [],
      calories: recipe.calories || null,
      pricePerServing: recipe.pricePerServing || null,
    });
  }

  if (meals.length === 0) {
    console.error("Nenhuma receita válida encontrada para criar o plano.");
    return null;
  }

  // compute expiration date client-side (30 days)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const currentUser = auth.currentUser;
  const newPlan = {
    householdId,
    members: currentUser ? [currentUser.uid] : [],
    createdAt: serverTimestamp(),
    expiresAt,
    locked: false,
    status: "active",
    meals,
  };

  const docRef = await addDoc(collection(db, "weeklyPlans"), newPlan);

  const groceryList = await generateGroceryListFromPlan(docRef.id);

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
  let recipes = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 1.1 Mandatory Filters (Diet & Allergies)
  if (diet.length > 0 && !diet.includes("Sem restrições")) {
    const dietMap = {
      Vegetariano: "vegetarian",
      Vegano: "vegan",
      Mediterrâneo: "mediterranean",
    };
    const targets = diet.map((d) => dietMap[d]).filter(Boolean);
    if (targets.length > 0) {
      recipes = recipes.filter(
        (r) => r.tags && r.tags.some((tag) => targets.includes(tag)),
      );
    }
  }

  // Phase 2: Automated Discovery if local results are low
  // The proxy enforces that only the administrator account can hit
  // the Spoonacular API. regular users should not attempt to make
  // these calls as they will simply receive a permission error.
  if (recipes.length < count && diet.length > 0) {
    console.log(
      `Poucas receitas locais (${recipes.length}). Apenas o administrador pode importar mais receitas.`,
    );
    // could trigger UI notification or send request to an admin to run
    // enrichAllRecipes; for now simply fall through so we still return
    // whatever is available.
  }

  // Fallback final: Se ainda não tivermos receitas suficientes, buscar aleatórias locais
  if (recipes.length < count) {
    const allR = await getDocs(collection(db, "recipes"));
    recipes = allR.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  if (allergies.length > 0) {
    recipes = recipes.filter((r) => {
      const ingredientsArr = r.ingredients || [];
      const ingredientsStr = ingredientsArr
        .map((ing) => {
          if (!ing) return "";
          if (typeof ing === "string") return ing;
          // Spoonacular-style ingredient object
          return (
            ing.name ||
            ing.original ||
            ing.originalString ||
            JSON.stringify(ing)
          );
        })
        .join(" ")
        .toLowerCase();

      return !allergies.some((a) => ingredientsStr.includes(a.toLowerCase()));
    });
  }

  // 2. Scoring (Heuristics)
  // Fetch historical feedback for scoring
  // Fetch only household-scoped feedback to compute personalized scores
  let historicalFeedback = [];
  try {
    const fSnap = await getDocs(
      query(
        collection(db, "feedback"),
        where("householdId", "==", householdId),
      ),
    );
    historicalFeedback = fSnap.docs.map((d) => d.data());
  } catch (err) {
    console.warn(
      "getMealRecommendations: failed to fetch feedback, continuing",
      err,
    );
    historicalFeedback = [];
  }

  const scoredRecipes = recipes.map((r) => {
    let score = 100; // Base score

    // Heuristic: Prep Time
    if (r.prepTime <= maxTime) score += 20;
    if (r.prepTime > maxTime + 10) score -= 30;

    // Heuristic: Feedback
    const recipeFeedbacks = historicalFeedback.filter(
      (f) => f.recipeId === r.id,
    );
    if (recipeFeedbacks.length > 0) {
      const avgKidsLiked =
        recipeFeedbacks.reduce((acc, f) => acc + (f.kidsLiked ? 1 : 0), 0) /
        recipeFeedbacks.length;
      const totalWaste = recipeFeedbacks.reduce(
        (acc, f) => acc + (f.wasteLevel || 0),
        0,
      );

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
 * Converte fração para decimal
 * @param {string} fraction - ex: "1/2", "1 1/2", "1/4"
 * @returns {number} valor decimal
 */
const parseFraction = (fraction) => {
  if (!fraction) return 0;
  
  // Handle mixed numbers like "1 1/2"
  const mixedMatch = fraction.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + (parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]));
  }
  
  // Handle simple fractions like "1/2", "3/4"
  const simpleMatch = fraction.match(/^(\d+)\/(\d+)$/);
  if (simpleMatch) {
    return parseInt(simpleMatch[1]) / parseInt(simpleMatch[2]);
  }
  
  // Handle decimal or integer
  return parseFloat(fraction.replace(',', '.')) || 0;
};

/**
 * Normaliza e converte unidades para formato padrão
 * @param {string} unit - unidade original
 * @returns {object} - { baseUnit: string, factor: number }
 */
const normalizeUnit = (unit) => {
  if (!unit) return { baseUnit: 'unid', factor: 1 };
  
  const unitLower = unit.toLowerCase().trim();
  
  // Weight units
  if (unitLower === 'kg' || unitLower === 'kilograma' || unitLower === 'kilogramas') {
    return { baseUnit: 'kg', factor: 1 };
  }
  if (unitLower === 'g' || unitLower === 'grama' || unitLower === 'gramas') {
    return { baseUnit: 'g', factor: 1 };
  }
  if (unitLower === 'mg' || unitLower === 'miligrama') {
    return { baseUnit: 'mg', factor: 1 };
  }
  if (unitLower === 'lb' || unitLower === 'libra' || unitLower === 'libras') {
    return { baseUnit: 'g', factor: 453.592 }; // Convert to grams
  }
  if (unitLower === 'oz' || unitLower === 'ounce' || unitLower === 'onça') {
    return { baseUnit: 'g', factor: 28.3495 }; // Convert to grams
  }
  
  // Volume units
  if (unitLower === 'l' || unitLower === 'litro' || unitLower === 'litros') {
    return { baseUnit: 'l', factor: 1 };
  }
  if (unitLower === 'ml' || unitLower === 'mililitro' || unitLower === 'mililitros') {
    return { baseUnit: 'ml', factor: 1 };
  }
  if (unitLower === 'cl' || unitLower === 'centilitro') {
    return { baseUnit: 'ml', factor: 10 };
  }
  if (unitLower === 'dl' || unitLower === 'decilitro') {
    return { baseUnit: 'ml', factor: 100 };
  }
  
  // Spoon measures
  if (unitLower === 'colher' || unitLower === 'colheres' || unitLower === 'tbsp' || unitLower === 'tablespoon') {
    return { baseUnit: 'colher', factor: 1 };
  }
  if (unitLower === 'chá' || unitLower === 'cha' || unitLower === 'teaspoon' || unitLower === 'tsp') {
    return { baseUnit: 'chá', factor: 1 };
  }
  if (unitLower === 'sopa' || unitLower === 'sopas') {
    return { baseUnit: 'sopa', factor: 1 };
  }
  
  // Cup measures
  if (unitLower === 'cup' || unitLower === 'cups' || unitLower === 'xícara' || unitLower === 'xicara') {
    return { baseUnit: 'cup', factor: 1 };
  }
  
  // Count units
  if (unitLower === 'unid' || unitLower === 'unidades' || unitLower === 'unit' || unitLower === 'units') {
    return { baseUnit: 'unid', factor: 1 };
  }
  if (unitLower === 'dente' || unitLower === 'dentes') {
    return { baseUnit: 'dente', factor: 1 };
  }
  if (unitLower === 'fatia' || unitLower === 'fatias' || unitLower === 'slice') {
    return { baseUnit: 'fatia', factor: 1 };
  }
  if (unitLower === 'filé' || unitLower === 'file' || unitLower === 'filets') {
    return { baseUnit: 'filé', factor: 1 };
  }
  if (unitLower === 'un' || unitLower === 'pcs' || unitLower === 'pc') {
    return { baseUnit: 'unid', factor: 1 };
  }
  
  return { baseUnit: unitLower, factor: 1 };
};

/**
 * Converte quantidade para a melhor unidade de display
 * @param {number} qty - quantidade
 * @param {string} baseUnit - unidade base
 * @returns {string} - quantidade formatada
 */
const formatQuantity = (qty, baseUnit) => {
  if (!qty || qty <= 0) return '1 Unid.';
  
  // Weight conversions
  if (baseUnit === 'g' || baseUnit === 'mg') {
    if (baseUnit === 'mg' && qty >= 1000) {
      return `${(qty / 1000).toFixed(2)} g`;
    }
    if (baseUnit === 'g' && qty >= 1000) {
      return `${(qty / 1000).toFixed(2)} kg`;
    }
    return `${Math.round(qty)} g`;
  }
  
  // Volume conversions
  if (baseUnit === 'ml') {
    if (qty >= 1000) {
      return `${(qty / 1000).toFixed(2)} l`;
    }
    return `${Math.round(qty)} ml`;
  }
  
  // Pretty display for other units
  if (baseUnit === 'unid' || baseUnit === 'dente' || baseUnit === 'fatia' || baseUnit === 'filé') {
    const cleanQty = Math.round(qty * 100) / 100;
    if (cleanQty === 1) return `1 ${baseUnit === 'unid' ? 'Unid.' : baseUnit}`;
    return `${cleanQty} ${baseUnit}`;
  }
  
  if (baseUnit === 'colher' || baseUnit === 'chá' || baseUnit === 'sopa') {
    const cleanQty = Math.round(qty * 100) / 100;
    return `${cleanQty} ${baseUnit}`;
  }
  
  if (baseUnit === 'cup') {
    const cleanQty = Math.round(qty * 100) / 100;
    return `${cleanQty} cup${cleanQty > 1 ? 's' : ''}`;
  }
  
  const cleanQty = Math.round(qty * 100) / 100;
  return `${cleanQty} ${baseUnit}`;
};

/**
 * Normaliza o nome do ingrediente para chave de agregação
 * @param {string} name - nome do ingrediente
 * @returns {string} - nome normalizado
 */
const normalizeIngredientName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes/adjectives
    .replace(/^(fresh |fresco |fresca |dry |seco |seca )/i, '')
    .replace(/^(small |medium |large |pequeno |médio |grande )/i, '')
    .replace(/^(boneless |skinless |sem pele |sem osso )/i, '')
    // Remove everything in parentheses
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Normalize common variations
    .replace(/cebola[s]? (?:francesa|galega)?/i, 'cebola')
    .replace(/alho[s]? franc[e]?s/i, 'alho')
    .replace(/tomate[s]? cereja/i, 'tomate cereja')
    .replace(/batata[s]? doce[s]?/i, 'batata doce')
    .replace(/batata[s]?[/ ]?frita[s]?/i, 'batata frita')
    .replace(/pão[ -]?es?hambúrguer/i, 'pão hambúrguer')
    .replace(/pão[ -]?de[ -]?hambúrguer/i, 'pão hambúrguer')
    .replace(/filé[ -]?de[ -]?peixe/i, 'filé de peixe')
    .trim();
};

/**
 * Categoriza ingrediente baseado no nome
 * @param {string} name - nome do ingrediente
 * @returns {string} - categoria
 */
const categorizeIngredient = (name) => {
  if (!name) return 'Geral';
  
  const n = name.toLowerCase();
  
  // Meat
  if (n.includes('frango') || n.includes('carne') || n.includes('bife') || 
      n.includes('peru') || n.includes('panado') || n.includes('porco') ||
      n.includes('fiambre') || n.includes('chouriço') || n.includes('linguiça') ||
      n.includes('costeleta') || n.includes('nata') || n.includes('bacon')) {
    return 'Talho';
  }
  
  // Fish & Seafood
  if (n.includes('peixe') || n.includes('salmão') || n.includes('bacalhau') || 
      n.includes('dourada') || n.includes('marisco') || n.includes('camarão') ||
      n.includes('lula') || n.includes('polvo') || n.includes('atum') ||
      n.includes('pescada') || n.includes('robalo')) {
    return 'Peixaria';
  }
  
  // Fruits & Vegetables
  if (n.includes('tomate') || n.includes('alface') || n.includes('cenoura') || 
      n.includes('fruta') || n.includes('brócolos') || n.includes('batata') || 
      n.includes('cebola') || n.includes('alho') || n.includes('pimento') ||
      n.includes('abacate') || n.includes('banana') || n.includes('maçã') ||
      n.includes('laranja') || n.includes('abóbora') || n.includes('courgette') ||
      n.includes('espinafre') || n.includes('rúcula') || n.includes('nabo') ||
      n.includes('beterraba') || n.includes('pepino') || n.includes('ervilha') ||
      n.includes('feijão') || n.includes('grão') || n.includes('lentilha')) {
    return 'Hortifrutis';
  }
  
  // Dairy & Fresh
  if (n.includes('leite') || n.includes('iogurte') || n.includes('queijo') || 
      n.includes('ovos') || n.includes('natas') || n.includes('manteiga') || 
      n.includes('creme') || n.includes('iogurte')) {
    return 'Laticínios / Frescos';
  }
  
  // Pantry
  if (n.includes('arroz') || n.includes('massa') || n.includes('azeite') || 
      n.includes('óleo') || n.includes('sal') || n.includes('pau') || 
      n.includes('conserva') || n.includes('farinha') || n.includes('açúcar') ||
      n.includes('acucar') || n.includes('fermento') || n.includes('maionese') ||
      n.includes('ketchup') || n.includes('mostarda') || n.includes('molho')) {
    return 'Despensa';
  }
  
  // Bakery
  if (n.includes('pão') || n.includes('tosta') || n.includes('bolacha') || 
      n.includes('croissant') || n.includes('baguete') || n.includes('papel') ||
      n.includes('tortilha')) {
    return 'Padaria';
  }
  
  // Beverages
  if (n.includes('sumo') || n.includes('suco') || n.includes('refrigerante') || 
      n.includes('café') || n.includes('cafe') || n.includes('chá') || n.includes('cha') ||
      n.includes('água') || n.includes('agua')) {
    return 'Bebidas';
  }
  
  // Frozen
  if (n.includes('congelado') || n.includes('gelado') || n.includes('pizza') ||
      n.includes('lasanha') || n.includes('prato') || n.includes('砧')) {
    return 'Congelados';
  }
  
  return 'Geral';
};
export const generateGroceryListFromPlan = async (planId) => {
  console.log("generateGroceryListFromPlan: A iniciar para ID:", planId);
  const planRef = doc(db, "weeklyPlans", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) {
    console.error("generateGroceryListFromPlan: Plano não encontrado:", planId);
    return [];
  }

  const data = planSnap.data();
  const meals = data.meals || [];
  console.log(
    `generateGroceryListFromPlan: Processando ${meals.length} refeições para o plano ${planId}`,
  );

  if (meals.length === 0) {
    console.warn("generateGroceryListFromPlan: Plano sem refeições!");
  }

  const aggregator = {};
  let totalEstimatedCost = 0;

  meals.forEach((meal) => {
    if (meal.pricePerServing) {
      totalEstimatedCost += parseFloat(meal.pricePerServing);
    }

    (meal.ingredients || []).forEach((ingredient) => {
      let ingredientText = "";
      if (!ingredient) return;
      if (typeof ingredient === "string") ingredientText = ingredient;
      else if (typeof ingredient === "object")
        ingredientText =
          ingredient.original ||
          ingredient.name ||
          ingredient.originalString ||
          JSON.stringify(ingredient);

      // Enhanced regex to handle fractions and more units
      const match = ingredientText.match(
        /^([\d.,/]+(?:\s+\d+\/\d+)?)?\s*(g|kg|ml|l|unid|colher|chá|sopa|cup|tbsp|tsp|oz|lb|dente|fatia|filé|un|pcs)?s?\s*(.*)$/i,
      );

      let qty = 1;
      let unit = "unid";
      let name = ingredientText.toLowerCase().trim();

      if (match && (match[1] || match[2])) {
        // Use parseFraction for better quantity parsing
        qty = parseFraction(match[1]?.replace(",", ".")) || 1;
        unit = (match[2] || "unid").toLowerCase();
        name = match[3]?.toLowerCase().trim() || name;
      } else {
        name = ingredientText.toLowerCase().trim();
      }

      // Normalize ingredient name for better aggregation
      const normalizedName = normalizeIngredientName(name);
      const displayName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
      
      // Get normalized unit info
      const unitInfo = normalizeUnit(unit);
      
      if (!aggregator[normalizedName]) {
        aggregator[normalizedName] = {
          name: displayName,
          qty: 0,
          baseUnit: unitInfo.baseUnit,
          conversionFactor: unitInfo.factor,
          rawQty: 0,
          rawUnit: unit,
          category: categorizeIngredient(normalizedName),
        };
      }

      // Convert to base unit and add
      const convertedQty = qty * unitInfo.factor;
      aggregator[normalizedName].rawQty += qty;
      aggregator[normalizedName].qty += convertedQty;
    });
  });

  // Convert map to categorized array with better formatting
  const categoriesMap = {};
  Object.values(aggregator).forEach((item) => {
    if (!categoriesMap[item.category]) categoriesMap[item.category] = [];

    // Use formatQuantity for nice display
    const displayQty = formatQuantity(item.qty, item.baseUnit);

    categoriesMap[item.category].push({
      name: item.name,
      quantity: displayQty,
      rawQuantity: item.rawQty > 0 ? `${item.rawQty} ${item.rawUnit}` : null,
      checked: false,
    });
  });

  const groceryList = Object.keys(categoriesMap).map((cat) => ({
    category: cat,
    items: categoriesMap[cat],
  }));

  console.log(
    `generateGroceryListFromPlan: Geradas ${groceryList.length} categorias de compras.`,
  );

  // Update plan with total estimated cost and the list itself
  try {
    await updateDoc(planRef, {
      groceryList,
      totalEstimatedCost: totalEstimatedCost.toFixed(2),
    });
    console.log(
      "generateGroceryListFromPlan: Plano atualizado com sucesso no Firestore.",
    );
  } catch (err) {
    console.error("generateGroceryListFromPlan: Erro ao atualizar plano:", err);
  }

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
// the client version simply invokes the callable, which performs the
// operation server-side under the administrator's credentials.
export const enrichAllRecipes = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Utilizador não autenticado. Faça login primeiro.");
    }

    const idToken = await currentUser.getIdToken();
    const ENRICH_URL =
      "https://us-central1-nannymeal-d966b.cloudfunctions.net/enrichAllRecipesHttp";

    const resp = await fetch(ENRICH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + idToken,
      },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    return data.updated ? data.updated : 0;
  } catch (err) {
    console.error("Falha ao chamar enrichAllRecipes:", err);
    throw err;
  }
};

export const initDB = () => {
  console.log("Módulo de base de dados inicializado.");
};

/**
 * Obtém todas as receitas da base de dados
 */
export const getAllRecipes = async (userId = null) => {
  try {
    // Sempre sincronizar receitas para garantir que têm os dados atualizados
    console.log("A sincronizar receitas...");
    await seedRecipes();
    
    let rSnap = await getDocs(collection(db, "recipes"));

    // Se não existem receitas após sincronização, semear
    if (rSnap.empty) {
      console.log("Base de dados de receitas vazia. A semear...");
      await seedRecipes();
      rSnap = await getDocs(collection(db, "recipes"));
    }

    const recipes = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Se foi pedido o userId, juntamos qualquer versão personalizada desse
    // utilizador. Não substituímos a receita global, apenas adicionamos um
    // clone com campos customizados (para evitar confusão durante a renderização).
    if (userId) {
      const uSnap = await getDocs(
        query(collection(db, "userRecipes"), where("userId", "==", userId)),
      );
      uSnap.docs.forEach((d) => {
        const ur = { id: d.id, ...d.data() };
        const base = recipes.find((r) => r.id === ur.recipeId);
        if (base) {
          recipes.push({
            ...base,
            customIngredients: ur.customIngredients,
            customInstructions: ur.customInstructions,
            notes: ur.notes,
            userRecipeId: ur.id,
          });
        }
      });
    }

    return recipes;
  } catch (error) {
    console.error("Erro ao obter todas as receitas:", error);
    return [];
  }
};

/**
 * === Personal recipes helpers ===
 * Each user can save a global recipe and optionally customize it.
 */
export const saveUserRecipe = async (
  userId,
  recipeId,
  {
    customName = "",
    customIngredients = [],
    customInstructions = "",
    notes = "",
  } = {},
) => {
  const docData = {
    userId,
    recipeId,
    customName,
    customIngredients,
    customInstructions,
    notes,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "userRecipes"), docData);
  return { id: ref.id, ...docData };
};

export const getUserRecipes = async (userId) => {
  const snap = await getDocs(
    query(collection(db, "userRecipes"), where("userId", "==", userId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserRecipe = async (docId, updates) => {
  const ref = doc(db, "userRecipes", docId);
  await updateDoc(ref, updates);
};

export const deleteUserRecipe = async (docId) => {
  await deleteDoc(doc(db, "userRecipes", docId));
};

/**
 * Cria um plano customizado pelo utilizador
 */
export const createCustomPlan = async (userId, planData) => {
  const household = await getHousehold(userId);
  if (!household) {
    throw new Error("Família não encontrada");
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const currentUser = auth.currentUser;
  const newPlan = {
    ...planData,
    householdId: household.id,
    members: currentUser ? [currentUser.uid] : [],
    createdAt: serverTimestamp(),
    expiresAt,
    locked: false,
    status: "active",
    type: "custom", // Distinguir planos customizados dos automáticos
  };

  const docRef = await addDoc(collection(db, "weeklyPlans"), newPlan);

  // Gerar e guardar lista de compras para este plano
  const groceryList = await generateGroceryListFromPlan(docRef.id);
  await updateDoc(docRef, { groceryList });

  return { id: docRef.id, ...newPlan, groceryList };
};

/**
 * Obtém todos os planos de um utilizador/família
 */
export const getAllPlans = async (userId) => {
  try {
    const household = await getHousehold(userId);
    if (!household) {
      console.warn("Família não encontrada para o utilizador:", userId);
      return [];
    }

    const q = query(
      collection(db, "weeklyPlans"),
      where("householdId", "==", household.id),
      orderBy("createdAt", "desc"),
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Erro ao obter planos:", error);
    return [];
  }
};

/**
 * Obtém um plano específico por ID
 */
export const getPlanById = async (planId) => {
  try {
    const planSnap = await getDoc(doc(db, "weeklyPlans", planId));
    return planSnap.exists() ? { id: planSnap.id, ...planSnap.data() } : null;
  } catch (error) {
    console.error("Erro ao obter plano:", error);
    return null;
  }
};

/**
 * Obtém os ingredientes de um plano específico
 */
export const getPlanIngredients = async (planId) => {
  try {
    const plan = await getPlanById(planId);
    if (!plan || !plan.meals) {
      return [];
    }

    const aggregator = {};

    plan.meals.forEach((meal) => {
      (meal.ingredients || []).forEach((ingredient) => {
        let ingredientText = "";
        if (!ingredient) return;
        if (typeof ingredient === "string") ingredientText = ingredient;
        else if (typeof ingredient === "object")
          ingredientText =
            ingredient.original ||
            ingredient.name ||
            ingredient.originalString ||
            JSON.stringify(ingredient);

        const match = ingredientText.match(
          /^([\d.,/]+)?\s*(g|kg|ml|l|unid|colher|chá|sopa)?\s*(.*)$/i,
        );

        let qty = 1;
        let unit = "unid";
        let name = ingredientText.toLowerCase().trim();

        if (match && (match[1] || match[2])) {
          qty = parseFloat(match[1]?.replace(",", ".")) || 1;
          unit = (match[2] || "unid").toLowerCase();
          name = match[3]?.toLowerCase().trim() || name;
        }

        if (!aggregator[name]) {
          aggregator[name] = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            qty: 0,
            unit,
            category: "Geral",
            meals: [], // Rastreia quais refeições usam este ingrediente
          };
        }

        if (aggregator[name].unit === unit) {
          aggregator[name].qty += qty;
        } else {
          aggregator[name].qty += qty;
        }

        // Categorização
        const n = name;
        if (
          n.includes("frango") ||
          n.includes("carne") ||
          n.includes("bife") ||
          n.includes("peru") ||
          n.includes("panado")
        )
          aggregator[name].category = "Talho";
        else if (
          n.includes("peixe") ||
          n.includes("salmão") ||
          n.includes("bacalhau") ||
          n.includes("dourada") ||
          n.includes("marisco")
        )
          aggregator[name].category = "Peixaria";
        else if (
          n.includes("tomate") ||
          n.includes("alface") ||
          n.includes("cenoura") ||
          n.includes("fruta") ||
          n.includes("brócolos") ||
          n.includes("batata") ||
          n.includes("cebola") ||
          n.includes("alho")
        )
          aggregator[name].category = "Hortifrutis";
        else if (
          n.includes("leite") ||
          n.includes("iogurte") ||
          n.includes("queijo") ||
          n.includes("ovos") ||
          n.includes("natas") ||
          n.includes("manteiga")
        )
          aggregator[name].category = "Laticínios / Frescos";
        else if (
          n.includes("arroz") ||
          n.includes("massa") ||
          n.includes("azeite") ||
          n.includes("óleo") ||
          n.includes("sal") ||
          n.includes("pau") ||
          n.includes("conserva")
        )
          aggregator[name].category = "Despensa";
        else if (
          n.includes("pão") ||
          n.includes("tosta") ||
          n.includes("bolacha")
        )
          aggregator[name].category = "Padaria";
      });
    });

    // Converter em array categorizado
    const categoriesMap = {};
    Object.values(aggregator).forEach((item) => {
      if (!categoriesMap[item.category]) categoriesMap[item.category] = [];

      let displayQty = `${item.qty} ${item.unit}`;
      if (item.unit === "unid" && item.qty === 1) displayQty = "1 Unid.";

      categoriesMap[item.category].push({
        name: item.name,
        quantity: displayQty,
        checked: false,
      });
    });

    return Object.keys(categoriesMap).map((cat) => ({
      category: cat,
      items: categoriesMap[cat],
    }));
  } catch (error) {
    console.error("Erro ao obter ingredientes do plano:", error);
    return [];
  }
};

/**
 * Melhoria ao swapMeal para suportar múltiplos planos
 */
export const swapMealImproved = async (
  planId,
  mealIndex,
  newRecipeId,
  reason,
) => {
  try {
    const recipe = await getRecipe(newRecipeId);
    if (!recipe) {
      throw new Error("Receita não encontrada");
    }

    const planRef = doc(db, "weeklyPlans", planId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) {
      throw new Error("Plano não encontrado");
    }

    const meals = [...planSnap.data().meals];
    if (!meals[mealIndex]) {
      throw new Error("Índice de refeição inválido");
    }

    const oldMeal = meals[mealIndex];

    meals[mealIndex] = {
      recipeId: newRecipeId,
      recipeName: recipe.name,
      prepTime: recipe.prepTime,
      completed: false,
      ingredients: recipe.ingredients || [],
      calories: recipe.calories || null,
      pricePerServing: recipe.pricePerServing || null,
      isReplacement: true,
      replacedReason: reason,
      originalRecipeId: oldMeal.recipeId,
      replacedAt: new Date().toISOString(),
    };

    await updateDoc(planRef, { meals });

    // Regenerar lista de compras automaticamente
    const groceryList = await generateGroceryListFromPlan(planId);
    await updateDoc(planRef, { groceryList });

    return { id: planId, meals, groceryList };
  } catch (error) {
    console.error("Erro ao trocar refeição:", error);
    throw error;
  }
};

/**
 * Atualiza uma refeição num plano
 */
export const updateMeal = async (planId, mealIndex, mealUpdates) => {
  try {
    const planRef = doc(db, "weeklyPlans", planId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) {
      throw new Error("Plano não encontrado");
    }

    const meals = [...planSnap.data().meals];
    if (!meals[mealIndex]) {
      throw new Error("Índice de refeição inválido");
    }

    meals[mealIndex] = {
      ...meals[mealIndex],
      ...mealUpdates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(planRef, { meals });
    return { id: planId, meals };
  } catch (error) {
    console.error("Erro ao atualizar refeição:", error);
    throw error;
  }
};

/**
 * Elimina um plano definitivamente do Firestore
 */
export const deletePlan = async (planId) => {
  try {
    const planRef = doc(db, "weeklyPlans", planId);
    // Hard delete - elimina definitivamente o documento
    await deleteDoc(planRef);
    return true;
  } catch (error) {
    console.error("Erro ao eliminar plano:", error);
    return false;
  }
};

/**
 * Obtém agregação de ingredientes para múltiplos planos
 */
export const getMultiplePlansIngredientsAggregation = async (planIds) => {
  try {
    const aggregator = {};
    let totalCost = 0;

    for (const planId of planIds) {
      const ingredients = await getPlanIngredients(planId);

      ingredients.forEach((category) => {
        category.items.forEach((item) => {
          const key = item.name.toLowerCase();
          if (!aggregator[key]) {
            aggregator[key] = {
              name: item.name,
              qty: 0,
              unit: item.quantity.split(" ").pop(),
              category: category.category,
            };
          }

          // Tentar somar quantidades
          const qtyMatch = item.quantity.match(/^[\d.]+/);
          if (qtyMatch) {
            aggregator[key].qty += parseFloat(qtyMatch[0]);
          }
        });
      });
    }

    return Object.values(aggregator);
  } catch (error) {
    console.error("Erro ao agregar ingredientes múltiplos planos:", error);
    return [];
  }
};
