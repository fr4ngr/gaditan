const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\frn\\.gemini\\antigravity\\brain\\139beb37-6409-444d-a944-6064323e29a8\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = 'C:\\Users\\frn\\Documents\\cadiz.taxi\\public\\reserva-lottie.json';

const rl = readline.createInterface({
  input: fs.createReadStream(transcriptPath),
  crlfDelay: Infinity
});

let found = false;

rl.on('line', (line) => {
  if (found) return;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content && data.content.includes('Lotti_export_RDV')) {
      const content = data.content;
      const startIdx = content.indexOf('{');
      if (startIdx !== -1) {
        const jsonStr = content.substring(startIdx);
        // Validate it
        JSON.parse(jsonStr);
        fs.writeFileSync(outputPath, jsonStr, 'utf8');
        console.log('Successfully extracted and saved full JSON to reserva-lottie.json');
        found = true;
      }
    }
  } catch (e) {
    // ignore parse errors or logic errors on line
  }
});

rl.on('close', () => {
  if (!found) {
    console.log('Could not find or parse the full JSON in the transcript.');
  }
});
