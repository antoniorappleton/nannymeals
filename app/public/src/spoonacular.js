import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-functions.js";

// helper that wraps the callable proxy defined in Cloud Functions
const functions = getFunctions();

// transforms a raw Spoonacular search response into the shape used by the
// rest of the app. This duplicates a little logic that used to live in
// the client before the proxy existed, but keeps the transformation local.
function normalizeDetails(details) {
  return {
    calories: Math.round(
      details.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount ||
        (details.healthScore > 0 ? details.healthScore * 5 + 200 : 350),
    ),
    protein: details.nutrition?.nutrients?.find((n) => n.name === "Protein")
      ? `${Math.round(
          details.nutrition.nutrients.find((n) => n.name === "Protein").amount,
        )}g`
      : "20g",
    pricePerServing: (details.pricePerServing / 100).toFixed(2),
    totalCost: ((details.pricePerServing * (details.servings || 1)) / 100).toFixed(2),
    servings: details.servings || 1,
    image: details.image,
    spoonacularId: details.id,
    spoonacularSource: details.sourceUrl,
  };
}

export async function getEnrichedRecipeData(recipeName) {
  try {
    const proxy = httpsCallable(functions, "spoonacularProxy");
    const resp = await proxy({ action: "enrichByName", params: { recipeName } });
    const data = resp.data;

    if (!data || !data.results || data.results.length === 0) {
      console.warn(`Receita não encontrada na Spoonacular: ${recipeName}`);
      return null;
    }

    return normalizeDetails(data.results[0]);
  } catch (error) {
    console.error("Erro ao chamar Spoonacular via proxy:", error);
    return null;
  }
}

// the analyzeIngredients endpoint was not exposed; keep a simple client-side
// implementation in case it is needed in the future. it no longer uses the key.
export async function analyzeIngredients(ingredientsList) {
  console.warn("analyzeIngredients não está disponível via proxy ainda");
  return null;
}

export async function searchRecipesByCuisine(diet, count = 10) {
  try {
    const proxy = httpsCallable(functions, "spoonacularProxy");
    const resp = await proxy({ action: "searchByCuisine", params: { diet, count } });
    const data = resp.data;

    if (!data || !data.results) return [];

    return data.results.map((details) => ({
      name: details.title,
      prepTime: details.readyInMinutes,
      tags: [
        details.dishTypes?.[0],
        details.vegetarian ? "vegetarian" : null,
        details.vegan ? "vegan" : null,
      ].filter(Boolean),
      ingredients: details.extendedIngredients?.map((i) => i.original) || [],
      instructions: details.summary?.replace(/<[^>]*>/g, "").slice(0, 500),
      calories: Math.round(
        details.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount || 0,
      ),
      pricePerServing: (details.pricePerServing / 100).toFixed(2),
      image: details.image,
      spoonacularId: details.id,
    }));
  } catch (error) {
    console.error("Erro ao buscar receitas por dieta via proxy:", error);
    return [];
  }
}
