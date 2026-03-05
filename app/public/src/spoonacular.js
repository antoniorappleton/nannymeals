import { CONFIG } from "./config.js";
const SPOONACULAR_API_KEY = CONFIG.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";

/**
 * Funções utilitárias para interface com a API Spoonacular.
 * Focada em enriquecimento de dados: Nutrição e Preços.
 */

/**
 * Busca informações completas de uma receita pelo nome.
 * Útil para encontrar o ID da Spoonacular e obter os dados.
 */
export async function getEnrichedRecipeData(recipeName) {
  try {
    const fetchWithQuery = async (q) => {
      const url = `${BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(q)}&addRecipeInformation=true&number=1&apiKey=${SPOONACULAR_API_KEY}`;
      const response = await fetch(url);
      
      if (response.status === 402) {
        throw new Error("Spoonacular API: Limite diário atingido (402). Verifique o seu dashboard.");
      }
      
      return await response.json();
    };

    let data = await fetchWithQuery(recipeName);

    // Fallback 1: Simplified search (First 2 words often define the dish best in PT)
    if (!data.results || data.results.length === 0) {
      const words = recipeName.split(" ");
      const simplified = words.slice(0, 2).join(" ");
      if (simplified !== recipeName && words.length > 1) {
        console.log(`Tentativa de fallback para: ${simplified}`);
        data = await fetchWithQuery(simplified);
      }
    }

    if (!data.results || data.results.length === 0) {
      console.warn(`Receita não encontrada na Spoonacular: ${recipeName}`);
      return null;
    }

    const details = data.results[0];

    return {
      calories: Math.round(details.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 
                (details.healthScore > 0 ? (details.healthScore * 5) + 200 : 350)), 
      protein: details.nutrition?.nutrients?.find(n => n.name === "Protein") ? 
               `${Math.round(details.nutrition.nutrients.find(n => n.name === "Protein").amount)}g` : "20g",
      pricePerServing: (details.pricePerServing / 100).toFixed(2),
      totalCost: ((details.pricePerServing * (details.servings || 1)) / 100).toFixed(2),
      servings: details.servings || 1,
      image: details.image,
      spoonacularId: details.id,
      spoonacularSource: details.sourceUrl
    };
  } catch (error) {
    console.error("Erro ao chamar Spoonacular API:", error);
    return null;
  }
}

/**
 * Analisa uma lista de ingredientes para obter nutrição e preço estimado.
 * Caso não encontremos a receita pelo nome, podemos carregar pelos ingredientes.
 */
export async function analyzeIngredients(ingredientsList) {
  try {
    const res = await fetch(`${BASE_URL}/recipes/parseIngredients?apiKey=${SPOONACULAR_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `ingredientList=${encodeURIComponent(ingredientsList.join("\n"))}&includeNutrition=true`
    });
    const data = await res.json();
    
    // Agregação simples para demonstração
    let totalCals = 0;
    let totalCost = 0;
    
    data.forEach(item => {
      totalCals += item.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0;
      totalCost += item.estimatedCost?.value || 0; // Normalmente em cents
    });

    return {
      calories: Math.round(totalCals),
      totalCost: (totalCost / 100).toFixed(2)
    };
  } catch (error) {
    console.error("Erro ao analisar ingredientes:", error);
    return null;
  }
}

/**
 * Procura novas receitas por dieta/estilo.
 * Útil quando o banco local não tem opções suficientes.
 */
export async function searchRecipesByCuisine(diet, count = 10) {
  try {
    const url = `${BASE_URL}/recipes/complexSearch?diet=${encodeURIComponent(diet)}&addRecipeInformation=true&number=${count}&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map(details => ({
      name: details.title,
      prepTime: details.readyInMinutes,
      tags: [details.dishTypes?.[0], details.vegetarian ? 'vegetarian' : null, details.vegan ? 'vegan' : null].filter(Boolean),
      ingredients: details.extendedIngredients?.map(i => i.original) || [],
      instructions: details.summary?.replace(/<[^>]*>/g, '').slice(0, 500),
      calories: Math.round(details.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0),
      pricePerServing: (details.pricePerServing / 100).toFixed(2),
      image: details.image,
      spoonacularId: details.id
    }));
  } catch (error) {
    console.error("Erro ao buscar receitas por dieta:", error);
    return [];
  }
}
