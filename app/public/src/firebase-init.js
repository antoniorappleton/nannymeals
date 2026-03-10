import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import {
  getFirestore,
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
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXYDmdlxSvPMHdazuQzJ29QB-hlb1rMOY",
  authDomain: "nannymeal-d966b.firebaseapp.com",
  projectId: "nannymeal-d966b",
  storageBucket: "nannymeal-d966b.firebasestorage.app",
  messagingSenderId: "572933668964",
  appId: "1:572933668964:web:d429db7ac475310d0a9f71",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configurar idioma para Português
auth.languageCode = "pt-PT";

// Configurar persistence para manter sessão
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Auth persistence configured"))
  .catch((err) => console.warn("Auth persistence error:", err));

export const db = getFirestore(app);
export const functions = getFunctions(app);

// Centralized Firestore exports
export {
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
};
