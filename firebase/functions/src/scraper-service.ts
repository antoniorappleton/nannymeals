import axios from "axios";
import * as cheerio from "cheerio";

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
function parseIngredientString(str: string): {
  amount: number | null;
  unit: string | null;
  name: string;
} {
  const clean = str.replace(/ de /g, " ").replace(/ +/g, " ").trim();
  const match = clean.match(
    /^([\d,\/\.]+)?\s*(g|kg|ml|l|cl|colher|chá|sopa|unidade|un|dentes|fatias|latas|embalagem)?\s*(.*)$/i,
  );

  if (!match) return { amount: null, unit: null, name: str };

  let amountStr = match[1] || null;
  let amount = null;
  if (amountStr) {
    amount = parseFloat(amountStr.replace(",", "."));
    if (isNaN(amount)) amount = null;
  }

  return {
    amount,
    unit: match[2] || null,
    name: match[3] || str,
  };
}

/**
 * Parsing logic for Mini Preço
 */
export function parseMiniPreco($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1').text().trim() || $('strong').first().text().trim();
  const image = $('meta[property="og:image"]').attr('content') || null;
  
  const ingredients: ScrapedIngredient[] = [];
  // Mini Preço structure is often flat, we look for ingredients after the header
  $('b:contains("Ingredientes"), h2:contains("Ingredientes")').nextAll('div, p').each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text && !text.toLowerCase().includes('modo de')) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    } else if (text.toLowerCase().includes('modo de')) {
       return false; // Stop at preparation
    }
  });

  const instructions = $('b:contains("Modo de"), h2:contains("Modo de")').nextAll('div, p').text().trim();

  return {
    name, image, prepTime: 30, servings: 4, ingredients, instructions,
    sourceUrl: url,
    sourceName: 'Mini Preço'
  };
}

/**
 * Parsing logic for Lidl
 */
export function parseLidl($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1').text().trim();
  const image = $('meta[property="og:image"]').attr('content') || null;
  
  const ingredients: ScrapedIngredient[] = [];
  $('label.flex.items-center, .recipe-ingredients__item').each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const instructions = $('h2:contains("Passo a Passo")').nextAll('p, ol, li').text().trim() || $('.recipe-preparation').text().trim();

  return {
    name, image, prepTime: 45, servings: 4, ingredients, instructions,
    sourceUrl: url,
    sourceName: 'Lidl'
  };
}

/**
 * Parsing logic for Continente
 */
export function parseContinente($: cheerio.CheerioAPI, url: string = ''): ScrapedRecipe {
  const name = $('h1').first().text().trim();
  const image =
    $('meta[property="og:image"]').attr("content") ||
    $("img.recipe-hero-image").attr("src") ||
    null;

  // Robust prepTime detection
  let prepTime = 0;
  const timeText = $('.recipe-info-item:contains("min"), .recipe-hero__info-item:contains("min"), .recipe-info__item:contains("min")').first().text();
  prepTime = parseInt(timeText.replace(/\D/g, '')) || 0;

  // Robust servings detection
  let servings = 4;
  const servingsText = $('.recipe-info-item:contains("porções"), .recipe-hero__info-item:contains("porções"), .recipe-info-item:contains("doses"), .recipe-info__item:contains("doses")').first().text();
  const servingsMatch = servingsText.match(/\d+/);
  if (servingsMatch) servings = parseInt(servingsMatch[0]);

  const ingredients: ScrapedIngredient[] = [];
  // Try both old and new (Feed) selectors
  const ingSelector = '.recipe-ingredients-list li, .ingredientList__body li, .recipe-ingredients__item';
  $(ingSelector).each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  // Try both old and new (Feed) selectors for instructions
  const stepSelector = '.recipe-preparation-steps, .recipeSteps__body li, .recipe-preparation__content';
  const steps: string[] = [];
  $(stepSelector).each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text) steps.push(text);
  });

  return {
    name, image, prepTime, servings, ingredients, 
    instructions: steps.join('\n'),
    sourceUrl: url,
    sourceName: 'Continente'
  };
}

/**
 * Parsing logic for Pingo Doce
 */
export function parsePingoDoce(
  $: cheerio.CheerioAPI,
  url: string = "",
): ScrapedRecipe {
  const name = $("h1").first().text().trim();
  const image = $('meta[property="og:image"]').attr("content") || null;
  const prepTime =
    parseInt(
      $('.recipe-details__item:contains("min")').text().replace(/\D/g, ""),
    ) || 0;
  const servings =
    parseInt(
      $('.recipe-details__item:contains("doses")').text().replace(/\D/g, ""),
    ) || 4;

  const ingredients: ScrapedIngredient[] = [];
  $(".recipe-ingredients__list li").each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const steps: string[] = [];
  $(".recipe-preparation__list li").each((_: number, el: any) => {
    steps.push($(el).text().trim());
  });

  return {
    name,
    image,
    prepTime,
    servings,
    ingredients,
    instructions: steps.join("\n"),
    sourceUrl: url,
    sourceName: "Pingo Doce",
  };
}

