# Website Ronja Wagler

Portfolio. Vanilla HTML/CSS/JS, no framework — same stack as the RAL stipend site.

## Ansehen

```
cd "/Users/ronjasilvana/Documents/claude/website-ronja-wagler"
python3 -m http.server 8080
```

Dann im Browser: http://localhost:8080

(`file://` funktioniert nicht richtig — Fonts und Skripte werden blockiert.)

## Aufbau

```
index.html        Startseite (Startscreen + Homescreen sind dieselbe Seite)
styles.css        alles Visuelle, Design-Tokens ganz oben
js/projects.js    ← DEINE PROJEKTE. Nur hier musst du was ändern.
js/star.js        der Stern
js/site.js        Projekt-Vorschau + Über-mich-Pop-up
fonts/            .woff2-Dateien
images/           Projektbilder + Portrait
```

## Design-Tokens (aus Figma)

| | |
|---|---|
| Blau | `#2f00ff` |
| Grund | Weiß, Text Schwarz |
| Mono | Fliege Mono — Name, Navigation, Fließtext |
| Serif | Griffiths Italic — Projekttitel, Bildunterschriften |
| Größen | 16px Fließtext, 12px klein, 32px Pfeile |
| Stern | 25 Strahlen, Innenradius 10,6 % · 190px klein, ×11,66 groß |

## Entscheidungen

- **Projekte leben in `js/projects.js`.** Ein Projekt hinzufügen = einen Block
  kopieren und ein Bild in `images/` legen. Layout wird nie angefasst.
  Wenn das irgendwann zu fummelig wird, kann ein CMS (z. B. Decap) genau auf
  dieser Struktur aufsetzen, ohne dass wir neu bauen müssen.
- **Der Riesenstern erscheint einmal pro Session**, danach merkt sich der Browser
  das (`sessionStorage`). Der kleine Stern unten links ist ab dann der Home-Button.
- **Die Strahlen neigen sich zum Cursor** — nur bei echter Maus und nur, wenn
  niemand „weniger Bewegung“ eingestellt hat.

## Offen

- [ ] Fonts: Webfont-Lizenz für Fliege Mono + Griffiths prüfen, `.woff2` in `fonts/`
- [ ] Domain registrieren
- [ ] Projektbilder + Portrait in `images/`
- [ ] Projektseite (`projekt.html`) bauen
- [ ] Kontakt, Datenschutz, Impressum
- [ ] Kontrast der Projektliste prüfen
