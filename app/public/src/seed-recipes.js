import { db } from "./firebase-init.js";
import { collection, addDoc, getDocs, query, limit } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const recipes = [
  {
    name: "Frango com Caril Expresso",
    prepTime: 20,
    tags: ["fast", "classic", "kid-friendly"],
    ingredients: [
      "Peito de frango",
      "Leite de coco",
      "Caril em pó",
      "Arroz basmati",
    ],
    instructions:
      "Corte o frango em cubos, salteie, adicione o caril e o leite de coco. Sirva com arroz.",
  },
  {
    name: "Massa com Pesto e Tomate Cereja",
    prepTime: 15,
    tags: ["fast", "vegetarian", "vegetarian"],
    ingredients: [
      "Esparguete",
      "Molho Pesto",
      "Tomate cereja",
      "Queijo Parmesão",
    ],
    instructions:
      "Coza a massa. Misture o pesto e os tomates cortados ao meio. Finalize com queijo.",
  },
  {
    name: "Salmão no Forno com Ervas",
    prepTime: 25,
    tags: ["standard", "pescatarian", "healthy"],
    ingredients: [
      "Lombo de salmão",
      "Batata doce",
      "Brócolos",
      "Ervas aromáticas",
    ],
    instructions:
      "Tempere o salmão e os legumes. Leve ao forno a 200°C por 20 minutos.",
  },
  {
    name: "Risotto de Cogumelos",
    prepTime: 40,
    tags: ["chef", "vegetarian"],
    ingredients: [
      "Arroz Arbóreo",
      "Cogumelos variados",
      "Vinho branco",
      "Cebola",
      "Caldo de legumes",
    ],
    instructions:
      "Refogue a cebola e os cogumelos. Adicione o arroz e o caldo aos poucos, mexendo sempre.",
  },
  {
    name: "Tacos de Feijão Preto",
    prepTime: 20,
    tags: ["fast", "vegetarian", "kid-friendly"],
    ingredients: ["Tortillas", "Feijão preto", "Abacate", "Lima", "Coentros"],
    instructions:
      "Aqueça o feijão com especiarias. Recheie as tortillas com feijão, abacate e lima.",
  },
  {
    name: "Omolete de Espinafres e Feta",
    prepTime: 10,
    tags: ["fast", "vegetarian", "healthy"],
    ingredients: ["Ovos", "Espinafres frescos", "Queijo Feta"],
    instructions:
      "Bata os ovos, adicione os espinafres e o queijo. Cozinhe em lume brando.",
  },
  {
    name: "Bacalhau à Brás",
    prepTime: 35,
    tags: ["standard", "pescatarian", "classic"],
    ingredients: [
      "Bacalhau desfiado",
      "Batata palha",
      "Ovos",
      "Cebola",
      "Azeitonas",
    ],
    instructions:
      "Refogue a cebola e o bacalhau. Adicione a batata e os ovos batidos. Envolva bem.",
  },
  {
    name: "Hambúrguer de Grão e Cenoura",
    prepTime: 30,
    tags: ["standard", "vegetarian", "kid-friendly"],
    ingredients: [
      "Grão-de-bico",
      "Cenoura ralada",
      "Pão de hambúrguer",
      "Alface",
    ],
    instructions:
      "Triture o grão com a cenoura, forme os hambúrgueres e grelhe.",
  },
  {
    name: "Strogonoff de Cogumelos",
    prepTime: 25,
    tags: ["fast", "vegetarian"],
    ingredients: ["Cogumelos Paris", "Natas vegetais", "Arroz branco"],
    instructions: "Salteie os cogumelos, adicione as natas e sirva com arroz.",
  },
  {
    name: "Dourada Grelhada com Legumes",
    prepTime: 30,
    tags: ["standard", "pescatarian", "healthy"],
    ingredients: ["Dourada fresca", "Curgete", "Beringela", "Pimento"],
    instructions:
      "Grelhe a dourada e os legumes fatiados com um fio de azeite.",
  },
];

export const seedRecipes = async () => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(recipesRef, limit(1));
    const snap = await getDocs(q);
  
    if (snap.empty) {
      console.log("A semear receitas iniciais...");
      for (const recipe of recipes) {
        await addDoc(recipesRef, recipe);
      }
      console.log("Receitas semeadas com sucesso!");
    } else {
      console.log("As receitas já existem na base de dados.");
    }
  } catch (error) {
    console.warn("Aviso ao semear receitas (pode ser falta de permissões):", error.message);
  }
};
