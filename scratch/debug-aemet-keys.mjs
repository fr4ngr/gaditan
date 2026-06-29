import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    
    // Diaria
    const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=${aemetKey}`);
    const diariaJson = await diariaRes.json();
    const dDataRes = await fetch(diariaJson.datos);
    const dDataArr = await dDataRes.json();
    
    console.log("Day 0 UVMax:", dDataArr[0].prediccion.dia[0].uvMax);
    console.log("Day 1 UVMax:", dDataArr[0].prediccion.dia[1].uvMax);
}
run();
