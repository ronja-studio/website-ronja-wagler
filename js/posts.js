/* =========================================================
   DEIN JOURNAL — alle Beiträge
   =========================================================

   Das hier ist die einzige Datei, die du anfassen musst,
   wenn du etwas posten willst.

   ---------------------------------------------------------
   SO POSTEST DU
   ---------------------------------------------------------

   1. Bild(er) in den Ordner  images/  legen
   2. Unten bei POSTS einen neuen Block GANZ OBEN einfügen
   3. Komma hinter dem Block nicht vergessen :)

   Ganz oben = neuester Beitrag. Die Reihenfolge in dieser
   Datei ist die Reihenfolge im Journal.

   ---------------------------------------------------------
   DREI ARTEN VON BEITRÄGEN — und du musst nichts auswählen
   ---------------------------------------------------------

   Du sagst nirgends "das ist ein Bild-Post". Die Website
   schaut einfach, was du ausgefüllt hast:

     nur  images    →  Bild-Beitrag
     nur  text      →  Text-Beitrag (bekommt einen blauen Rahmen)
     beides         →  Bild mit Text

   Alles ist optional ausser dem Datum. Ein Beitrag mit nur
   einem Satz ist genauso ein richtiger Beitrag wie einer mit
   fünf Bildern.

   ---------------------------------------------------------
   WAS DIE FELDER BEDEUTEN
   ---------------------------------------------------------

     date     Pflicht. Immer im Format "JAHR-MONAT-TAG",
              also "2026-10-02". Daraus wird auch der
              Permalink gebaut (die Adresse zu genau
              diesem Beitrag).

     title    Optional. Überschrift des Beitrags.

     text     Optional. Fliesstext. Jeder Absatz ist ein
              eigener Eintrag in den eckigen Klammern:
                 text: [
                   "Erster Absatz.",
                   "Zweiter Absatz."
                 ]

     images   Optional. Liste von Bildern. Pro Bild:
                 src      Pfad zum Bild
                 alt      Bildbeschreibung für Screenreader
                          und für den Fall, dass das Bild
                          nicht lädt. Beschreibe, was zu
                          sehen ist. Bitte immer ausfüllen.
                 caption  Optional. Bildunterschrift,
                          erscheint in Griffiths-Kursiv.

              Mehrere Bilder = mehrere Blöcke in { },
              mit Komma dazwischen. Pro Block nur EIN src:
                 images: [
                   { src: "images/a.jpg", alt: "…" },
                   { src: "images/b.jpg", alt: "…" }
                 ]

              Bilder bitte als .jpg (oder .png), nicht als
              .tif — TIFFs zeigen die meisten Browser gar
              nicht an. Und am besten ohne Leerzeichen im
              Dateinamen: plakate-zufall-1.jpg

     tags     Optional. Liste von Schlagworten, z.B.
              ["norte"]. Die Schlagworte stehen weiter
              unten bei TAGS — nur was dort steht,
              funktioniert hier.

     link     Optional. Ein Verweis nach draussen:
                 link: { href: "https://…", label: "ansehen" }

     id       Optional. Nur nötig, wenn du den Permalink
              selbst bestimmen willst. Normalerweise
              weglassen — der wird automatisch gebaut.

   ---------------------------------------------------------
   PROJEKTE SIND SCHLAGWORTE
   ---------------------------------------------------------

   Es gibt keine getrennte Projektseite mehr. Ein Projekt
   ist ein Schlagwort: alle Beiträge mit  tags: ["norte"]
   bilden zusammen die Seite  journal.html?tag=norte  —
   und zwar von alt nach neu, damit man den Weg durch das
   Projekt lesen kann.

   Die Projektseite schreibt sich also selbst, während du
   postest. Du musst nichts doppelt pflegen.

   ========================================================= */


