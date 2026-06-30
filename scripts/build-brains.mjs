import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainsDir = path.join(__dirname, '../src/data/brains');
const outputFile = path.join(__dirname, '../functions/api/compiled-brains.js');

try {
    const brains = [];
    
    if (fs.existsSync(brainsDir)) {
        const materias = fs.readdirSync(brainsDir, { withFileTypes: true }).filter(d => d.isDirectory());
        
        for (const materia of materias) {
            const materiaPath = path.join(brainsDir, materia.name);
            const tipos = fs.readdirSync(materiaPath, { withFileTypes: true }).filter(d => d.isDirectory());
            
            for (const tipo of tipos) {
                const tipoPath = path.join(materiaPath, tipo.name);
                const files = fs.readdirSync(tipoPath, { withFileTypes: true }).filter(f => f.isFile() && f.name.endsWith('.md'));
                
                for (const file of files) {
                    const filePath = path.join(tipoPath, file.name);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    brains.push({
                        materia: materia.name,
                        tipo: tipo.name,
                        fileName: file.name.replace('.md', ''),
                        content: content
                    });
                }
            }
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
