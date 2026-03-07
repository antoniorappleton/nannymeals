import {
  db,
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

  const meals = planSnap.data().meals;
  meals[mealIndex].feedback = {
    ...feedback,
    timestamp: new Date().toISOString(),
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
    originalRecipeId: oldMeal.recipeId,
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

    const plansSnap = await getDocs(
      query(collection(db, "weeklyPlans"), where("householdId", "==", hid)),
    );
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
  const newPlan = {
    householdId,
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
      const ingredientsStr = (r.ingredients || []).join(" ").toLowerCase();
      return !allergies.some((a) => ingredientsStr.includes(a.toLowerCase()));
    });
  }

  // 2. Scoring (Heuristics)
  // Fetch historical feedback for scoring
  const fSnap = await getDocs(
    query(collection(db, "feedback"), where("recipeId", "!=", "")),
  );
  const historicalFeedback = fSnap.docs.map((d) => d.data());

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
 * Gerador de lista de compras agregada
 */
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
      // Assuming 1 serving per recipe for simplicity in this calculation,
      // but in a real app we'd multiply by family size.
      totalEstimatedCost += parseFloat(meal.pricePerServing);
    }

    (meal.ingredients || []).forEach((ingredient) => {
      // Improved Regex to handle cases without explicit quantities or units
      const match = ingredient.match(
        /^([\d.,/]+)?\s*(g|kg|ml|l|unid|colher|chá|sopa)?\s*(.*)$/i,
      );

      let qty = 1;
      let unit = "unid";
      let name = ingredient.toLowerCase().trim();

      if (match && (match[1] || match[2])) {
        qty = parseFloat(match[1]?.replace(",", ".")) || 1;
        unit = (match[2] || "unid").toLowerCase();
        name = match[3]?.toLowerCase().trim() || name;
      } else {
        // Full string is the name if no clear pattern
        name = ingredient.toLowerCase().trim();
      }

      if (!aggregator[name]) {
        aggregator[name] = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          qty: 0,
          unit,
          category: "Geral",
        };
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

  // Convert map to categorized array
  const categoriesMap = {};
  Object.values(aggregator).forEach((item) => {
    if (!categoriesMap[item.category]) categoriesMap[item.category] = [];

    // Format quantity nicely: 1.5 kg, 500 g, etc.
    let displayQty = `${item.qty} ${item.unit}`;
    if (item.unit === "unid" && item.qty === 1) displayQty = "1 Unid.";

    categoriesMap[item.category].push({
      name: item.name,
      quantity: displayQty,
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
    const { getFunctions, httpsCallable } = await import(
      "https://www.gstatic.com/firebasejs/11.3.1/firebase-functions.js",
    );
    const functions = getFunctions();
    const proxy = httpsCallable(functions, "enrichAllRecipes");
    const resp = await proxy({});
    return resp.data && resp.data.updated ? resp.data.updated : 0;
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
    let rSnap = await getDocs(collection(db, "recipes"));

    // Se não existem receitas, semear a base de dados
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
  { customName = "", customIngredients = [], customInstructions = "", notes = "" } = {},
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
  const newPlan = {
    ...planData,
    householdId: household.id,
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
        const match = ingredient.match(
          /^([\d.,/]+)?\s*(g|kg|ml|l|unid|colher|chá|sopa)?\s*(.*)$/i,
        );

        let qty = 1;
        let unit = "unid";
        let name = ingredient.toLowerCase().trim();

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
      replacedAt: serverTimestamp(),
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
      updatedAt: serverTimestamp(),
    };

    await updateDoc(planRef, { meals });
    return { id: planId, meals };
  } catch (error) {
    console.error("Erro ao atualizar refeição:", error);
    throw error;
  }
};

/**
 * Elimina um plano (soft delete - marca como deletado)
 */
export const deletePlan = async (planId) => {
  try {
    const planRef = doc(db, "weeklyPlans", planId);
    await updateDoc(planRef, {
      status: "deleted",
      deletedAt: serverTimestamp(),
    });
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
