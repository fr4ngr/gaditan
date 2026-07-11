const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\frn\\.gemini\\antigravity\\brain\\139beb37-6409-444d-a944-6064323e29a8\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = 'C:\\Users\\frn\\Documents\\cadiz.taxi\\public\\reserva-lottie.json';

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let found = false;

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  try {
    const data = JSON.parse(lines[i]);
    if (data.type === 'USER_INPUT' && data.content && data.content.includes('Lotti_export_RDV')) {
      const content = data.content;
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        let jsonStr = content.substring(startIdx, endIdx + 1);
        try {
          JSON.parse(jsonStr);
          fs.writeFileSync(outputPath, jsonStr, 'utf8');
          console.log('Successfully extracted and saved full JSON to reserva-lottie.json');
          found = true;
          break;
        } catch(e) {
          console.log("Found JSON but could not parse it. It may be truncated at the network level: " + e.message);
        }
      }
    }
  } catch(e) {
    // ignore
  }
}

if (!found) {
  console.log('Could not find or parse the full JSON in the transcript.');
}
