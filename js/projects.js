/* =========================================================
   DEINE PROJEKTE
   =========================================================

   Das hier ist die einzige Datei, die du anfassen musst,
   wenn du ein Projekt hinzufügst, änderst oder löschst.

   So fügst du ein Projekt hinzu:

   1. Bild in den Ordner  images/  legen
   2. Unten einen neuen Block kopieren und ausfüllen
   3. Komma hinter dem vorherigen Block nicht vergessen :)

   Die Reihenfolge hier ist die Reihenfolge auf der Website.

   Was die Felder bedeuten:

     slug     kurzer Name ohne Leerzeichen und Umlaute.
              Wird die Web-Adresse: .../projekt.html?p=norte
     title    Projekttitel, erscheint in der Liste links
     caption  Bildunterschrift unter dem Bild
     image    Pfad zum Bild
     alt      Bildbeschreibung für Screenreader und für den Fall,
              dass das Bild nicht lädt. Beschreibe, was zu sehen ist.
     text     Fließtext zum Projekt. Mehrere Absätze:
              einfach als mehrere Zeilen in eckigen Klammern.

   ========================================================= */

window.PROJECTS = [

  {
    slug:    "norte",
    title:   'Magazin "Norte"',
    caption: 'Magazin "Norte": umfassende Betrachtung von "Wert"',
    image:   "images/norte.jpg",
    alt:     "Aufgeschlagene Magazinseiten in Grün und Blau, bedruckt mit der wiederholten Frage „Was ist der Wert des Denkens?“",
    text: [
      "Hier kommt der Text zum Projekt hin.",
      "Ein zweiter Absatz sieht so aus."
    ]
  },

  {
    slug:    "kiruna",
    title:   "snow festival Kiruna",
    caption: "Schneeskulptur JEAHKAL, Kiruna Snöfestivalen",
    image:   "images/kiruna.jpg",
    alt:     "Schneeskulptur JEAHKAL beim Snöfestivalen in Kiruna",
    text: [
      "Gruppenprojekt mit Prof. Ilka Raupach, Prof. Christian Stollberg, Matthes Golz, Franz Kotte und Aljoscha Schmidt."
    ]
  },

  {
    slug:    "adorno",
    title:   'calendar "Buongiorno Adorno"',
    caption: 'Kalender "Buongiorno Adorno"',
    image:   "images/adorno.jpg",
    alt:     "",
    text: [
      "Hier kommt der Text zum Projekt hin."
    ]
  },

  {
    slug:    "monster",
    title:   "children's book \"Mein Monster und ich\"",
    caption: "Kinderbuch \"Mein Monster und ich\"",
    image:   "images/monster.jpg",
    alt:     "",
    text: [
      "Hier kommt der Text zum Projekt hin."
    ]
  },

  {
    slug:    "reflektor",
    title:   'festival "reflektor"',
    caption: 'Festival "reflektor"',
    image:   "images/reflektor.jpg",
    alt:     "",
    text: [
      "Hier kommt der Text zum Projekt hin."
    ]
  }

];