/**
 * Parsing logic for Auchan
 */
export function parseAuchan(
  $: cheerio.CheerioAPI,
  url: string = "",
): ScrapedRecipe {
  const name =
    $("h1.recipe-hero__title").text().trim() || $("h1").first().text().trim();
  const image =
    $("img.recipe-hero__image").attr("src") ||
    $('meta[property="og:image"]').attr("content") ||
    null;

  let prepTime = 0;
  let servings = 4;

  $(".meta-card__summary-item").each((_: number, el: any) => {
    const text = $(el).text().trim();
    if (
      text.toLowerCase().includes("min") ||
      text.toLowerCase().includes("hora")
    ) {
      const match = text.match(/\d+/);
      if (match) {
        let val = parseInt(match[0]);
        if (text.toLowerCase().includes("hora")) val *= 60;
        prepTime = val;
      }
    } else if (
      text.toLowerCase().includes("pessoa") ||
      text.toLowerCase().includes("dose")
    ) {
      const match = text.match(/\d+/);
      if (match) servings = parseInt(match[0]);
    }
  });

  const ingredients: ScrapedIngredient[] = [];
  $(".recipe-ingredients__item").each((_: number, el: any) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) {
      const parsed = parseIngredientString(text);
      ingredients.push({ ...parsed, original: text });
    }
  });

  const instructions =
    $(".recipe-preparation__content").text().trim() ||
    $(".recipe-preparation").text().trim();

  return {
    name,
    image,
    prepTime,
    servings,
    ingredients,
    instructions,
    sourceUrl: url,
    sourceName: "Auchan",
  };
}

/**
 * Generic Text Parser (Best effort)
 */
export function parseGenericText(text: string): ScrapedRecipe {
  // Simple heuristic: first line is title
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);
  const name = lines[0] || "Receita Importada";

  const ingredients: ScrapedIngredient[] = [];
  const instructions: string[] = [];
  let mode: "meta" | "ings" | "steps" = "meta";

  lines.slice(1).forEach((line) => {
    const l = line.toLowerCase();
    if (l.includes("ingrediente")) {
      mode = "ings";
      return;
    }
    if (l.includes("prepara") || l.includes("passo") || l.includes("modo")) {
      mode = "steps";
      return;
    }

    if (mode === "ings" && line.length > 2) {
      ingredients.push({ ...parseIngredientString(line), original: line });
    } else if (mode === "steps" && line.length > 2) {
      instructions.push(line);
    }
  });

  return {
    name,
    image: null,
    prepTime: 30,
    servings: 4,
    ingredients,
    instructions: instructions.join("\n"),
    sourceUrl: "",
    sourceName: "Texto Colado",
  };
}

/**
 * Generic LD+JSON Parser
 */
