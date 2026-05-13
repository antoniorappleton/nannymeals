const axios = require('axios');
const cheerio = require('cheerio');

async function getPriceInStore(ingredientName, store) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const commonHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    if (store === 'continente') {
      const searchUrl = `https://www.continente.pt/pesquisa/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: commonHeaders, timeout: 10000 });
      const $ = cheerio.load(html);
      const priceStr = 
        $('.product-price__amount--current').first().text().trim() ||
        $('.ct-price-value').first().text().trim() ||
        $('.pwc-tile--price-primary').first().text().trim() || 
        $('.product-tile .price-sales').first().text().trim();
      if (priceStr) {
        const price = parseFloat(priceStr.replace(',', '.').replace(/[^\d\.]/g, '').trim());
        return isNaN(price) ? null : price;
      }
    } else if (store === 'pingodoce') {
      const searchUrl = `https://www.pingodoce.pt/home/produtos/?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: commonHeaders, timeout: 10000 });
      const $ = cheerio.load(html);
      const priceStr = 
        $('.product-tile .product-price .sales').first().text().trim() ||
        $('.product-price .sales').first().text().trim();
      if (priceStr) {
        const clean = priceStr.replace('€', '').replace(',', '.').split('/')[0].trim();
        const price = parseFloat(clean);
        return isNaN(price) ? null : price;
      }
    } else if (store === 'auchan') {
      const searchUrl = `https://www.auchan.pt/pt/pesquisa?q=${encodeURIComponent(ingredientName)}`;
      const { data: html } = await axios.get(searchUrl, { headers: commonHeaders, timeout: 10000 });
      const $ = cheerio.load(html);
      const priceStr = 
        $('.auc-product-tile .price').first().text().trim() ||
        $('.auc-product-tile__prices .sales').first().text().trim() ||
        $('.sales').first().text().trim();
      if (priceStr) {
        const clean = priceStr.replace('€', '').replace(',', '.').split('/')[0].trim();
        const price = parseFloat(clean);
        return isNaN(price) ? null : price;
      }
    }
  } catch (err) {
    console.error(`Error for ${ingredientName} in ${store}:`, err.message);
  }
  return null;
}

async function test() {
  const items = ['leite', 'arroz', 'maca'];
  const stores = ['continente', 'pingodoce', 'auchan'];
  
  for (const item of items) {
    for (const store of stores) {
      const price = await getPriceInStore(item, store);
      console.log(`[${store}] ${item}: ${price ? price + '€' : 'NOT FOUND'}`);
    }
  }
}

test();
