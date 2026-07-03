import fs from 'fs';
import path from 'path';

const filepath = 'c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\pages\\index.astro';
let content = fs.readFileSync(filepath, 'utf-8');

// Extract styles
const styleRegex = /<style is:global>([\s\S]*?)<\/style>/;
const styleMatch = content.match(styleRegex);
if (styleMatch) {
    const styleContent = styleMatch[1];
    fs.mkdirSync('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\styles', { recursive: true });
    fs.writeFileSync('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\styles\\chat.css', styleContent, 'utf-8');
    
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd !== -1) {
        const newFrontmatter = content.substring(0, frontmatterEnd) + "import '../styles/chat.css';\n";
        content = newFrontmatter + content.substring(frontmatterEnd);
    }
    
    content = content.replace(styleMatch[0], '');
}

// Extract scripts
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const scriptMatch = content.match(scriptRegex);
if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    fs.mkdirSync('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\scripts', { recursive: true });
    fs.writeFileSync('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\scripts\\chat-client.ts', scriptContent, 'utf-8');
    content = content.replace(scriptMatch[0], '<script src="../scripts/chat-client.ts"></script>');
}

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Refactored successfully");
