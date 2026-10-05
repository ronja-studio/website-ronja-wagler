#!/bin/bash
# =========================================================
#   Bilder fürs Web vorbereiten
# =========================================================
#
#   WAS MACHT DAS SKRIPT?
#
#   Du legst Bilder in den Ordner  bilder-eingang/
#   (direkt im Projektordner). Das Skript macht aus jedem
#   Bild eine web-taugliche Kopie in  images/ :
#
#     1. verkleinert auf höchstens 1600px (lange Seite)
#     2. dreht es richtig herum (iPhone-Fotos!)
#     3. wandelt die Farben nach sRGB um (der Web-Standard)
#     4. löscht ALLE Metadaten — GPS-Ort, Kamera, Datum …
#     5. speichert als JPG mit Qualität 80
#     6. gibt der Datei einen sauberen Namen
#        "Plakat Zürich 2.HEIC"  →  plakat-zuerich-2.jpg
#
#   Deine Originale bleiben unangetastet im Eingang liegen.
#   Löschen musst du sie selbst, wenn du zufrieden bist.
#
#   ---------------------------------------------------------
#   SO BENUTZT DU ES
#   ---------------------------------------------------------
#
#   Im Terminal, im Projektordner:
#
#     bash tools/bilder-vorbereiten.sh
#
#   Für kleine Bilder (z.B. ein Portrait) eine andere
#   Größe dahinter schreiben:
#
#     bash tools/bilder-vorbereiten.sh 800
#
#   ---------------------------------------------------------
#   WARUM 1600px?
#   ---------------------------------------------------------
#
#   Das größte Bild auf der Seite ist die Einzelansicht im
#   Journal: höchstens 720px breit (.single__panel in
#   styles.css). Retina-Bildschirme brauchen doppelt so
#   viele Pixel, also 1440. 1600 gibt etwas Luft.
#   Alles darüber macht nur die Seite langsamer.
#
#   ---------------------------------------------------------
#   WIE WERDEN DIE METADATEN GELÖSCHT?
#   ---------------------------------------------------------
#
#   macOS hat ein eingebautes Bildwerkzeug namens "sips".
#   Es hat keinen Knopf für "Metadaten löschen" — aber einen
#   Trick: Wir speichern das Bild kurz als BMP. BMP ist ein
#   uraltes, dummes Format, das gar keine Metadaten kennt.
#   Beim Umweg wird alles weggeworfen, nur die Pixel bleiben.
#   Und weil sips beim Umwandeln die iPhone-Drehung
#   "einbackt", steht das Bild danach trotzdem richtig.
#
#   Nichts muss installiert werden. Kein Internet nötig.
#   Deine Bilder verlassen nie den Laptop.
#
# =========================================================


# ---------------------------------------------------------
#   EINSTELLUNGEN — hier darfst du drehen
# ---------------------------------------------------------

# Lange Seite in Pixeln. Wird von der Zahl hinter dem
# Befehl überschrieben (siehe "So benutzt du es").
MAX_SIZE="${1:-1600}"

# JPG-Qualität von 0 bis 100. Bei 80 sieht man keinen
# Unterschied zum Original, die Datei ist aber viel kleiner.
# Höher als 90 lohnt sich fast nie.
QUALITY=80

# Ab dieser Größe (in KB) warnt das Skript. Kein Fehler —
# nur ein Hinweis, dass die Seite langsamer lädt.
WARN_KB=500

# Die beiden Ordner, relativ zum Projektordner.
INBOX="bilder-eingang"
OUTPUT="images"

# Das sRGB-Farbprofil. Liegt auf jedem Mac.
SRGB="/System/Library/ColorSync/Profiles/sRGB Profile.icc"


# ---------------------------------------------------------
#   VORBEREITUNG
# ---------------------------------------------------------

# Bei Fehlern sofort abbrechen, statt halbe Sachen zu machen.
set -e

# Egal, von wo du das Skript startest: wir arbeiten immer
# im Projektordner (eine Ebene über tools/).
cd "$(dirname "$0")/.."

# Prüfen, ob die Größe wirklich eine Zahl ist. Sonst würde
# z.B. ein Tippfehler wie "8oo" seltsame Fehler auslösen.
case "$MAX_SIZE" in
  ''|*[!0-9]*)
    echo "„${MAX_SIZE}“ ist keine Zahl. Beispiel: bash tools/bilder-vorbereiten.sh 800"
    exit 1
    ;;
esac

# Den Eingangsordner anlegen, falls es ihn noch nicht gibt.
if [ ! -d "$INBOX" ]; then
  mkdir "$INBOX"
  echo "Ordner $INBOX/ angelegt. Leg deine Bilder dort hinein und starte das Skript nochmal."
  exit 0
fi

# Ein Zwischenordner für die BMP-Umwege. mktemp sucht sich
# selbst einen freien Platz; "trap" räumt ihn am Ende auf,
# auch wenn das Skript abbricht.
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT


# ---------------------------------------------------------
#   SAUBERE DATEINAMEN
# ---------------------------------------------------------
#
#   Aus  "Plakat Zürich 2.HEIC"  wird  "plakat-zuerich-2".
#   (Die Endung .jpg kommt später dazu.)
#
#   Regeln: nur Kleinbuchstaben, Zahlen und Bindestriche.
#   Leerzeichen und Großbuchstaben können im Web Links
#   kaputt machen — auf deinem Mac merkst du das nicht,
#   auf dem Server schon.

