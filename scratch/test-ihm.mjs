import fetch from 'node-fetch';

async function testIHM() {
  try {
    const url = `https://ideihm.covam.es/api-ihm/getpuertos`;
    console.log("Fetching", url);
    const res = await fetch(url);
    const text = await res.text();
    console.log("Response length:", text.length);
    console.log("Response start:", text.substring(0, 100));
    // Let's see if Cadiz is in the text
    const index = text.indexOf('Cádiz');
    if (index !== -1) {
        console.log("Found Cadiz around:", text.substring(index - 50, index + 50));
    }
    const index2 = text.indexOf('Cadiz');
    if (index2 !== -1) {
        console.log("Found Cadiz around:", text.substring(index2 - 50, index2 + 50));
    }
  } catch (e) {
    console.error(e);
  }
}

testIHM();
