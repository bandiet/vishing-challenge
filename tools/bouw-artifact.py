#!/usr/bin/env python3
"""Baut die teilbaren Fassungen: python3 tools/bouw-artifact.py

dist/artifact/index.html  Seite ohne <html>/<head>/<body>-Gerüst (das setzt die
                          Artifact-Plattform), CSS und JS eingebettet
dist/artifact/assets/...  Stimmen, Klänge, Musik, Bilder (als eigene Dateien
                          veröffentlicht; die Seite lädt sie über relative Pfade)
dist/artifact/bestanden.json  Liste der veröffentlichten Pfade (für den Publish-Aufruf)

dist/site/                dieselbe Seite als vollständiges HTML-Dokument plus Medien –
                          die Website für Cloudflare (wrangler.jsonc zeigt hierher)
"""
import json
import os
import re
import shutil

HIER = os.path.dirname(os.path.abspath(__file__))
P = os.path.dirname(HIER)

html = open(os.path.join(P, 'index.html'), encoding='utf-8').read()
css = open(os.path.join(P, 'css', 'style.css'), encoding='utf-8').read()

def js_einbetten(m):
    code = open(os.path.join(P, m.group(1)), encoding='utf-8').read()
    return '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>'

# CSS und JS einbetten (für beide Fassungen gleich)
eingebettet = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
eingebettet = re.sub(r'<script src="(js/[^"]+)"></script>', js_einbetten, eingebettet)

# Medien: nur, was die Seite wirklich nutzt
content = open(os.path.join(P, 'js', 'content.js'), encoding='utf-8').read()
pfade = []
for sid in sorted(set(re.findall(r"id: '(c\d_\w+)'", content))):   # nur verwendete Stimmen
    pfade.append(f'assets/stem/{sid}.mp3')
for ordner in ('sfx', 'musik'):
    for n in sorted(os.listdir(os.path.join(P, 'assets', ordner))):
        if n.endswith('.mp3'):
            pfade.append(f'assets/{ordner}/{n}')
# Profilfotos der Anrufer
pfade += sorted(set(re.findall(r"(?:foto|bild): '(assets/[^']+)'", content)))
pfade += ['assets/hacker.png', 'assets/hacker-face.png', 'assets/intro-gesicht.jpg']
pfade = list(dict.fromkeys(pfade))


def neu(ordner):
    ziel = os.path.join(P, 'dist', ordner)
    if os.path.exists(ziel):
        shutil.rmtree(ziel)
    os.makedirs(ziel)
    summe = 0
    for pf in pfade:
        z = os.path.join(ziel, pf)
        os.makedirs(os.path.dirname(z), exist_ok=True)
        shutil.copy2(os.path.join(P, pf), z)
        summe += os.path.getsize(z)
    return ziel, summe


# Artifact: nur Kopf-Inhalt (ohne charset/viewport) und Body-Inhalt
ziel, summe = neu('artifact')
kopf = re.search(r'<head>(.*?)</head>', eingebettet, re.S).group(1)
kopf = re.sub(r'\s*<meta charset[^>]*>', '', kopf)
kopf = re.sub(r'\s*<meta name="viewport"[^>]*>', '', kopf)
rumpf = re.search(r'<body>(.*?)</body>', eingebettet, re.S).group(1)
with open(os.path.join(ziel, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(kopf.strip() + '\n' + rumpf.strip() + '\n')
json.dump(pfade, open(os.path.join(ziel, 'bestanden.json'), 'w'), indent=1)
print(f'artifact: index.html {os.path.getsize(os.path.join(ziel, "index.html")) // 1024} KB, {len(pfade)} Dateien, {summe / 1e6:.1f} MB')

# Website: vollständiges Dokument, mit Favicon und Beschreibung
ziel, summe = neu('site')
ikon = ('data:image/svg+xml,' + '%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E'
        '%3Crect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%2306031A%22/%3E'
        '%3Cpath d=%22M5 17c3-6 5 6 8 0%22 stroke=%22%2335F0C0%22 stroke-width=%222.6%22 fill=%22none%22 stroke-linecap=%22round%22/%3E'
        '%3Cpath d=%22M16 17h3v-4h3v6h3v-3h2%22 stroke=%22%23FF2D87%22 stroke-width=%222.6%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')
seite = eingebettet.replace('<title>Vishing Challenge</title>',
    '<title>Vishing Challenge</title>\n<meta name="description" content="Die Vishing Challenge von Cyber Crime Awareness: sechs Anrufe in zwei Levels – Mensch mit echtem Anliegen oder KI-Betrug?">\n'
    f'<link rel="icon" href="{ikon}">')
with open(os.path.join(ziel, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(seite)
print(f'site: index.html {os.path.getsize(os.path.join(ziel, "index.html")) // 1024} KB, {len(pfade)} Dateien, {summe / 1e6:.1f} MB')
