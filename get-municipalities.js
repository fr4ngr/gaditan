const apiKey = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0";

async function getMunicipios() {
    try {
        const res = await fetch(`https://opendata.aemet.es/opendata/api/maestro/municipios/?api_key=${apiKey}`);
        const json = await res.json();
        console.log("JSON status:", json.estado, json.descripcion);
        if (json.datos) {
            const dataRes = await fetch(json.datos);
            const data = await dataRes.json();
            
            const cadizMuni = data.filter(m => m.id && m.id.startsWith('id11'));
            console.log("Found:", cadizMuni.length);
            
            let mapString = '';
            cadizMuni.forEach(m => {
                const id = m.id.replace('id', '');
                mapString += `    "${m.nombre}": { id: "${id}", name: "${m.nombre}", zona: "Litoral Gaditano" },\n`;
            });
            console.log(mapString);
        }
    } catch(e) {
        console.error(e);
    }
}
getMunicipios();
