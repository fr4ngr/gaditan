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

    const promptAPath = path.join(__dirname, '../src/data/system-prompt-a.md');
    const promptBPath = path.join(__dirname, '../src/data/system-prompt-b.md');
    const oldPromptPath = path.join(__dirname, '../src/data/system-prompt.md');
    const configPath = path.join(__dirname, '../src/data/ab-config.json');

    let systemPromptA = "";
    if (fs.existsSync(promptAPath)) systemPromptA = fs.readFileSync(promptAPath, 'utf-8');
    else if (fs.existsSync(oldPromptPath)) systemPromptA = fs.readFileSync(oldPromptPath, 'utf-8'); // fallback

    let systemPromptB = "";
    if (fs.existsSync(promptBPath)) systemPromptB = fs.readFileSync(promptBPath, 'utf-8');

    let abConfig = { active: false, trafficA: 50 };
    if (fs.existsSync(configPath)) {
        try { abConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch(e){}
    }

    const compiledContent = `// ARCHIVO AUTOGENERADO DURANTE EL BUILD
export const brains = ${JSON.stringify(brains, null, 2)};
export const systemPromptA = ${JSON.stringify(systemPromptA)};
export const systemPromptB = ${JSON.stringify(systemPromptB)};
export const abConfig = ${JSON.stringify(abConfig, null, 2)};
`;
    fs.writeFileSync(outputFile, compiledContent, 'utf-8');
    console.log('✅ Cerebros y System Prompt compilados exitosamente en functions/api/compiled-brains.js');
} catch (error) {
    console.error('❌ Error compilando cerebros:', error);
    process.exit(1);
}
