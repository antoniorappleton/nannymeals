const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/anton/Desktop/Programing_Projects/NannyMeal/app/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/localStorage\.getItem\(['"]app_version['"]\)\s*!==\s*['"]v\d+['"]/g, "localStorage.getItem('app_version') !== 'v35'");
  content = content.replace(/localStorage\.setItem\(['"]app_version['"],\s*['"]v\d+['"]\)/g, "localStorage.setItem('app_version', 'v35')");
  // Also bump the cache buster in auth.js import
  content = content.replace(/src\/auth\.js\?v=\d+/g, "src/auth.js?v=35");
  fs.writeFileSync(p, content);
  console.log('Updated', f);
});