export function parseLdJson(html: string): ScrapedRecipe | null {
  try {
    const $ = cheerio.load(html);
    let recipeData: any = null;

    $('script[type="application/ld+json"]').each((_: number, el: any) => {
      try {
        const json = JSON.parse($(el).html() || '');
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          const type = item['@type'];
          const types = Array.isArray(type) ? type : [type];
          if (types.includes('Recipe')) {
            recipeData = item;
            break;
          }
          if (item['@graph']) {
             const graphRecipe = item['@graph'].find((it: any) => it['@type'] === 'Recipe' || (Array.isArray(it['@type']) && it['@type'].includes('Recipe')));
             if (graphRecipe) {
               recipeData = graphRecipe;
               break;
             }
          }
        }
      } catch (e) {}
      if (recipeData) return false;
    });

    if (!recipeData) return null;

    const name = recipeData.name || '';
    const image = Array.isArray(recipeData.image) ? recipeData.image[0] : (recipeData.image?.url || recipeData.image || null);
    
    // Parse ISO 8601 duration
    const parseDuration = (d: string) => {
      if (!d) return 0;
      const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!m) return 0;
      return (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0');
    };

    const prepTime = parseDuration(recipeData.prepTime) + parseDuration(recipeData.cookTime) || 30;
    const servings = parseInt(recipeData.recipeYield) || 4;
    
    const ingredients: ScrapedIngredient[] = (recipeData.recipeInstructions || []).length > 0 ? (recipeData.recipeIngredient || []).map((text: string) => ({
       ...parseIngredientString(text),
       original: text
    })) : [];

    const instructions = Array.isArray(recipeData.recipeInstructions) 
      ? recipeData.recipeInstructions.map((s: any) => s.text || s.name || String(s)).join('\n')
      : String(recipeData.recipeInstructions || '');

    return {
      name, image, prepTime, servings, ingredients, instructions,
      sourceUrl: '',
      sourceName: 'Metadata'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Main entry point for HTML extraction
 */
export function extractFromHtml(html: string, url: string = ''): ScrapedRecipe {
  // Strategy 1: LD+JSON (Most reliable)
  const ldJsonRecipe = parseLdJson(html);
  if (ldJsonRecipe && ldJsonRecipe.ingredients.length > 0) {
    return { ...ldJsonRecipe, sourceUrl: url, sourceName: ldJsonRecipe.sourceName === 'Metadata' ? (url ? new URL(url).hostname : 'Imported') : ldJsonRecipe.sourceName };
  }

  const $ = cheerio.load(html);

  // Detect source
  if (html.includes('continente.pt') || $('.recipe-ingredients-list').length) return parseContinente($, url);
  if (html.includes('pingodoce.pt') || $('.recipe-ingredients__list').length) return parsePingoDoce($, url);
  if (html.includes('auchan.pt') || $('.recipe-ingredients__item').length) return parseAuchan($, url);
  if (html.includes('minipreco.pt') || html.includes('pagina-receitas')) return parseMiniPreco($, url);
  if (html.includes('lidl.pt') || html.includes('receitas.lidl')) return parseLidl($, url);

  // Catch generic recipe from sites like AllRecipes or Portuguese blogs
  const generic = parseGenericText($("body").text() || html);

  // Try to find an image if missing
  if (!generic.image) {
    const metaImg =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");
    if (metaImg) {
      generic.image = metaImg;
    } else {
      // Look for the largest/first likely recipe image
      const imgs = $("img")
        .map((_: number, el: any) => ({
          src: $(el).attr("src"),
          width: parseInt($(el).attr("width") || "0"),
          alt: $(el).attr("alt") || "",
        }))
        .get();

      const likely = imgs.find(
        (i: any) =>
          i.src &&
          !i.src.includes("logo") &&
          !i.src.includes("icon") &&
          (i.width > 200 ||
            (i.alt &&
              i.alt
                .toLowerCase()
                .includes(generic.name.split(" ")[0].toLowerCase()))),
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
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  return extractFromHtml(html, url);
}

/**
 * Pingo Doce Fetcher
 */
export async function extractFromPingoDoce(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  return extractFromHtml(html, url);
}

/**
 * Auchan Fetcher
 */
export async function extractFromAuchan(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  return extractFromHtml(html, url);
}

/**
 * Mini Preço Fetcher
 */
export async function extractFromMiniPreco(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  return extractFromHtml(html, url);
}

/**
 * Lidl Fetcher
 */
export async function extractFromLidl(url: string): Promise<ScrapedRecipe> {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  return extractFromHtml(html, url);
}

/**
 * Price Lookup
 */
export async function getPriceInStore(ingredientName: string, store: 'continente' | 'pingodoce' | 'auchan' | 'minipreco' | 'lidl'): Promise<number | null> {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    if (store === 'continente') {
      const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: { 'User-Agent': userAgent } });
      const $ = cheerio.load(html);
      const priceStr = $('.product-tile .price-sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace('€', '').trim());
        return isNaN(price) ? null : price;
      }
    } else if (store === 'pingodoce') {
      const searchUrl = `https://www.pingodoce.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: { 'User-Agent': userAgent } });
      const $ = cheerio.load(html);
      const priceStr = $('.product-price .sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace('€', '').split('/')[0].trim());
        return isNaN(price) ? null : price;
      }
    } else if (store === 'auchan' || store === 'minipreco') {
      const searchUrl = `https://www.auchan.pt/pt/pesquisa?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: { 'User-Agent': userAgent } });
      const $ = cheerio.load(html);
      const priceStr = $('.auc-product-tile__prices .sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace('€', '').split('/')[0].trim());
        return isNaN(price) ? null : price;
      }
    } else if (store === 'lidl') {
      const searchUrl = `https://www.lidl.pt/q/search?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: { 'User-Agent': userAgent } });
      const $ = cheerio.load(html);
      const priceStr = $('.ods-price__value').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').trim());
        return isNaN(price) ? null : price;
      }
    }
  } catch (err) {
    console.error(`Error looking up price for ${ingredientName} in ${store}:`, err);
  }
  return null;
}
