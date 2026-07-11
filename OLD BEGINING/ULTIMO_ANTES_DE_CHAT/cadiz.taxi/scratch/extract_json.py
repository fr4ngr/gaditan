import json
import os

transcript_path = r"C:\Users\frn\.gemini\antigravity\brain\139beb37-6409-444d-a944-6064323e29a8\.system_generated\logs\transcript_full.jsonl"
output_path = r"C:\Users\frn\Documents\cadiz.taxi\public\reserva-lottie.json"

found_json = None

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT' and 'Lotti_export_RDV' in data.get('content', ''):
                content = data['content']
                # The message is: "esta animacion no es un calendario? {"v":"4.10.2"..."
                # Let's extract the JSON part
                start_idx = content.find('{')
                if start_idx != -1:
                    json_str = content[start_idx:]
                    # Try parsing to make sure it's valid
                    parsed = json.loads(json_str)
                    found_json = json_str
                    break
        except Exception as e:
            pass

if found_json:
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write(found_json)
    print("Successfully extracted and saved full JSON to reserva-lottie.json")
else:
    print("Could not find or parse the full JSON in the transcript.")
