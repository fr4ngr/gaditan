const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/styles/styles.css');
let content = fs.readFileSync(cssPath, 'utf-8');

// Replace the first .tarifa-pill block entirely
content = content.replace(/\.tarifa-pill\s*\{[\s\S]*?flex-shrink:\s*0;\s*\}/, `.tarifa-pill {
    flex: 1;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}`);

// Remove the duplicated one at the bottom (starts with .tarifa-pill { flex: 1; ...)
// We just remove the exact string
const dupBlock = `.tarifa-pill {
    flex: 1;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
}`;

// If it's duplicated, the first replace above fixed the original.
// We can just find the second occurrence of this block and remove it.
const firstIndex = content.indexOf(dupBlock);
if (firstIndex !== -1) {
    const secondIndex = content.indexOf(dupBlock, firstIndex + dupBlock.length);
    if (secondIndex !== -1) {
        content = content.slice(0, secondIndex) + content.slice(secondIndex + dupBlock.length);
    }
}

fs.writeFileSync(cssPath, content);
console.log("CSS fixed successfully.");
