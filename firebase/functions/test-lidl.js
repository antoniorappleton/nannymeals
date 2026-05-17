const axios = require('axios');
const cheerio = require('cheerio');

async function testLidl() {
  const ingredientName = "bacalhau";
  const searchUrl = `https://www.lidl.pt/q/search?q=${encodeURIComponent(ingredientName)}`;
  console.log("Fetching: " + searchUrl);
  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(html);
    
    // Print all elements that look like price
    const texts = [];
    $('.ods-price__value, .pricebox__price, .price').each((i, el) => {
      texts.push($(el).text().trim());
    });
    console.log("Found price strings:", texts);
    
    const priceStr = $('.ods-price__value').first().text().trim() || $('.pricebox__price').first().text().trim();
    console.log("Selected Price string:", priceStr);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testLidl();
