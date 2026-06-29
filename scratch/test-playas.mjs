import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    
    const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/1101203/?api_key=${aemetKey}`);
    const playaJson = await playaRes.json();
    
    if (playaJson.estado == 200 && playaJson.datos) {
        const dataRes = await fetch(playaJson.datos);
        const dataArr = await dataRes.json();
        const beachData = dataArr[0];
        
        console.log("Beach Name:", beachData.nombre);
        console.log("Prediccion keys today:", Object.keys(beachData.prediccion.dia[0]));
        console.log("Example state of sky:", beachData.prediccion.dia[0].estadoCielo);
        console.log("Example wave (oleaje):", beachData.prediccion.dia[0].oleaje);
        console.log("Example temp water:", beachData.prediccion.dia[0].tAgua);
        console.log("Example max temp:", beachData.prediccion.dia[0].tMaxima);
        console.log("Example min temp:", beachData.prediccion.dia[0].tMinima);
        console.log("UV Max:", beachData.prediccion.dia[0].uvMax);
    } else {
        console.log("Error:", playaJson);
    }
}
run();
