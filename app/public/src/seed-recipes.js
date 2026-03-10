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
    instructionSteps: [
      "Corte o frango em cubos pequenos.",
      "Aqueça uma frigideira com um fio de azeite.",
      "Salteie o frango até ficar dourado.",
      "Adicione o caril em pó e misture bem.",
      "Junte o leite de coco e deixe cozinhar por 5 minutos.",
      "Sirva com arroz basmati quente.",
    ],
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
    instructionSteps: [
      "Coza a massa em água a ferver com sal.",
      "Corte os tomates cereja ao meio.",
      "Escorra a massa e misture com o molho pesto.",
      "Adicione os tomates cereja.",
      "Finalize com queijo parmesão ralado.",
    ],
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
    instructionSteps: [
      "Pré-aqueça o forno a 200°C.",
      "Corte a batata doce em rodelas e os brócolos em floretes.",
      "Coloque o salmão num tabuleiro com os legumes.",
      "Tempere com ervas aromáticas, sal e azeite.",
      "Leve ao forno por 20 minutos.",
    ],
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
    instructionSteps: [
      "Refogue a cebola picada em azeite.",
      "Adicione os cogumelos fatiados e deixe cozinhar.",
      "Junte o arroz e regue com vinho branco.",
      "Adicione o caldo de legumes aos poucos, mexendo sempre.",
      "Continue até o arroz ficar cremoso.",
      "Finalize com queijo parmesão.",
    ],
  },
  {
    name: "Tacos de Feijão Preto",
    prepTime: 20,
    tags: ["fast", "vegetarian", "kid-friendly"],
    ingredients: ["Tortillas", "Feijão preto", "Abacate", "Lima", "Coentros"],
    instructionSteps: [
      "Aqueça o feijão preto numa frigideira com temperos.",
      "Corte o abacate em fatias.",
      "Aqueça as tortillas no micro-ondas ou frigideira.",
      "Recheie as tortillas com feijão e abacate.",
      "Finalize com sumo de lima e coentros picados.",
    ],
  },
  {
    name: "Omolete de Espinafres e Feta",
    prepTime: 10,
    tags: ["fast", "vegetarian", "healthy"],
    ingredients: ["Ovos", "Espinafres frescos", "Queijo Feta"],
    instructionSteps: [
      "Bata os ovos numa tigele.",
      "Pique os espinafres grosseiramente.",
      "Misture os espinafres e o queijo feta aos ovos.",
      "Aqueça uma frigideira com manteiga.",
      "Deite a mistura e cozinhe em lume brando.",
      "Vire quando estiver quase cozinhado.",
    ],
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
    instructionSteps: [
      "Refogue a cebola picada em azeite.",
      "Adicione o bacalhau desfiado.",
      "Deixe cozinhar por alguns minutos.",
      "Junte a batata palha.",
      "Bata os ovos e adicione ao preparado.",
      "Envolva bem até os ovos ficarem cozidos.",
      "Finalize com azeitonas.",
    ],
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
    instructionSteps: [
      "Triture o grão-de-bico num processador.",
      "Misture com a cenoura ralada.",
      "Tempere com sal e especiarias.",
      "Forme hambúrgueres com as mãos.",
      "Grelhe numa frigideira ou churrasqueira.",
      "Sirva no pão com alface.",
    ],
  },
  {
    name: "Strogonoff de Cogumelos",
    prepTime: 25,
    tags: ["fast", "vegetarian"],
    ingredients: ["Cogumelos Paris", "Natas vegetais", "Arroz branco"],
    instructionSteps: [
      "Corte os cogumelos em lâminas.",
      "Salteie os cogumelos numa frigideira.",
      "Adicione as natas vegetais.",
      "Deixe cozinhar em lume médio.",
      "Sirva com arroz branco.",
    ],
  },
  {
    name: "Dourada Grelhada com Legumes",
    prepTime: 30,
    tags: ["standard", "pescatarian", "healthy"],
    ingredients: ["Dourada fresca", "Curgete", "Beringela", "Pimento"],
    instructionSteps: [
      "Lave e limpe a dourada.",
      "Corte os legumes em fatias.",
      "Tempere tudo com sal, alho e azeite.",
      "Grelhe a dourada de ambos os lados.",
      "Grelhe os legumes até ficarem macios.",
      "Sirva imediatamente.",
    ],
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
