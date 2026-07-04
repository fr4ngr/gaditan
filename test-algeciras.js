const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0";

async function check() {
    const res = await fetch(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11004/?api_key=${apiKey}`);
    const json = await res.json();
    if(json.datos) {
        const dataRes = await fetch(json.datos);
        const data = await dataRes.json();
        const dia = data[0].prediccion.dia[0];
        console.log("Algeciras - Temperaturas horarias para hoy (" + dia.fecha + "):");
        dia.temperatura.forEach(t => console.log(`Hora: ${t.periodo}:00 -> ${t.value}ºC`));
    } else {
        console.log("No data URL for Algeciras", json);
    }
}
check();
