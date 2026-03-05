const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'app', 'public');
const assets = [
  "",
  "index.html",
  "onboarding.html",
  "dashboard.html",
  "plan.html",
  "grocery.html",
  "feedback.html",
  "swaps.html",
  "css/global.css",
  "assets/styles.css",
  "manifest.json",
  "favicon.ico",
];

assets.forEach(asset => {
  const fullPath = path.join(publicDir, asset);
  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING: ${asset} (Full path: ${fullPath})`);
  } else {
    console.log(`OK: ${asset}`);
  }
});
