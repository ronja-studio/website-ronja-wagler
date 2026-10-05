/* =========================================================
   Startseite
   - die Vorschau oben rechts zeigt den neuesten Beitrag mit Bild
   - die Pfeile blättern durch die Beiträge
   - "Ronja Wagler" öffnet das Über-mich-Fenster
   =========================================================

   Die Vorschau holt sich ihre Inhalte aus js/posts.js —
   derselben Datei, aus der das Journal gebaut wird. Es gibt
   also nichts doppelt zu pflegen: postest du etwas Neues mit
   Bild, steht es automatisch auch hier vorne.
   ========================================================= */

(function () {
  "use strict";

  /* --- Einstellung zum Drehen ----------------------------
     Wie viele der neuesten Beiträge sollen in der Vorschau
     durchblätterbar sein? Nur Beiträge MIT Bild kommen
     infrage — die Vorschau ist ein Bildrahmen. */
  var PREVIEW_COUNT = 8;

  var posts = window.POSTS || [];

  /* --- Vorschau ------------------------------------------ */

  var link    = document.querySelector(".preview__link");
  var img     = document.querySelector(".preview__img");
  var caption = document.querySelector(".preview__caption");
  var prev    = document.querySelector(".preview__arrow--prev");
  var next    = document.querySelector(".preview__arrow--next");

  /* Permalink-Namen wie im Journal vergeben: Datum + laufende
     Nummer innerhalb des Tages. Muss zur gleichen Rechnung in
     js/journal.js passen, damit die Links stimmen. */
  var seenPerDay = {};
  posts.forEach(function (post) {
    if (post.id) return;
    var n = (seenPerDay[post.date] || 0) + 1;
    seenPerDay[post.date] = n;
    post.id = post.date + "-" + n;
  });

  /* Neueste zuerst, nur mit Bild, und höchstens PREVIEW_COUNT. */
  var shown = posts
    .filter(function (post) { return post.images && post.images.length; })
    .sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;        /* neu → alt */
    })
    .slice(0, PREVIEW_COUNT);

  var current = 0;

  function show(index) {
    if (!shown.length) return;

    current = (index + shown.length) % shown.length;
    var post  = shown[current];
    var image = post.images[0];

    img.src = image.src;
    img.alt = image.alt || "";

    /* Als Unterschrift am liebsten die Bildunterschrift,
       sonst den Titel, sonst gar nichts. */
    caption.textContent = image.caption || post.title || "";

    /* Führt in das Journal, direkt auf diesen Beitrag. */
    link.href = "journal.html#" + encodeURIComponent(post.id);
    link.setAttribute("aria-label", (post.title || image.caption || "Beitrag") + " im Journal ansehen");
  }

  if (link && shown.length) {
    show(0);
    if (prev) prev.addEventListener("click", function () { show(current - 1); });
    if (next) next.addEventListener("click", function () { show(current + 1); });
  } else if (link) {
    /* Noch kein Beitrag mit Bild: Rahmen ausblenden, statt
       ein kaputtes Bild zu zeigen. */
    var preview = document.querySelector(".preview");
    if (preview) preview.hidden = true;
  }

  /* --- Über mich ----------------------------------------- */

  var about      = document.getElementById("about");
  var openBtn    = document.getElementById("about-open");
  var closeBtn   = document.getElementById("about-close");
  var lastFocus  = null;

  function openAbout() {
    lastFocus = document.activeElement;
    about.hidden = false;
    closeBtn.focus();
  }

  function closeAbout() {
    about.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  if (about && openBtn && closeBtn) {
    openBtn.addEventListener("click", openAbout);
    closeBtn.addEventListener("click", closeAbout);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !about.hidden) closeAbout();
    });
  }
})();
