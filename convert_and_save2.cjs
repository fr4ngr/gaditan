const xlsx = require('xlsx');
const fs = require('fs');
const workbook = xlsx.readFile('C:/Users/frn/Downloads/LISTADO PARADAS DE TAXI CADIZ.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(sheet);

const parsedData = rawData.map((row, i) => {
    const keys = Object.keys(row);
    const addressKey = keys.find(k => k.includes('escrip') || k.includes('bicac') || k.toLowerCase().includes('desc') || k === keys[1]);
    
    let latStr = row.Lat.toString();
    let lonStr = row.Lon.toString();
    
    let lat = parseFloat(latStr.slice(0, 2) + '.' + latStr.slice(2));
    let lon = parseFloat(lonStr.slice(0, 2) + '.' + lonStr.slice(2));
    
    return {
        id: "p_" + i,
        name: row.Nombre,
        address: row[addressKey],
        lat: lat,
        lon: lon,
        observaciones: row.observaciones || ''
    };
});

let jsContent = "// Base de datos de Paradas de Taxi de Cádiz\nconst dbParadas = [\n";
parsedData.forEach((p, idx) => {
    jsContent += `    {\n`;
    jsContent += `        id: "${p.id}",\n`;
    jsContent += `        name: "${p.name}",\n`;
    if (p.observaciones) {
        jsContent += `        address: "${p.address} (${p.observaciones})",\n`;
    } else {
        jsContent += `        address: "${p.address}",\n`;
    }
    jsContent += `        lat: ${p.lat},\n`;
    jsContent += `        lon: ${p.lon}\n`;
    jsContent += `    }${idx === parsedData.length - 1 ? '' : ','}\n`;
});
jsContent += "];\n";

fs.writeFileSync('public/js/mapData.js', jsContent, 'utf8');
