import fetch from 'node-fetch';

async function run() {
    const aemetKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
    
    // Horaria
    const horariaRes = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11012/?api_key=${aemetKey}`);
    const horariaJson = await horariaRes.json();
    if (!horariaJson.datos) {
        console.log("RL:", horariaJson);
        return;
    }
    const hDataRes = await fetch(horariaJson.datos);
    const hDataArr = await hDataRes.json();
    const hourlyData = hDataArr[0].prediccion.dia[0];
    
    console.log("Wind horaria:", JSON.stringify(hourlyData.vientoAndRachaMax, null, 2));
}
run();
