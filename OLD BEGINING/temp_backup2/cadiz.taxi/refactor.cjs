const fs = require('fs');

const file = fs.readFileSync('src/pages/index.astro', 'utf8');
const lines = file.split('\n');

const layoutStart = lines.slice(0, 67).join('\n');
const layoutEnd = lines.slice(754, 866).join('\n');
const header = lines.slice(67, 91).join('\n');
const hero = lines.slice(93, 120).join('\n');
const tarifas = lines.slice(123, 267).join('\n');
const destinos = lines.slice(268, 285).join('\n');
const mapa = lines.slice(286, 314).join('\n');
const calc = lines.slice(316, 395).join('\n');
const reserva = lines.slice(396, 640).join('\n');
const faq = lines.slice(645, 708).join('\n');
const footer = lines.slice(710, 741).join('\n');
const flotantes = lines.slice(742, 753).join('\n');

const layoutAstro = `${layoutStart}\n    <slot />\n${layoutEnd}`;

fs.mkdirSync('src/layouts', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

fs.writeFileSync('src/layouts/Layout.astro', layoutAstro);
fs.writeFileSync('src/components/Header.astro', header);
fs.writeFileSync('src/components/Hero.astro', hero);
fs.writeFileSync('src/components/Tarifas.astro', tarifas);
fs.writeFileSync('src/components/Destinos.astro', destinos);
fs.writeFileSync('src/components/MapaParadas.astro', mapa);
fs.writeFileSync('src/components/Calculadora.astro', calc);
fs.writeFileSync('src/components/Reserva.astro', reserva);
fs.writeFileSync('src/components/FAQ.astro', faq);
fs.writeFileSync('src/components/Footer.astro', footer);
fs.writeFileSync('src/components/BotonesFlotantes.astro', flotantes);

const newIndex = `---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Tarifas from '../components/Tarifas.astro';
import Destinos from '../components/Destinos.astro';
import MapaParadas from '../components/MapaParadas.astro';
import Calculadora from '../components/Calculadora.astro';
import Reserva from '../components/Reserva.astro';
import FAQ from '../components/FAQ.astro';
import Footer from '../components/Footer.astro';
import BotonesFlotantes from '../components/BotonesFlotantes.astro';
---

<Layout>
    <Header />
    <main>
        <Hero />
        <Tarifas />
        <Destinos />
        <MapaParadas />
        <Calculadora />
        <Reserva />
        <FAQ />
    </main>
    <Footer />
    <BotonesFlotantes />
</Layout>
`;
fs.writeFileSync('src/pages/index.astro', newIndex);
console.log('Refactoring complete!');