/* =========================================================
   SCHLAGWORTE
   =========================================================

   Pro Schlagwort:
     title    wie es auf der Seite steht
     project  true  = ist ein Projekt (wird oben im Journal
                      als Filter angezeigt)
              false = lockeres Schlagwort (z.B. "Gedanken")
     blurb    Optional. Ein Satz, der oben auf der
              Schlagwort-Seite steht.

   Der Schlüssel links (z.B. norte:) ist das, was du bei
   tags: [...] schreibst. Kurz, keine Leerzeichen, keine
   Umlaute — er landet in der Web-Adresse.
   ========================================================= */

window.TAGS = {

  konzept: {
    title:   'Konzept',
    project: true,
    blurb:   'Konzeptuelle Projekte.'
  },

  grafik: {
    title:   'Grafik',
    project: true,
    blurb:   'Grafische Projekte.'
  },

  norte: {
    title:   'Magazin "Norte"',
    project: true,
    blurb:   'Eine umfassende Betrachtung von "Wert".'
  },

  kiruna: {
    title:   "snow festival Kiruna",
    project: true,
    blurb:   "Schneeskulptur JEAHKAL beim Snöfestivalen in Kiruna."
  },

  adorno: {
    title:   'calendar "Buongiorno Adorno"',
    project: true,
    blurb:   ""
  },

  monster: {
    title:   "children's book \"Mein Monster und ich\"",
    project: true,
    blurb:   ""
  },

  reflektor: {
    title:   'festival "reflektor"',
    project: true,
    blurb:   ""
  },

  /* Kein Projekt, sondern ein lockeres Schlagwort.
     So kannst du auch Dinge posten, die zu keinem
     Projekt gehören. Lege gern weitere an. */
  gedanken: {
    title:   "Gedanken",
    project: false,
    blurb:   "Halbfertige Gedanken über Gestaltung."
  },

  prozess: {
    title:   "Prozess",
    project: false,
    blurb:   "Zwischenstände, Fehlversuche, Druckproben."
  }

};


/* =========================================================
   BEITRÄGE — neueste ganz oben
   ========================================================= */

