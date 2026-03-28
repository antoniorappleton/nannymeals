"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContinente = parseContinente;
exports.parsePingoDoce = parsePingoDoce;
exports.parseAuchan = parseAuchan;
exports.parseGenericText = parseGenericText;
exports.extractFromHtml = extractFromHtml;
exports.extractFromContinente = extractFromContinente;
exports.extractFromPingoDoce = extractFromPingoDoce;
exports.extractFromAuchan = extractFromAuchan;
exports.getPriceInStore = getPriceInStore;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
function parseIngredientString(str) {
    const clean = str.replace(/ de /g, ' ').replace(/ +/g, ' ').trim();
    const match = clean.match(/^([\d,\/\.]+)?\s*(g|kg|ml|l|cl|colher|chá|sopa|unidade|un|dentes|fatias|latas|embalagem)?\s*(.*)$/i);
    if (!match)
        return { amount: null, unit: null, name: str };
    let amountStr = match[1] || null;
    let amount = null;
    if (amountStr) {
        amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount))
            amount = null;
    }
    return {
        amount,
        unit: match[2] || null,
        name: match[3] || str
    };
}
function parseContinente($, url = '') {
    const name = $('h1').first().text().trim();
    const image = $('meta[property="og:image"]').attr('content') || $('img.recipe-hero-image').attr('src') || null;
    const prepTime = parseInt($('.recipe-info-item:contains("min")').text().replace(/\D/g, '')) || 0;
    const servings = parseInt($('.recipe-info-item:contains("porções")').text().replace(/\D/g, '')) || 4;
    const ingredients = [];
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
function parsePingoDoce($, url = '') {
    const name = $('h1').first().text().trim();
    const image = $('meta[property="og:image"]').attr('content') || null;
    const prepTime = parseInt($('.recipe-details__item:contains("min")').text().replace(/\D/g, '')) || 0;
    const servings = parseInt($('.recipe-details__item:contains("doses")').text().replace(/\D/g, '')) || 4;
    const ingredients = [];
    $('.recipe-ingredients__list li').each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
            const parsed = parseIngredientString(text);
            ingredients.push({ ...parsed, original: text });
        }
    });
    const steps = [];
    $('.recipe-preparation__list li').each((_, el) => {
        steps.push($(el).text().trim());
    });
    return {
        name, image, prepTime, servings, ingredients, instructions: steps.join('\n'),
        sourceUrl: url,
        sourceName: 'Pingo Doce'
    };
}
function parseAuchan($, url = '') {
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
                if (text.toLowerCase().includes('hora'))
                    val *= 60;
                prepTime = val;
            }
        }
        else if (text.toLowerCase().includes('pessoa') || text.toLowerCase().includes('dose')) {
            const match = text.match(/\d+/);
            if (match)
                servings = parseInt(match[0]);
        }
    });
    const ingredients = [];
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
function parseGenericText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const name = lines[0] || 'Receita Importada';
    const ingredients = [];
    const instructions = [];
    let mode = 'meta';
    lines.slice(1).forEach(line => {
        const l = line.toLowerCase();
        if (l.includes('ingrediente')) {
            mode = 'ings';
            return;
        }
        if (l.includes('prepara') || l.includes('passo') || l.includes('modo')) {
            mode = 'steps';
            return;
        }
        if (mode === 'ings' && line.length > 2) {
            ingredients.push({ ...parseIngredientString(line), original: line });
        }
        else if (mode === 'steps' && line.length > 2) {
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
function extractFromHtml(html, url = '') {
    const $ = cheerio.load(html);
    if (html.includes('continente.pt') || $('.recipe-ingredients-list').length)
        return parseContinente($, url);
    if (html.includes('pingodoce.pt') || $('.recipe-ingredients__list').length)
        return parsePingoDoce($, url);
    if (html.includes('auchan.pt') || $('.recipe-ingredients__item').length)
        return parseAuchan($, url);
    return parseGenericText($('body').text() || html);
}
async function extractFromContinente(url) {
    const { data: html } = await axios_1.default.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return parseContinente(cheerio.load(html), url);
}
async function extractFromPingoDoce(url) {
    const { data: html } = await axios_1.default.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return parsePingoDoce(cheerio.load(html), url);
}
async function extractFromAuchan(url) {
    const { data: html } = await axios_1.default.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return parseAuchan(cheerio.load(html), url);
}
async function getPriceInStore(ingredientName, store) {
    try {
        if (store === 'continente') {
            const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
            const { data: html } = await axios_1.default.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(html);
            const priceStr = $('.product-tile .price-sales').first().text().trim();
            if (priceStr) {
                const price = parseFloat(priceStr.replace(',', '.').replace('€', ''));
                return isNaN(price) ? null : price;
            }
        }
    }
    catch (err) {
        console.error(`Error looking up price for ${ingredientName} in ${store}:`, err);
    }
    return null;
}
//# sourceMappingURL=scraper-service.js.map