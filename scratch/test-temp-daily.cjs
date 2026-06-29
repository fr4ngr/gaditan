const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('AEMET_API_KEY=')).split('=')[1].trim();

fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/11012/?api_key=' + env)
  .then(r => r.json())
  .then(j => fetch(j.datos))
  .then(r => r.json())
  .then(d => {
      const today = d[0].prediccion.dia[0];
      console.log(JSON.stringify(today.temperatura, null, 2));
  })
  .catch(console.error);
