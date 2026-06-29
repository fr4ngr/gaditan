import fetch from 'node-fetch';

async function testAemetAlerts() {
  const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0';
  
  try {
    // ID 72 is Cádiz municipality, or we can use 11 for province maybe? Actually 72 is the national warning map id, wait no, let's just query all and filter, or query 'ultimo/provincia/72'. Let's check 'ultimo'
    const url = `https://opendata.aemet.es/opendata/api/avisos/cap/ultimo/provincia/11/?api_key=${apiKey}`;
    console.log("Fetching", url);
    const res = await fetch(url);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json));
    
    if (json.datos) {
      const dataRes = await fetch(json.datos);
      const dataJson = await dataRes.json();
      console.log("Alert Data:", JSON.stringify(dataJson));
    }
  } catch (e) {
    console.error(e);
  }
}

testAemetAlerts();
