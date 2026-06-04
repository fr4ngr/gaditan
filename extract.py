import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

cards = re.findall(r'<div class="mini-dest-card".*?<div class="mini-dest-name">.*?</i>\s*(.*?)\s*</div>.*?<div class="mini-dest-price">(.*?)</div>', html, re.DOTALL)

for c in cards:
    print(f"{c[0]} | {c[1]}")
