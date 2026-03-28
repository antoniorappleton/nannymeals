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
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
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
 * Parsing logic for Continente
 */
export function parseContinente($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1').first().text().trim();
  const image = $('meta[property="og:image"]').attr('content') || $('img.recipe-hero-image').attr('src') || null;
  const prepTime = parseInt($('.recipe-info-item:contains("min")').text().replace(/\D/g, '')) || 0;
  const servings = parseInt($('.recipe-info-item:contains("porções")').text().replace(/\D/g, '')) || 4;

  const ingredients: ScrapedIngredient[] = [];
  $('.recipe-ingredients-list li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const instructions = $('.recipe-preparation-steps').text().trim();

  return {
    name, image, prepTime, servings, ingredients, instructions,
    sourceUrl: url,
    sourceName: 'Continente'
  };
}

/**
 * Parsing logic for Pingo Doce
 */
export function parsePingoDoce($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1').first().text().trim();
  const image = $('meta[property="og:image"]').attr('content') || null;
  const prepTime = parseInt($('.recipe-details__item:contains("min")').text().replace(/\D/g, '')) || 0;
  const servings = parseInt($('.recipe-details__item:contains("doses")').text().replace(/\D/g, '')) || 4;

  const ingredients: ScrapedIngredient[] = [];
  $('.recipe-ingredients__list li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const steps: string[] = [];
  $('.recipe-preparation__list li').each((_, el) => {
    steps.push($(el).text().trim());
  });

  return {
    name, image, prepTime, servings, ingredients, instructions: steps.join('\n'),
    sourceUrl: url,
    sourceName: 'Pingo Doce'
  };
}

/**
 * Parsing logic for Auchan
 */
export function parseAuchan($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1.recipe-hero__title').text().trim() || $('h1').first().text().trim();
  const image = $('img.recipe-hero__image').attr('src') || $('meta[property="og:image"]').attr('content') || null;
  
  let prepTime = 0;
  let servings = 4;

  $('.meta-card__summary-item').each((_, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('min') || text.toLowerCase().includes('hora')) {
      const match = text.match(/\d+/);
      if (match) {
        let val = parseInt(match[0]);
        if (text.toLowerCase().includes('hora')) val *= 60;
        prepTime = val;
      }
    } else if (text.toLowerCase().includes('pessoa') || text.toLowerCase().includes('dose')) {
      const match = text.match(/\d+/);
      if (match) servings = parseInt(match[0]);
    }
  });

  const ingredients: ScrapedIngredient[] = [];
  $('.recipe-ingredients__item').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const instructions = $('.recipe-preparation__content').text().trim() || $('.recipe-preparation').text().trim();

  return {
    name, image, prepTime, servings, ingredients, instructions,
    sourceUrl: url,
    sourceName: 'Auchan'
  };
}

/**
 * Generic Text Parser (Best effort)
 */
export function parseGenericText(text: string): ScrapedRecipe {
  // Simple heuristic: first line is title
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const name = lines[0] || 'Receita Importada';
  
  const ingredients: ScrapedIngredient[] = [];
  const instructions: string[] = [];
  let mode: 'meta' | 'ings' | 'steps' = 'meta';

  lines.slice(1).forEach(line => {
    const l = line.toLowerCase();
    if (l.includes('ingrediente')) { mode = 'ings'; return; }
    if (l.includes('prepara') || l.includes('passo') || l.includes('modo')) { mode = 'steps'; return; }

    if (mode === 'ings' && line.length > 2) {
      ingredients.push({ ...parseIngredientString(line), original: line });
    } else if (mode === 'steps' && line.length > 2) {
      instructions.push(line);
    }
  });

  return {
    name,
    image: null,
    prepTime: 30,
    servings: 4,
    ingredients,
    instructions: instructions.join('\n'),
    sourceUrl: '',
    sourceName: 'Texto Colado'
  };
}

/**
 * Main entry point for HTML extraction
 */
export function extractFromHtml(html: string, url: string = ''): ScrapedRecipe {
  const $ = cheerio.load(html);
  
  // Detect source
  if (html.includes('continente.pt') || $('.recipe-ingredients-list').length) return parseContinente($, url);
  if (html.includes('pingodoce.pt') || $('.recipe-ingredients__list').length) return parsePingoDoce($, url);
  if (html.includes('auchan.pt') || $('.recipe-ingredients__item').length) return parseAuchan($, url);
  
  // Catch generic recipe from sites like AllRecipes or Portuguese blogs
  const generic = parseGenericText($('body').text() || html);
  
  // Try to find an image if missing
  if (!generic.image) {
    const metaImg = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content');
    if (metaImg) {
      generic.image = metaImg;
    } else {
      // Look for the largest/first likely recipe image
      const imgs = $('img').map((_, el) => ({
        src: $(el).attr('src'),
        width: parseInt($(el).attr('width') || '0'),
        alt: $(el).attr('alt') || ''
      })).get();
      
      const likely = imgs.find(i => 
        i.src && !i.src.includes('logo') && !i.src.includes('icon') && 
        (i.width > 200 || (i.alt && i.alt.toLowerCase().includes(generic.name.split(' ')[0].toLowerCase())))
      );
      if (likely && likely.src) generic.image = likely.src;
    }
  }

  return generic;
}

/**
 * Continente Fetcher
 */
export async function extractFromContinente(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  return parseContinente(cheerio.load(html), url);
}

/**
 * Pingo Doce Fetcher
 */
export async function extractFromPingoDoce(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  return parsePingoDoce(cheerio.load(html), url);
}

/**
 * Auchan Fetcher
 */
export async function extractFromAuchan(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  return parseAuchan(cheerio.load(html), url);
}

/**
 * Price Lookup
 */
export async function getPriceInStore(ingredientName: string, store: 'continente' | 'pingodoce' | 'auchan'): Promise<number | null> {
  try {
    if (store === 'continente') {
      const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(html);
      const priceStr = $('.product-tile .price-sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace('€', ''));
        return isNaN(price) ? null : price;
      }
    }
  } catch (err) {
    console.error(`Error looking up price for ${ingredientName} in ${store}:`, err);
  }
  return null;
}

