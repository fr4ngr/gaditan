import dotenv from 'dotenv';
dotenv.config();
fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/11012/?api_key=' + process.env.AEMET_API_KEY)
  .then(r => r.json())
  .then(j => fetch(j.datos))
  .then(r => r.json())
  .then(d => {
      const today = d[0].prediccion.dia[0];
      console.log(JSON.stringify(today.temperatura, null, 2));
  })
  .catch(console.error);
