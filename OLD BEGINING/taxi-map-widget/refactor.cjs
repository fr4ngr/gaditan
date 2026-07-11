const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'mapManager.ts');
let content = fs.readFileSync(file, 'utf8');

// Export mapManager
content = content.replace('const mapManager = (() => {', 'export const initMapManager = (rootElement) => {');

// Remove the event listener at the end
content = content.replace(/\}\)\(\);[\s\S]*$/, '};\n');

// Replace document.getElementById(...) with rootElement.querySelector('#...')
content = content.replace(/document\.getElementById\(['"]([^'"]+)['"]\)/g, "rootElement.querySelector('#$1')");
content = content.replace(/document\.querySelector\(/g, "rootElement.querySelector(");

// Add imports and ts-nocheck at the very top
content = `// @ts-nocheck\nimport { dbParadas } from './mapData';\nimport L from 'leaflet';\n` + content;

// Replace L.map('map') with mapElement
content = content.replace("map = L.map('map', {", "map = L.map(mapElement, {");

fs.writeFileSync(file, content, 'utf8');
console.log("Refactored mapManager.ts cleanly.");
