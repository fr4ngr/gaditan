const xlsx = require('xlsx');
const workbook = xlsx.readFile('C:/Users/frn/Downloads/LISTADO PARADAS DE TAXI CADIZ.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(sheet);
const keys = Object.keys(rawData[0]);
console.log(keys);
console.log(rawData[0]);
console.log("Value: ", rawData[0][keys[1]]);