clean_name() {
  echo "$1" \
    | iconv -f UTF-8-MAC -t UTF-8 \
    | sed -e 's/ä/ae/g; s/ö/oe/g; s/ü/ue/g; s/Ä/ae/g; s/Ö/oe/g; s/Ü/ue/g; s/ß/ss/g' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -e 's/[^a-z0-9]\{1,\}/-/g; s/^-//; s/-$//'
  # Zeile für Zeile:
  #   iconv  macOS speichert "ü" in Dateinamen als "u" + zwei
  #          Pünktchen. Das fügt es zu einem Zeichen zusammen,
  #          damit die nächste Zeile es findet.
  #   sed    Umlaute ausschreiben
  #   tr     alles klein
  #   sed    alles, was kein Buchstabe/keine Zahl ist, wird
  #          zu EINEM Bindestrich; Striche am Rand weg
}


# ---------------------------------------------------------
#   LOS GEHT'S
# ---------------------------------------------------------

done_count=0
skip_count=0

# Alle Dateien im Eingang durchgehen. Groß-/Kleinschreibung
# der Endung ist egal (.JPG und .jpg).
shopt -s nullglob nocaseglob
for src in "$INBOX"/*; do
  [ -f "$src" ] || continue

  file="$(basename "$src")"
  base="${file%.*}"   # Name ohne Endung
  ext="${file##*.}"   # nur die Endung

  # Nur Formate, die sips lesen kann. Alles andere (z.B.
  # eine .pdf, die aus Versehen dort liegt) überspringen.
  case "$(echo "$ext" | tr '[:upper:]' '[:lower:]')" in
    jpg|jpeg|heic|heif|png|tif|tiff|webp) ;;
    *)
      echo "⏭  $file — kein Bildformat, übersprungen"
      skip_count=$((skip_count + 1))
      continue
      ;;
  esac

  name="$(clean_name "$base")"
  if [ -z "$name" ]; then
    name="bild"   # falls der Name nur aus Sonderzeichen bestand
  fi
  dest="$OUTPUT/$name.jpg"

  # Nie ein vorhandenes Bild überschreiben — vielleicht ist
  # es schon auf der Seite im Einsatz.
  if [ -e "$dest" ]; then
    echo "⏭  $file — $dest gibt es schon, übersprungen (umbenennen oder alte Datei löschen)"
    skip_count=$((skip_count + 1))
    continue
  fi

  # Nie vergrößern: Ein kleines Bild hochzuskalieren macht
  # es nur unscharf und größer. Also erst nachsehen, wie
  # groß es ist.
  width=$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')
  height=$(sips -g pixelHeight "$src" | awk '/pixelHeight/ {print $2}')
  longest=$(( width > height ? width : height ))

  resize=()
  if [ "$longest" -gt "$MAX_SIZE" ]; then
    resize=(-Z "$MAX_SIZE")   # -Z = lange Seite auf diese Größe
  fi

  # Schritt 1: (verkleinern,) nach sRGB umrechnen, als BMP
  #            speichern → Metadaten weg, Drehung eingebacken.
  #            "${resize[@]+…}" ist nur Bash-Kleingedrucktes,
  #            damit ein leeres resize keinen Fehler auslöst.
  sips ${resize[@]+"${resize[@]}"} -m "$SRGB" -s format bmp "$src" --out "$TMP/zwischen.bmp" >/dev/null

  # Schritt 2: BMP → JPG mit der gewünschten Qualität.
  sips -s format jpeg -s formatOptions "$QUALITY" "$TMP/zwischen.bmp" --out "$dest" >/dev/null

  # Bericht: neue Maße und Dateigröße.
  new_w=$(sips -g pixelWidth "$dest" | awk '/pixelWidth/ {print $2}')
  new_h=$(sips -g pixelHeight "$dest" | awk '/pixelHeight/ {print $2}')
  kb=$(( $(stat -f %z "$dest") / 1024 ))

  echo "✅ $file → $dest  (${new_w}×${new_h}px, ${kb} KB)"
  if [ "$kb" -gt "$WARN_KB" ]; then
    echo "   ⚠️  größer als ${WARN_KB} KB — vielleicht kleiner machen oder QUALITY senken"
  fi
  if [ "$(echo "$ext" | tr '[:upper:]' '[:lower:]')" = "png" ]; then
    echo "   ℹ️  war ein PNG — durchsichtige Stellen sind jetzt weiß"
  fi

  done_count=$((done_count + 1))
done

echo
if [ "$done_count" -eq 0 ] && [ "$skip_count" -eq 0 ]; then
  echo "$INBOX/ ist leer — leg Bilder hinein und starte nochmal."
else
  echo "Fertig: $done_count Bild(er) vorbereitet, $skip_count übersprungen."
  if [ "$done_count" -gt 0 ]; then
    echo "Die Originale liegen noch in $INBOX/ — löschen, wenn alles gut aussieht."
    echo "Nicht vergessen: in posts.js einen Alt-Text für jedes neue Bild schreiben."
  fi
fi
