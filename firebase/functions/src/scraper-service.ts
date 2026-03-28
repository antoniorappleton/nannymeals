import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedIngredient {
  name: string;
  amount: number | null;
  unit: string | null;
  original: string;
  price?: number;
}

export interface ScrapedRecipe {
  name: string;
  image: string | null;
  prepTime: number;
  servings: number;
  ingredients: ScrapedIngredient[];
  instructions: string;
  sourceUrl: string;
  sourceName: string;
}

/**
 * Utility: Normalize Portuguese ingredient quantities
 * Example: "350 g de arroz" -> { amount: 350, unit: 'g', name: 'arroz' }
 */
function parseIngredientString(str: string): { amount: number | null; unit: string | null; name: string } {
  const clean = str.replace(/ de /g, ' ').replace(/ +/g, ' ').trim();
  const match = clean.match(/^([\d,\/\.]+)?\s*(g|kg|ml|l|cl|colher|chá|sopa|unidade|un|dentes|fatias|latas|embalagem)?\s*(.*)$/i);

  if (!match) return { amount: null, unit: null, name: str };

  let amountStr = match[1] || null;
  let amount = null;
  if (amountStr) {
    amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount)) amount = null;
  }

  return {
    amount,
    unit: match[2] || null,
    name: match[3] || str
  };
}

/**
 * Continente Scraper
 */
export async function extractFromContinente(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const $ = cheerio.load(html);

  const name = $('h1').text().trim();
  const image = $('meta[property="og:image"]').attr('content') || null;
  const prepTime = parseInt($('.recipe-info-item:contains("min")').text().replace(/\D/g, '')) || 0;
  const servings = parseInt($('.recipe-info-item:contains("porções")').text().replace(/\D/g, '')) || 4;

  const ingredients: ScrapedIngredient[] = [];
  $('.recipe-ingredients-list li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({
        ...parsed,
        original: text
      });
    }
  });

  const instructions = $('.recipe-preparation-steps').text().trim();

  return {
    name,
    image,
    prepTime,
    servings,
    ingredients,
    instructions,
    sourceUrl: url,
    sourceName: 'Continente'
  };
}

/**
 * Pingo Doce Scraper
 */
export async function extractFromPingoDoce(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const $ = cheerio.load(html);

  const name = $('h1').text().trim();
  const image = $('meta[property="og:image"]').attr('content') || null;
  
  // PD uses different selectors, often in icons list
  const prepTime = parseInt($('.recipe-details__item:contains("min")').text().replace(/\D/g, '')) || 0;
  const servings = parseInt($('.recipe-details__item:contains("doses")').text().replace(/\D/g, '')) || 4;

  const ingredients: ScrapedIngredient[] = [];
  $('.recipe-ingredients__list li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({
        ...parsed,
        original: text
      });
    }
  });

  const steps: string[] = [];
  $('.recipe-preparation__list li').each((_, el) => {
    steps.push($(el).text().trim());
  });

  return {
    name,
    image,
    prepTime,
    servings,
    ingredients,
    instructions: steps.join('\n'),
    sourceUrl: url,
    sourceName: 'Pingo Doce'
  };
}

/**
 * Price Lookup (Basic Search)
 * This hits the search endpoint and picks the first relevant product price.
 * For Continente, we can use their search API or scrape the search results.
 */
export async function getPriceInStore(ingredientName: string, store: 'continente' | 'pingodoce'): Promise<number | null> {
  try {
    if (store === 'continente') {
      const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(html);
      
      // Get first product price
      const priceStr = $('.product-tile .price-sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace('€', ''));
        return isNaN(price) ? null : price;
      }
    } else if (store === 'pingodoce') {
       // Pingo Doce Mercadão uses a cleaner API-like structure usually
       // For now, return a random realistic price as a placeholder if scrape fails
    }
  } catch (err) {
    console.error(`Error looking up price for ${ingredientName} in ${store}:`, err);
  }
  return null;
}
