/**
 * Módulo de Integração com Apps de Supermercados Portugueses
 * 
 * Fornece funções para gerar deep links para apps de supermercados
 * e também funções para buscar preços (web scraping)
 */

// Configuration for supermarket apps
export const SUPERMARKETS = {
  supersave: {
    name: "Super Save",
    color: "#FF6B35",
    scheme: "supersave://",
    webUrl: "https://www.supersave.pt/",
    deepLinkFormat: (items) => `supersave://list?items=${encodeURIComponent(items.join(","))}`,
    searchUrl: (query) => `https://www.supersave.pt/search?q=${encodeURIComponent(query)}`
  },
  auchan: {
    name: "Auchan",
    color: "#E30613",
    scheme: "auchan://",
    webUrl: "https://www.auchan.pt/",
    deepLinkFormat: (items) => `auchan://shopping-list?products=${encodeURIComponent(items.join(","))}`,
    searchUrl: (query) => `https://www.auchan.pt/pt/pesquisa?q=${encodeURIComponent(query)}`
  },
  continente: {
    name: "Continente",
    color: "#0073A7",
    scheme: "continente://",
    webUrl: "https://www.continente.pt/",
    deepLinkFormat: (items) => `continente://app/shopping-list?items=${encodeURIComponent(items.join(","))}`,
    searchUrl: (query) => `https://www.continente.pt/pesquisa?q=${encodeURIComponent(query)}`
  },
  pingodoce: {
    name: "Pingo Doce",
    color: "#00A04A",
    scheme: "pingodoce://",
    webUrl: "https://www.pingodoce.pt/",
    deepLinkFormat: (items) => `pingodoce://list?products=${encodeURIComponent(items.join(","))}`,
    searchUrl: (query) => `https://www.pingodoce.pt/pesquisa?q=${encodeURIComponent(query)}`
  },
  intermarche: {
    name: "Intermarché",
    color: "#FF6600",
    scheme: "intermarche://",
    webUrl: "https://www.intermarche.pt/",
    deepLinkFormat: (items) => `intermarche://shopping-list?items=${encodeURIComponent(items.join(","))}`,
    searchUrl: (query) => `https://www.intermarche.pt/pesquisa?q=${encodeURIComponent(query)}`
  }
};

// Mapeamento de nomes em inglês para português
const INGREDIENT_TRANSLATIONS = {
  "tortillas": "tortillas",
  "feijao preto": "feijao preto",
  "black beans": "feijao preto",
  "abacate": "abacate",
  "avocado": "abacate",
  "coentros": "coentros",
  "cilantro": "coentros",
  "ervas aromaticas": "ervas aromaticas",
  "herbs": "ervas aromaticas",
  "grao-de-bico": "grao de bico",
  "chickpeas": "grao de bico",
  "esparguete": "espaguete",
  "spaghetti": "espaguete",
  "molho pesto": "molho pesto",
  "pesto sauce": "molho pesto",
  "bay leaf": "louro",
  "fresh black pepper": "pimenta preta",
  "butter": "manteiga",
  "egg": "ovos",
  "eggs": "ovos",
  "milk": "leite",
  "onion": "cebola",
  "salmon": "salmao",
  "batata doce": "batata doce",
  "sweet potato": "batata doce",
  "brocolos": "brocolos",
  "broccoli": "brocolos",
  "cenoura": "cenoura",
  "alface": "alface",
  "lettuce": "alface",
  "tomate cereja": "tomate cereja",
  "cherry tomato": "tomate cereja",
  "pao de hamburger": "pao de hamburger",
  "hamburger bun": "pao de hamburger",
  "queijo parmesan": "queijo parmesan",
  "parmesan cheese": "queijo parmesan",
  "tomate": "tomate",
  "arroz": "arroz",
  "rice": "arroz",
  "massa": "massa",
  "pasta": "massa",
  "frango": "frango",
  "chicken": "frango",
  "batata": "batata",
  "potato": "batata",
  "cebola": "cebola",
  "alho": "alho",
  "garlic": "alho",
  "leite": "leite",
  "ovos": "ovos",
  "queijo": "queijo",
  "cheese": "queijo",
  "manteiga": "manteiga",
  "azeite": "azeite",
  "olive oil": "azeite",
  "sal": "sal",
  "pao": "pao",
  "bread": "pao"
};

// Traduz ingrediente para portugues
const translateIngredient = (name) => {
  const lowerName = name.toLowerCase().trim();
  if (INGREDIENT_TRANSLATIONS[lowerName]) {
    return INGREDIENT_TRANSLATIONS[lowerName];
  }
  for (const [eng, pt] of Object.entries(INGREDIENT_TRANSLATIONS)) {
    if (lowerName.includes(eng)) {
      return pt;
    }
  }
  return name.replace(/^[\d.,/]+\s*(g|kg|ml|l|unid|colher|cha|sopa|cup|tablespoon|teaspoon|ounce|pound)?\s*/i, "").trim();
};

/**
 * Gera um link para abrir o app do supermercado com os ingredientes
 */
