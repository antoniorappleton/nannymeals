const SPOONACULAR_API_KEY = "a412caf47e8e4a3fae42fe9e41b9bde9";
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
    // Usar complexSearch com addRecipeInformation=true economiza "points" da API
    // (1 call vs 2 calls separadas)
    const url = `${BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(recipeName)}&addRecipeInformation=true&number=1&apiKey=${SPOONACULAR_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`Receita não encontrada na Spoonacular: ${recipeName}`);
      return null;
    }

    const details = data.results[0];

    return {
      calories: Math.round(details.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 
                details.healthScore > 0 ? (details.healthScore * 5) + 200 : 0), // Fallback aproximado se nutrition não vier
      protein: details.nutrition?.nutrients?.find(n => n.name === "Protein") ? 
               `${Math.round(details.nutrition.nutrients.find(n => n.name === "Protein").amount)}g` : "---",
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
