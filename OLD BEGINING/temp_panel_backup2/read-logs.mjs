import fs from 'fs';
const lines = fs.readFileSync('C:\\Users\\frn\\.gemini\\antigravity\\brain\\8e6ea060-ae00-44e9-8a32-8ffd40196224\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.includes('"type":"USER_INPUT"')) {
    const data = JSON.parse(line);
    console.log("USER:", data.content.slice(0, 100));
  }
}
