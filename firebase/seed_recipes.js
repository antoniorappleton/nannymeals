import * as admin from "firebase-admin";

// Usage: Run with firebase-admin credentials locally
// This is a seed helper
const recipes = [
  {
    title: "15-Min Lemon Pasta",
    timeMinutes: 15,
    costLevel: "low",
    tags: ["quick", "kid-friendly", "vegetarian"],
    ingredients: [
      { name: "Spaghetti", qty: 500, unit: "g", section: "Pantry" },
      { name: "Lemon", qty: 2, unit: "pcs", section: "Produce" },
      { name: "Fresh Basil", qty: 1, unit: "bunch", section: "Produce" },
    ],
    servingsBase: 4,
    kidFriendlyScore: 5,
  },
  {
    title: "Oven-Baked Tacos",
    timeMinutes: 25,
    costLevel: "medium",
    tags: ["kid-friendly", "meat"],
    ingredients: [
      { name: "Taco Shells", qty: 1, unit: "pack", section: "Pantry" },
      { name: "Ground Beef", qty: 500, unit: "g", section: "Meat" },
      { name: "Shredded Cheese", qty: 200, unit: "g", section: "Dairy" },
    ],
    servingsBase: 4,
    kidFriendlyScore: 5,
  },
];

async function seed() {
  const db = admin.firestore();
  for (const r of recipes) {
    await db.collection("recipes").add(r);
  }
}
