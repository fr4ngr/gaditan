import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainsDir = path.join(__dirname, '../src/data/brains');
const outputFile = path.join(__dirname, '../functions/api/compiled-brains.js');

try {
    const files = fs.readdirSync(brainsDir);
    const brains = {};

    for (const file of files) {
        if (file.endsWith('.md')) {
            const name = file.replace('.md', '');
            const content = fs.readFileSync(path.join(brainsDir, file), 'utf-8');
            brains[name] = content;
        }
    }

    const systemPromptPath = path.join(__dirname, '../src/data/system-prompt.md');
    let systemPrompt = "";
    if (fs.existsSync(systemPromptPath)) {
        systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8');
    }

    const compiledContent = `// ARCHIVO AUTOGENERADO DURANTE EL BUILD\nexport const brains = ${JSON.stringify(brains, null, 2)};\nexport const systemPrompt = ${JSON.stringify(systemPrompt)};\n`;
    fs.writeFileSync(outputFile, compiledContent, 'utf-8');
    console.log('✅ Cerebros y System Prompt compilados exitosamente en functions/api/compiled-brains.js');
} catch (error) {
    console.error('❌ Error compilando cerebros:', error);
    process.exit(1);
}
