import fetch from 'node-fetch';

async function testAemet() {
  const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
  
  try {
    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json));
    
    if (json.datos) {
      const dataRes = await fetch(json.datos);
      const dataJson = await dataRes.json();
      console.log("Daily Data snippet:", JSON.stringify(dataJson[0].prediccion.dia[0]).substring(0, 500));
    }
  } catch (e) {
    console.error(e);
  }
}

testAemet();
