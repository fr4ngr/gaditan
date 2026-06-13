import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the inline styles from the card structure
    content = content.replace(
        /class="glass card" style="padding: 0; overflow: hidden; gap: 0; display: flex; flex-direction: row; align-items: stretch; max-width: 550px; width: 100%; border-radius: 24px;"/g,
        'class="glass card section-header-card"'
    );
    
    content = content.replace(
        /style="background: var\(--brand-cyan\); display: flex; align-items: center; justify-content: center; width: 130px; flex-shrink: 0; padding: 1rem;"/g,
        'class="section-header-icon"'
    );

    content = content.replace(
        /style="background: linear-gradient\(135deg, #ffffff 0%, #f1f5f9 100%\); padding: 1.5rem 2rem; display: flex; flex-direction: column; justify-content: center; flex: 1; text-align: left;"/g,
        'class="section-header-content"'
    );

    content = content.replace(
        /class="section-title" itemprop="name" style="margin: 0; font-size: 1.7rem; line-height: 1.2; padding-bottom: 0.3rem; color: var\(--bg-base\);"/g,
        'class="section-title section-header-title" itemprop="name"'
    );

    content = content.replace(
        /class="section-subtitle" style="color: var\(--text-muted\); margin: 0; font-size: 1.05rem; line-height: 1.4;"/g,
        'class="section-subtitle section-header-subtitle"'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const p1 = path.join('c:', 'Users', 'frn', 'Documents', 'cadiz.taxi', 'src', 'components', 'MapaParadas.astro');
const p2 = path.join('c:', 'Users', 'frn', 'Documents', 'cadiz.taxi', 'src', 'components', 'Reserva.astro');

replaceInFile(p1);
replaceInFile(p2);
