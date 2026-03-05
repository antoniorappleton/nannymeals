const https = require('https');

https.get('https://firestore.googleapis.com/v1/projects/nannymeal-d966b/databases/(default)/documents/recipes', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.documents) {
        console.log(`FOUND ${json.documents.length} RECIPES IN FIRESTORE.`);
        const names = json.documents.map(d => d.fields.name.stringValue);
        console.log("Recipes: ", names.join(", "));
      } else {
        console.log("NO RECIPES FOUND IN FIRESTORE.");
        console.log(json);
      }
    } catch(e) {
      console.log("Error parsing: ", e);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
