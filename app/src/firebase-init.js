import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAXYDmdlxSvPMHdazuQzJ29QB-hlb1rMOY",
  authDomain: "nannymeal-d966b.firebaseapp.com",
  projectId: "nannymeal-d966b",
  storageBucket: "nannymeal-d966b.firebasestorage.app",
  messagingSenderId: "572933668964",
  appId: "1:572933668964:web:d429db7ac475310d0a9f71"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
