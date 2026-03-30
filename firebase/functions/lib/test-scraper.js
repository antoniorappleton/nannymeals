"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const scraper_service_1 = require("./scraper-service");
async function testScraping() {
    const testCases = [
        {
            name: 'Continente (Feed)',
            url: 'https://feed.continente.pt/receitas/quiche-de-mozarela-espinafres-e-tomate',
            store: 'continente'
        },
        {
            name: 'Pingo Doce',
            url: 'https://www.pingodoce.pt/receitas/bacalhau-com-broa/',
            store: 'pingodoce'
        },
        {
            name: 'Auchan (Auchan&Eu)',
            url: 'https://auchaneeu.auchan.pt/receitas/bacalhau-a-bras/',
            store: 'auchan'
        },
        {
            name: 'Lidl',
            url: 'https://receitas.lidl.pt/receitas/bacalhau-gratinado-com-espinafres-receitas-economicas',
            store: 'lidl'
        }
    ];
    for (const test of testCases) {
        console.log(`\n========================================`);
        console.log(`Testing ${test.name}: ${test.url}`);
        console.log(`========================================`);
        try {
            const { data: html } = await axios_1.default.get(test.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const recipe = (0, scraper_service_1.extractFromHtml)(html, test.url);
            console.log('✅ Name:', recipe.name);
            console.log('✅ Image:', recipe.image ? 'Found' : 'MISSING');
            console.log('✅ Prep Time:', recipe.prepTime, 'min');
            console.log('✅ Servings:', recipe.servings);
            console.log('✅ Ingredients:', recipe.ingredients.length, 'found');
            if (recipe.ingredients.length > 0) {
                console.log('   Sample:', recipe.ingredients[0].original);
                const firstIng = recipe.ingredients[0].name;
                console.log(`\n--- Price Lookup (${test.store}) for: "${firstIng}" ---`);
                const price = await (0, scraper_service_1.getPriceInStore)(firstIng, test.store);
                console.log(`💰 Price: ${price !== null ? price + '€' : 'NOT FOUND'}`);
            }
            console.log('\n✅ Instructions (First 100 chars):');
            console.log(recipe.instructions.replace(/\n/g, ' ').substring(0, 100) + '...');
        }
        catch (err) {
            console.error(`❌ Error testing ${test.name}:`, err.message);
        }
    }
}
testScraping();
//# sourceMappingURL=test-scraper.js.map