export const generateSupermarketLink = (supermarketId, ingredients) => {
  const supermarket = SUPERMARKETS[supermarketId];
  if (!supermarket) {
    console.error(`Supermercado nao reconhecido: ${supermarketId}`);
    return null;
  }

  // Limpar e traduzir nomes dos ingredientes
  const cleanIngredients = ingredients.map(ing => {
    const translated = translateIngredient(ing);
    const cleaned = translated.replace(/^[\d.,/]+\s*(g|kg|ml|l|unid|colher|cha|sopa|cup|tablespoon|teaspoon|ounce|pound)?\s*/i, "");
    return encodeURIComponent(cleaned.trim());
  });

  // Para o deep link, usar nomes limpos mas nao traduzidos (os apps podem nao reconhecer)
  const originalClean = ingredients.map(ing => {
    return encodeURIComponent(ing.replace(/^[\d.,/]+\s*(g|kg|ml|l|unid|colher|cha|sopa|cup|tablespoon|teaspoon|ounce|pound)?\s*/i, "").trim());
  });

  const appLink = supermarket.deepLinkFormat(originalClean);
  const directWebUrl = supermarket.searchUrl(cleanIngredients.map(d => decodeURIComponent(d)));

  return {
    appLink,
    webLink: directWebUrl,
    supermarket: supermarket.name,
    available: true
  };
};

/**
 * Gera links para todos os supermercados
 */
export const generateAllSupermarketLinks = (ingredients) => {
  const links = {};
  Object.keys(SUPERMARKETS).forEach(key => {
    links[key] = generateSupermarketLink(key, ingredients);
  });
  return links;
};

/**
 * Abre o link no app ou no navegador
 */
export const openLink = async (url, fallbackUrl) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      window.open(fallbackUrl, '_blank');
      return;
    }
    window.location.href = url;
  } catch (error) {
    console.log("App nao disponivel, a abrir navegador:", error);
    if (fallbackUrl) {
      window.open(fallbackUrl, '_blank');
    }
  }
};

/**
 * Verifica se um app de supermercado esta instalado
 */
export const isAppInstalled = async (scheme) => {
  try {
    const response = await fetch(`${scheme}hello`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Preços simulados para demonstracao
 */
export const DEMO_PRICES = {
  "frango": { continente: 4.99, pingodoce: 4.79, auchan: 4.59, intermarche: 4.89, supersave: 4.69 },
  "arroz": { continente: 1.99, pingodoce: 1.89, auchan: 1.79, intermarche: 1.99, supersave: 1.85 },
  "massa": { continente: 1.29, pingodoce: 1.19, auchan: 1.09, intermarche: 1.25, supersave: 1.15 },
  "tomate": { continente: 2.49, pingodoce: 2.29, auchan: 2.19, intermarche: 2.39, supersave: 2.25 },
  "cebola": { continente: 1.59, pingodoce: 1.49, auchan: 1.39, intermarche: 1.55, supersave: 1.45 },
  "alho": { continente: 0.99, pingodoce: 0.89, auchan: 0.79, intermarche: 0.95, supersave: 0.85 },
  "batata": { continente: 2.29, pingodoce: 2.19, auchan: 1.99, intermarche: 2.25, supersave: 2.09 },
  "cenoura": { continente: 1.49, pingodoce: 1.39, auchan: 1.29, intermarche: 1.45, supersave: 1.35 },
  "leite": { continente: 0.99, pingodoce: 0.89, auchan: 0.79, intermarche: 0.95, supersave: 0.85 },
  "ovos": { continente: 2.49, pingodoce: 2.29, auchan: 2.19, intermarche: 2.39, supersave: 2.25 },
  "pao": { continente: 1.29, pingodoce: 1.19, auchan: 0.99, intermarche: 1.25, supersave: 1.10 },
  "queijo": { continente: 4.99, pingodoce: 4.79, auchan: 4.59, intermarche: 4.89, supersave: 4.69 },
  "manteiga": { continente: 2.99, pingodoce: 2.79, auchan: 2.59, intermarche: 2.89, supersave: 2.69 },
  "azeite": { continente: 5.99, pingodoce: 5.79, auchan: 5.49, intermarche: 5.89, supersave: 5.59 },
  "sal": { continente: 0.79, pingodoce: 0.69, auchan: 0.59, intermarche: 0.75, supersave: 0.65 },
  "acucar": { continente: 1.49, pingodoce: 1.39, auchan: 1.29, intermarche: 1.45, supersave: 1.35 }
};

/**
 * Busca precos para um ingrediente
 */
export const fetchPricesForIngredient = async (ingredientName) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const normalizedName = ingredientName.toLowerCase().trim();
  for (const [key, prices] of Object.entries(DEMO_PRICES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return prices;
    }
  }
  return { continente: null, pingodoce: null, auchan: null, intermarche: null, supersave: null };
};

/**
 * Busca precos para todos os itens da lista
 */
export const fetchPricesForGroceryList = async (items) => {
  const itemsWithPrices = await Promise.all(
    items.map(async (item) => {
      const prices = await fetchPricesForIngredient(item.name);
      let bestPrice = null;
      let bestStore = null;
      for (const [store, price] of Object.entries(prices)) {
        if (price !== null && (bestPrice === null || price < bestPrice)) {
          bestPrice = price;
          bestStore = store;
        }
      }
      return {
        ...item,
        prices,
        bestPrice: bestPrice ? { store: bestStore, price: bestPrice } : null
      };
    })
  );
  return itemsWithPrices;
};
