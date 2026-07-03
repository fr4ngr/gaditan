import re
import os

filepath = 'c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\pages\\index.astro'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract styles
style_match = re.search(r'<style is:global>(.*?)</style>', content, re.DOTALL)
if style_match:
    style_content = style_match.group(1)
    os.makedirs('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\styles', exist_ok=True)
    with open('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\styles\\chat.css', 'w', encoding='utf-8') as f:
        f.write(style_content)
    
    # Insert import into frontmatter
    # Find the end of frontmatter
    frontmatter_end = content.find('---', 3)
    if frontmatter_end != -1:
        new_frontmatter = content[:frontmatter_end] + "import '../styles/chat.css';\n"
        content = new_frontmatter + content[frontmatter_end:]
    
    # Remove the old style tag
    content = content.replace(style_match.group(0), "")

# Extract scripts
script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
if script_match:
    script_content = script_match.group(1)
    os.makedirs('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\scripts', exist_ok=True)
    with open('c:\\Users\\frn\\Documents\\cadiz.taxi\\src\\scripts\\chat-client.ts', 'w', encoding='utf-8') as f:
        f.write(script_content)
    content = content.replace(script_match.group(0), '<script src="../scripts/chat-client.ts"></script>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored successfully")
