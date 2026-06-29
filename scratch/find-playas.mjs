import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    // Let's try to get the maestro of playas
    // https://opendata.aemet.es/dist/index.html?
    // /api/maestros/municipios is for towns.
    // Let's try to find if there is a maestro for beaches
    // If not, I'll just use Victoria for now in the plan and we can map them later.
    
    // I'll search in a json from aemet if possible. Actually, there's no maestro endpoint for playas in opendata. 
    // Usually they are published as a static excel or pdf. 
    // The known IDs for Cadiz:
    // 1101203 - La Victoria
    // 1101204 - Cortadura?
    // Let's test 1101201, 1101202, 1101204, 1101205
    for (let id of [1101201, 1101202, 1101204, 1101205]) {
        try {
            const playaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${id}/?api_key=${aemetKey}`);
            const playaJson = await playaRes.json();
            if (playaJson.estado == 200 && playaJson.datos) {
                const dataRes = await fetch(playaJson.datos);
                const dataArr = await dataRes.json();
                console.log(`ID ${id} -> Name:`, dataArr[0].nombre);
            }
        } catch(e) {}
    }
}
run();
