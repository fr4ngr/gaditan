import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    try {
        const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/1101203/?api_key=${aemetKey}`);
        const playaJson = await playaRes.json();
        if (playaJson.estado == 200 && playaJson.datos) {
            const dataRes = await fetch(playaJson.datos);
            const dataArr = await dataRes.json();
            const todayData = dataArr[0].prediccion.dia[0];
            console.log(JSON.stringify(todayData, null, 2));
        } else {
            console.log("Error:", playaJson);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
