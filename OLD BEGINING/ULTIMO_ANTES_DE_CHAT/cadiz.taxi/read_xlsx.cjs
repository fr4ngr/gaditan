const xlsx = require('xlsx');
const workbook = xlsx.readFile('C:/Users/frn/Downloads/LISTADO PARADAS DE TAXI CADIZ.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);
console.log(JSON.stringify(data, null, 2));
