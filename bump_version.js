const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'app', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/localStorage\.getItem\(['"]app_version['"]\)\s*!==\s*['"]v\d+['"]/g, "localStorage.getItem('app_version') !== 'v36'");
  content = content.replace(/localStorage\.setItem\(['"]app_version['"],\s*['"]v\d+['"]\)/g, "localStorage.setItem('app_version', 'v36')");
  // Also bump the cache buster in auth.js import
  content = content.replace(/src\/auth\.js\?v=\d+/g, "src/auth.js?v=36");
  fs.writeFileSync(p, content);
  console.log('Updated', f);
});

// Update sw.js version comment
const swPath = path.join(dir, 'sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/Service Worker Neutralizado para v\d+/g, "Service Worker Neutralizado para v36");
  fs.writeFileSync(swPath, swContent);
  console.log('Updated sw.js');
}
