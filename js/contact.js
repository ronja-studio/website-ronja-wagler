/* =========================================================
   "contact me" — öffnet eine neue E-Mail an dich
   =========================================================

   Jeder Link mit  data-mail  im HTML wird hier zu einem
   E-Mail-Link. Klickt jemand drauf, öffnet sich sein
   Mailprogramm mit deiner Adresse schon im "An"-Feld.

   Warum steht die Adresse nicht einfach im HTML?
   Spam-Programme durchsuchen das Netz nach Text, der wie
   eine E-Mail-Adresse aussieht, und sammeln ihn ein. Die
   meisten lesen nur das rohe HTML und führen kein
   JavaScript aus. Deshalb steht deine Adresse hier in zwei
   Teilen, ohne @, und wird erst im Browser zusammengesetzt.
   Kein perfekter Schutz, aber er hält die meisten ab.

   Neue Adresse? Nur die zwei Zeilen unten ändern — sie
   gilt dann auf allen Seiten.
   ========================================================= */

(function () {
  "use strict";

  var NAME    = "hallo.ronja";   // alles VOR dem @
  var DOMAIN  = "icloud.com";    // alles NACH dem @

  /* Optional: ein Betreff, der schon in der Mail steht.
     Leer lassen ("") für keinen Betreff. */
  var SUBJECT = "";

  var address = NAME + "@" + DOMAIN;
  var href = "mailto:" + address;
  if (SUBJECT) href += "?subject=" + encodeURIComponent(SUBJECT);

  var links = document.querySelectorAll("[data-mail]");
  for (var i = 0; i < links.length; i++) {
    links[i].href = href;
  }
})();
