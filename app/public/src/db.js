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

export const submitFeedback = async (feedback) => {
  await addDoc(collection(db, "feedback"), {
    ...feedback,
    timestamp: serverTimestamp(),
  });
};

export const getRecipe = async (rid) => {
  const snap = await getDoc(doc(db, "recipes", rid));
  return snap.exists() ? snap.data() : null;
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
  const diet = hData.dietStyle || hData.dietaryPreferences || [];
  const maxTime = hData.cookingTimeWeekday || hData.maxPrepTime || 60;
  const count = hData.cookingDaysPerWeek || hData.dinnersPerWeek || 5;

  const rSnap = await getDocs(query(collection(db, "recipes")));
  let allRecipes = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (diet.length > 0 && !diet.includes("Sem restrições")) {
    const dietMap = { Vegetariano: "vegetarian", Vegano: "vegan", Mediterrâneo: "mediterranean" };
    const targets = diet.map((d) => dietMap[d]).filter(Boolean);
    if (targets.length > 0) {
      allRecipes = allRecipes.filter((r) => r.tags.some((tag) => targets.includes(tag)));
    }
  }

  allRecipes = allRecipes.filter((r) => r.prepTime <= maxTime);
  const selected = allRecipes.sort(() => 0.5 - Math.random()).slice(0, count);

  const newPlan = {
    householdId,
    createdAt: serverTimestamp(),
    status: "active",
    meals: selected.map((r) => ({
      recipeId: r.id,
      recipeName: r.name,
      prepTime: r.prepTime,
      completed: false,
    })),
  };

  const docRef = await addDoc(collection(db, "weeklyPlans"), newPlan);
  return { id: docRef.id, ...newPlan };
};

export const checkHouseholdExists = async (uid) => {
  const q = query(collection(db, "households"), where("ownerUid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
};

export const initDB = () => {
  console.log("Módulo de base de dados inicializado.");
};
