import { db } from "./firebase-init.js";
import {
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
} from "firebase/firestore";

/**
 * Módulo de Abstração Firestore
 * Centraliza o acesso aos dados do NannyMeal
 */

/**
 * Households - Dados da Família
 */
export const getHousehold = async (hid) => {
  const docRef = doc(db, "households", hid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

export const saveHousehold = async (hid, data) => {
  await setDoc(doc(db, "households", hid), data, { merge: true });
};

/**
 * Weekly Plans - Planos de Refeição
 */
export const getLastPlan = async (hid) => {
  const plansRef = collection(db, "weeklyPlans");
  const q = query(plansRef, where("householdId", "==", hid)); // Adicionar orderby por data depois
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))[0];
};

/**
 * Feedback - Avaliação de Refeições
 */
export const submitFeedback = async (feedback) => {
  await addDoc(collection(db, "feedback"), {
    ...feedback,
    timestamp: new Date(),
  });
};

/**
 * Recipes - Catálogo
 */
export const getRecipe = async (rid) => {
  const docRef = doc(db, "recipes", rid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

/**
 * Users - Perfil de Utilizador
 */
export const syncUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date(),
    },
    { merge: true },
  );
};

/**
 * Households - Gestão de Famílias
 */
export const createHousehold = async (ownerUid, data) => {
  const householdRef = doc(collection(db, "households"));
  const householdId = householdRef.id;

  await setDoc(householdRef, {
    ...data,
    ownerUid,
    createdAt: new Date(),
  });

  // Associar household ao perfil do utilizador
  const userRef = doc(db, "users", ownerUid);
  await setDoc(userRef, { householdId }, { merge: true });

  return householdId;
};

/**
 * Geração de Plano Semanal
 */
export const generateWeeklyPlan = async (householdId) => {
  const householdRef = doc(db, "households", householdId);
  const hSnap = await getDoc(householdRef);
  if (!hSnap.exists()) return null;

  const hData = hSnap.data();
  // Suporte a nomes antigos e novos
  const diet = hData.dietStyle || hData.dietaryPreferences || [];
  const maxTime = hData.cookingTimeWeekday || hData.maxPrepTime || 60;
  const count = hData.cookingDaysPerWeek || hData.dinnersPerWeek || 5;

  // 1. Procurar receitas compatíveis
  const recipesRef = collection(db, "recipes");
  const q = query(recipesRef);
  const rSnap = await getDocs(q);

  let allRecipes = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Filtrar por estilo alimentar (Vegetariano, Vegano, etc)
  if (diet.length > 0 && !diet.includes("Sem restrições")) {
    const dietMap = {
      Vegetariano: "vegetarian",
      Vegano: "vegan",
      Mediterrâneo: "mediterranean",
    };

    const targets = diet.map((d) => dietMap[d]).filter(Boolean);
    if (targets.length > 0) {
      allRecipes = allRecipes.filter((r) =>
        r.tags.some((tag) => targets.includes(tag)),
      );
    }
  }

  // Filtrar por tempo
  allRecipes = allRecipes.filter((r) => r.prepTime <= maxTime);

  // 2. Selecionar N receitas aleatórias
  const selected = allRecipes.sort(() => 0.5 - Math.random()).slice(0, count);

  // 3. Criar o plano
  const planRef = collection(db, "weeklyPlans");
  const newPlan = {
    householdId,
    createdAt: new Date(),
    status: "active",
    meals: selected.map((r) => ({
      recipeId: r.id,
      recipeName: r.name,
      prepTime: r.prepTime,
      completed: false,
    })),
  };

  const docRef = await addDoc(planRef, newPlan);
  return { id: docRef.id, ...newPlan };
};

export const initDB = () => {
  console.log("Módulo de base de dados inicializado.");
};