window.POSTS = [

  {
    date:  "2026-10-03",
    title: "zufall",
    text: [
      "Wir alle hören es und wir alle tun es: Wir reden in der Öffentlichkeit und Unbekannte können uns zuhören. Ich habe an drei Orten zugehört und alles, was ich zufällig aufgeschnappt habe, in dieser Plakatserie dargestellt."
    ],
    images: [
      {
        src:     "images/plakate-zufall-1.jpg",
        alt:     "Drei Plakate hängen an einer Wand, man sieht verwobene schwarze Typografie auf Spiegelkarton",
        caption: "Zufall"
      },
      {
        src:     "images/plakate-zufall-2.jpg",
        alt:     "Zwei Menschen schauen zu drei Plakaten an einer Betonwand hoch. Im Spiegelkarton spiegelt sich ein Mann in orangem Pullover.",
        caption: "Zufall"
      }
    ],
    tags: ["grafik", "konzept"]
  },

  {
    date:  "2026-10-03",
    title: "anfang",
    text: [
      "Zeit für was Neues",
    ],
    tags: ["gedanken"]
  },

  /* ------------------------------------------------------
     BEISPIEL 1: nur Text
     Kein Bild, nur Gedanken. Bekommt im Raster einen
     blauen Rahmen, damit man sieht, dass es ein
     Text-Beitrag ist.
     ------------------------------------------------------ */
  {
    date:  "2026-10-02",
    title: "Warum dieses Journal",
    text: [
      "Ich studiere noch und gestalte freiberuflich nebenbei. Eine Portfolioseite verlangt, dass alles fertig ist, bevor es gezeigt werden darf — und so arbeite ich nicht.",
      "Also: kein Portfolio, sondern ein Journal. Hier liegt der Prozess. Druckproben, die daneben gingen, Sätze, die ich noch nicht zu Ende gedacht habe, und manchmal auch etwas Fertiges."
    ],
    tags: ["gedanken"]
  },

  /* ------------------------------------------------------
     BEISPIEL 2: Bild mit Text
     Beides ausgefüllt. Das ist der normale Fall.
     ------------------------------------------------------ */
  {
    date:  "2026-09-28",
    title: "Erste Andrucke",
    text: [
      "Das Grün zieht im Druck deutlich mehr ins Gelbe als am Bildschirm. Beim nächsten Andruck mit einem kälteren Grün gegentesten."
    ],
    images: [
      {
        src:     "images/norte.jpg",
        alt:     "Aufgeschlagene Magazinseiten in Grün und Blau, bedruckt mit der wiederholten Frage „Was ist der Wert des Denkens?“",
        caption: "Andruck, Bogen 3"
      }
    ],
    tags: ["norte", "prozess"]
  },

  /* ------------------------------------------------------
     BEISPIEL 3: nur Bilder
     Kein Text, nur schauen. Mehrere Bilder in einem
     Beitrag sind erlaubt — im Raster erscheint das erste,
     beim Anklicken alle.
     ------------------------------------------------------ */
  {
    date: "2026-09-20",
    images: [
      {
        src:     "images/kiruna.jpg",
        alt:     "Schneeskulptur JEAHKAL beim Snöfestivalen in Kiruna",
        caption: "JEAHKAL"
      }
    ],
    tags: ["kiruna"]
  },


  /* ======================================================
     AB HIER: die fünf Projekte von vorher.

     ⚠️ Die Daten unten sind geraten — bitte durch die
     echten ersetzen. Das Datum bestimmt die Reihenfolge
     im Journal, deshalb lohnt es sich.
     ====================================================== */

  {
    date:  "2026-06-01",                 /* TODO: echtes Datum */
    title: 'Magazin "Norte"',
    text: [
      "Hier kommt der Text zum Projekt hin."
    ],
    images: [
      {
        src:     "images/norte.jpg",
        alt:     "Aufgeschlagene Magazinseiten in Grün und Blau, bedruckt mit der wiederholten Frage „Was ist der Wert des Denkens?“",
        caption: 'Magazin "Norte": umfassende Betrachtung von "Wert"'
      }
    ],
    tags: ["norte"]
  },

  {
    date:  "2026-03-01",                 /* TODO: echtes Datum */
    title: "snow festival Kiruna",
    text: [
      "Gruppenprojekt mit Prof. Ilka Raupach, Prof. Christian Stollberg, Matthes Golz, Franz Kotte und Aljoscha Schmidt."
    ],
    images: [
      {
        src:     "images/kiruna.jpg",
        alt:     "Schneeskulptur JEAHKAL beim Snöfestivalen in Kiruna",
        caption: "Schneeskulptur JEAHKAL, Kiruna Snöfestivalen"
      }
    ],
    tags: ["kiruna"]
  },

  {
    date:  "2025-12-01",                 /* TODO: echtes Datum */
    title: 'calendar "Buongiorno Adorno"',
    text: [
      "Hier kommt der Text zum Projekt hin."
    ],
    images: [
      {
        src:     "images/adorno.jpg",
        alt:     "",                     /* TODO: Bildbeschreibung */
        caption: 'Kalender "Buongiorno Adorno"'
      }
    ],
    tags: ["adorno"]
  },

  {
    date:  "2025-09-01",                 /* TODO: echtes Datum */
    title: "children's book \"Mein Monster und ich\"",
    text: [
      "Hier kommt der Text zum Projekt hin."
    ],
    images: [
      {
        src:     "images/monster.jpg",
        alt:     "",                     /* TODO: Bildbeschreibung */
        caption: "Kinderbuch \"Mein Monster und ich\""
      }
    ],
    tags: ["monster"]
  },

  {
    date:  "2025-06-01",                 /* TODO: echtes Datum */
    title: 'festival "reflektor"',
    text: [
      "Hier kommt der Text zum Projekt hin."
    ],
    images: [
      {
        src:     "images/reflektor.jpg",
        alt:     "",                     /* TODO: Bildbeschreibung */
        caption: 'Festival "reflektor"'
      }
    ],
    tags: ["reflektor"]
  }

];
