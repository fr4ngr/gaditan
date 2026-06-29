import fetch from 'node-fetch';

async function findCadizId() {
  for (let id = 1; id <= 100; id++) {
    try {
      const url = `https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=${id}&format=json`;
      const res = await fetch(url);
      const text = await res.text();
      if (text.includes('Cádiz') || text.includes('Cadiz')) {
        console.log(`Found Cadiz at ID: ${id}`);
        console.log(text.substring(0, 200));
        break;
      }
    } catch (e) {
      // ignore
    }
  }
}

findCadizId();
