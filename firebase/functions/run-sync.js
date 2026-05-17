const axios = require('axios');

const ENDPOINT = "https://us-central1-nannymeal-d966b.cloudfunctions.net/syncIngredientPrices?secret=my-secret-key-123";

async function run() {
  let hasMore = true;
  let totalProcessed = 0;
  let iteration = 1;

  while (hasMore) {
    console.log(`\n--- Iteration ${iteration} ---`);
    console.log(`Calling endpoint...`);
    try {
      const { data } = await axios.get(ENDPOINT);
      console.log(`Status: Success`);
      console.log(`Processed in this run: ${data.processed}`);
      console.log(`Total unique ingredients checked: ${data.totalUnique}`);
      
      if (data.results && data.results.length > 0) {
        data.results.forEach(res => {
          console.log(` - ${res.name}: ${JSON.stringify(res.prices)}`);
        });
      }

      totalProcessed += data.processed;
      
      // If we processed fewer than the limit (50) or 0, we are done
      if (data.processed < 50 || data.processed === 0) {
        hasMore = false;
        console.log(`\n✅ Finished! No more ingredients to process.`);
        console.log(`Total processed across all iterations: ${totalProcessed}`);
      } else {
        iteration++;
        console.log(`Waiting 5 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (err) {
      console.error("❌ Error calling endpoint:", err.response ? err.response.data : err.message);
      hasMore = false; // Stop on error
    }
  }
}

run();
