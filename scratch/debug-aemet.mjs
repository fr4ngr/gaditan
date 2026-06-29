import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    
    const diariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=${aemetKey}`);
    const diariaJson = await diariaRes.json();
    if (diariaJson.datos) {
        const dDataRes = await fetch(diariaJson.datos);
        const dDataArr = await dDataRes.json();
        const dailyData = dDataArr[0].prediccion.dia[0];
        console.log("UVMax diaria:", dailyData.uvMax);
    }
}
run();
