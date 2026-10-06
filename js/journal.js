/* =========================================================
   Das Journal
   - baut das Raster aus js/posts.js
   - filtert nach Schlagwort  (journal.html?tag=norte)
   - öffnet einzelne Beiträge gross  (journal.html#2026-10-02-1)
   =========================================================

   Aufbau dieser Datei, von oben nach unten:

     1. Einstellungen zum Drehen
     2. Kleine Helfer (Datum, Permalink, …)
     3. Beiträge sortieren und filtern
     4. Eine Karte bauen
     5. Das Mauerwerk-Raster (die unterschiedlich hohen Spalten)
     6. Die Grossansicht eines Beitrags
     7. Los geht's

   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. EINSTELLUNGEN ZUM DREHEN
     Alles, was man zum Ausprobieren anfassen will, steht
     hier oben. Weiter unten muss dafür nichts geändert
     werden.
     ======================================================= */

  /* Wie viele Zeilen Text eine Karte im Raster zeigt, bevor
     abgeschnitten wird. Der ganze Text steht dann in der
     Grossansicht. Höher = längere Karten. */
  var EXCERPT_LINES = 12;

  /* Zeilenhöhe und Abstand des Rasters stehen NUR in
     styles.css (--feed-row und --feed-gap). Dieses Skript
     fragt sie beim Rechnen dort ab — siehe spanCard().

     Früher standen die beiden Zahlen hier noch einmal, und
     man musste sie von Hand gleich halten. Am Handy und
     Tablet wird der Abstand in der CSS aber kleiner (20 statt
     28px) — das Skript rechnete weiter mit 28, gab jeder
     Karte zu wenig Platz, und die Karten rutschten
     übereinander. Jetzt gibt es nur noch eine Quelle. */

  /* Monatsnamen für die Datumsanzeige. */
  var MONTHS = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];


  /* =======================================================
     2. KLEINE HELFER
     ======================================================= */

  var posts = window.POSTS || [];
  var tags  = window.TAGS  || {};

  /* Kurzschreibweise für "neues Element mit Klasse". */
  function el(tagName, className, textContent) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (textContent) node.textContent = textContent;
    return node;
  }

  /* "2026-10-02"  →  "2. Oktober 2026" */
  function formatDate(iso) {
    var parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    var month = MONTHS[Number(parts[1]) - 1] || parts[1];
    return Number(parts[2]) + ". " + month + " " + parts[0];
  }

  /* --- Platzhalter für fehlende Bilder ---
     Liegt ein Bild noch nicht in images/ oder ist der Name
     vertippt, zeigt der Browser normalerweise ein kaputtes
     Bild-Symbol und die Karte fällt in sich zusammen. Statt
     dessen zeichnen wir einen grauen Kasten im richtigen
     Format. Das Raster bleibt ganz und man SIEHT, welche
     Datei fehlt — praktischer als ein stilles Loch. */
  var PLACEHOLDER_W     = 600;
  var PLACEHOLDER_RATIO = 3 / 2;    /* Breite zu Höhe */

  function placeholder(label) {
    var w = PLACEHOLDER_W;
    var h = Math.round(w / PLACEHOLDER_RATIO);
    var safe = String(label)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    /* Ein SVG direkt als Bildquelle — kein zusätzlicher
       Netzwerk-Zugriff, keine extra Datei im Projekt. */
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
      '<rect width="100%" height="100%" fill="#f2f2f2"/>' +
      '<rect x="8" y="8" width="' + (w - 16) + '" height="' + (h - 16) + '"' +
      ' fill="none" stroke="#2f00ff" stroke-dasharray="7 7"/>' +
      '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"' +
      ' font-family="monospace" font-size="19" fill="#2f00ff">' + safe + '</text>' +
      '</svg>';

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* Hängt den Platzhalter an ein <img>. Das once-true sorgt
     dafür, dass sich das nicht endlos wiederholt, falls auch
     der Platzhalter nicht lädt. */
  function catchMissing(img, label) {
    img.addEventListener("error", function () {
      img.src = placeholder(label);
    }, { once: true });
  }

  /* Welche Art von Beitrag ist das?
     Wir fragen das nicht ab, wir schauen einfach nach,
     welche Felder ausgefüllt sind. */
  function hasImages(post) { return !!(post.images && post.images.length); }
  function hasText(post)   { return !!(post.text && post.text.length); }

  /* Permalink-Name für einen Beitrag.
     Normalerweise Datum + laufende Nummer innerhalb dieses
     Tages, also "2026-10-02-1". Dadurch bleibt die Adresse
     gleich, auch wenn später neue Beiträge oben dazukommen —
     anders als bei einer Nummerierung über die ganze Liste.
     Wer mag, kann im Beitrag ein eigenes  id:  setzen. */
  function assignIds(list) {
    var seenPerDay = {};
    list.forEach(function (post) {
      if (post.id) return;
      var n = (seenPerDay[post.date] || 0) + 1;
      seenPerDay[post.date] = n;
      post.id = post.date + "-" + n;
    });
  }

  /* Welches Schlagwort ist über ?tag=… gewünscht? */
  function currentTag() {
    var match = /[?&]tag=([^&]+)/.exec(window.location.search);
    if (!match) return null;
    var key = decodeURIComponent(match[1]);
    return tags[key] ? key : null;   /* unbekannte Schlagworte ignorieren */
  }


  /* =======================================================
     3. SORTIEREN UND FILTERN

     Hauptseite:      neu  → alt   (was gibt's Neues)
     Schlagwortseite: alt  → neu   (der Weg durch ein Projekt)
     ======================================================= */

  function selectPosts(tagKey) {
    var list = posts.slice();   /* Kopie, damit das Original in Ruhe bleibt */

    if (tagKey) {
      list = list.filter(function (post) {
        return post.tags && post.tags.indexOf(tagKey) !== -1;
      });
    }

    list.sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? -1 : 1;     /* alt → neu */
    });

    if (!tagKey) list.reverse();           /* Hauptseite: neu → alt */

    return list;
  }


  /* =======================================================
     4. EINE KARTE BAUEN

     Eine Karte ist ein <article> mit, je nach Beitrag:
       Bild  ·  Datum  ·  Titel  ·  Text (gekürzt)  ·  Schlagworte

     Die ganze Karte ist klickbar und öffnet die Grossansicht.
     ======================================================= */

  function buildCard(post) {
    var card = el("article", "post");
    card.dataset.id = post.id;

    /* Text-Beiträge bekommen den blauen Rahmen. */
    if (!hasImages(post)) card.classList.add("post--text");

    /* --- Bild (nur das erste; der Rest in der Grossansicht) --- */
    if (hasImages(post)) {
      var first = post.images[0];
      var figure = el("figure", "post__figure");

      var img = el("img", "post__img");
      img.src = first.src;
      img.alt = first.alt || "";
      img.loading = "lazy";       /* lädt erst, wenn es in Sichtweite kommt */
      img.decoding = "async";
      catchMissing(img, first.src);
      figure.appendChild(img);

      /* Hinweis, wenn mehr Bilder dahinter liegen. */
      if (post.images.length > 1) {
        figure.appendChild(el("span", "post__count", "+" + (post.images.length - 1)));
      }

      card.appendChild(figure);
    }

    /* --- Kopfzeile: Datum --- */
    var time = el("time", "post__date", formatDate(post.date));
    time.dateTime = post.date;
    card.appendChild(time);

    /* --- Titel --- */
    if (post.title) {
      card.appendChild(el("h2", "post__title", post.title));
    }

    /* --- Bildunterschrift des ersten Bildes --- */
    if (hasImages(post) && post.images[0].caption) {
      card.appendChild(el("p", "post__caption", post.images[0].caption));
    }

    /* --- Text, auf EXCERPT_LINES Zeilen gekürzt --- */
    if (hasText(post)) {
      var body = el("div", "post__excerpt");
      body.style.setProperty("--lines", EXCERPT_LINES);
      post.text.forEach(function (paragraph) {
        body.appendChild(el("p", null, paragraph));
      });
      card.appendChild(body);
    }

    /* --- Schlagworte --- */
    if (post.tags && post.tags.length) {
      var row = el("p", "post__tags");
      post.tags.forEach(function (key) {
        if (!tags[key]) return;           /* unbekannt → überspringen */
        var link = el("a", "tag", tags[key].title);
        link.href = "journal.html?tag=" + encodeURIComponent(key);
        /* Damit ein Klick auf das Schlagwort nicht gleichzeitig
           die Grossansicht öffnet. */
        link.addEventListener("click", function (event) {
          event.stopPropagation();
        });
        row.appendChild(link);
      });
      card.appendChild(row);
    }

    /* --- Die ganze Karte öffnet den Beitrag ---
       Wir benutzen keinen echten Link um die ganze Karte,
       weil dann die Schlagwort-Links darin verschachtelte
       Links wären — das ist in HTML nicht erlaubt. Stattdessen
       ein echter Link nur auf dem Titelbereich (damit die
       Adresse kopierbar bleibt) plus Klick auf die Karte. */
    var open = el("a", "post__open");
    open.href = "#" + post.id;
    open.setAttribute("aria-label", (post.title || formatDate(post.date)) + " öffnen");
    card.appendChild(open);

    card.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;    /* echte Links gewinnen */
      window.location.hash = post.id;
    });

    return card;
  }


  /* =======================================================
     5. DAS MAUERWERK-RASTER

     Das Raster ist ein CSS-Grid mit sehr vielen, sehr
     niedrigen Zeilen (--feed-row in styles.css). Jede Karte bekommt per
     JavaScript gesagt, über wie viele dieser Zeilen sie sich
     erstreckt — nämlich genau so viele, wie sie hoch ist.
     So entstehen die versetzten Spalten, aber die Reihenfolge
     im HTML bleibt die echte zeitliche Reihenfolge. Das ist
     wichtig für Screenreader und für die Tab-Taste.

     (CSS kann das inzwischen auch selbst — grid-template-rows:
     masonry — aber noch nicht in allen Browsern. Wenn das
     irgendwann überall geht, kann dieser Abschnitt weg.)

     Gerechnet wird mit demselben ResizeObserver-Trick wie
     beim orangen Stift auf der RAL-Seite: der Browser sagt
     uns, wenn sich eine Höhe ändert, und wir rechnen neu.
     ======================================================= */

  function spanCard(card) {
    /* Wird der gekürzte Text wirklich abgeschnitten? Nur dann
       soll er unten weich auslaufen. scrollHeight ist die Höhe,
       die der Text BRAUCHTE; clientHeight die, die er BEKOMMT. */
    var excerpt = card.querySelector(".post__excerpt");
    if (excerpt) {
      excerpt.classList.toggle(
        "is-clamped",
        excerpt.scrollHeight > excerpt.clientHeight + 1
      );
    }

    /* Die Karte ist so hoch wie ihr Inhalt, weil im CSS
       align-items: start steht. Darum ist offsetHeight hier
       die echte Inhaltshöhe. */
    var height = card.getBoundingClientRect().height;

    /* Zeilenhöhe und Abstand so, wie das Raster sie GERADE
       wirklich benutzt — also schon mit den Werten für die
       aktuelle Bildschirmbreite. getComputedStyle liefert
       z.B. "20px"; parseFloat macht daraus die Zahl 20. */
    var gridStyle = getComputedStyle(card.parentNode);
    var rowHeight = parseFloat(gridStyle.gridAutoRows) || 8;
    var rowGap    = parseFloat(gridStyle.rowGap) || 0;

    /* Eine Karte über N Zeilen ist N Zeilen hoch plus die
       N−1 Abstände dazwischen. Wir suchen das kleinste N,
       bei dem das mindestens so hoch ist wie die Karte. */
    var span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    card.style.gridRowEnd = "span " + Math.max(1, span);
  }

  function layout(grid) {
    Array.prototype.forEach.call(grid.children, spanCard);
  }

  function watchLayout(grid) {
    /* Jede Karte beobachten: ändert sich ihre Höhe (Bild
       fertig geladen, Fenster schmaler, Schrift nachgeladen),
       rechnen wir ihren Platz neu. */
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { spanCard(entry.target); });
      });
      Array.prototype.forEach.call(grid.children, function (card) {
        observer.observe(card);
      });
    } else {
      /* Sehr alte Browser: einmal rechnen und bei resize neu. */
      window.addEventListener("resize", function () { layout(grid); });
    }

    /* Sicherheitsnetz: Bilder melden sich, wenn sie da sind.
       (Der ResizeObserver merkt das meist schon selbst, aber
       nicht in jedem Browser gleich zuverlässig.) */
    grid.querySelectorAll("img").forEach(function (img) {
      if (img.complete) return;
      img.addEventListener("load",  function () { layout(grid); });
      img.addEventListener("error", function () { layout(grid); });
    });

    /* Und noch einmal, wenn die Schriften fertig geladen sind —
       Fliege Mono und Griffiths ändern die Texthöhen. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { layout(grid); });
    }
  }


  /* =======================================================
     6. GROSSANSICHT EINES BEITRAGS

     Kein eigene HTML-Seite pro Beitrag — eine Ebene, die
     sich über das Raster legt. Die Adresse ändert sich
     trotzdem (journal.html#2026-10-02-1), damit man einen
     einzelnen Beitrag verschicken kann und der Zurück-Knopf
     funktioniert.
     ======================================================= */

  var overlay   = document.getElementById("single");
  var panel     = overlay && overlay.querySelector(".single__panel");
  var body      = overlay && overlay.querySelector(".single__body");
  var closeBtn  = overlay && overlay.querySelector(".single__close");
  var lastFocus = null;

  function findPost(id) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) return posts[i];
    }
    return null;
  }

  function fillSingle(post) {
    body.textContent = "";    /* leer räumen */

    var time = el("time", "single__date", formatDate(post.date));
    time.dateTime = post.date;
    body.appendChild(time);

    if (post.title) body.appendChild(el("h2", "single__title", post.title));

    if (hasText(post)) {
      var text = el("div", "single__text");
      post.text.forEach(function (paragraph) {
        text.appendChild(el("p", null, paragraph));
      });
      body.appendChild(text);
    }

    /* Hier ALLE Bilder, nicht nur das erste. */
    if (hasImages(post)) {
      post.images.forEach(function (image) {
        var figure = el("figure", "single__figure");
        var img = el("img", "single__img");
        img.src = image.src;
        img.alt = image.alt || "";
        img.loading = "lazy";
        catchMissing(img, image.src);
        figure.appendChild(img);
        if (image.caption) {
          figure.appendChild(el("figcaption", "single__caption", image.caption));
        }
        body.appendChild(figure);
      });
    }

    if (post.link && post.link.href) {
      var out = el("p", "single__link");
      var a = el("a", null, post.link.label || post.link.href);
      a.href = post.link.href;
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      out.appendChild(a);
      body.appendChild(out);
    }

    if (post.tags && post.tags.length) {
      var row = el("p", "single__tags");
      post.tags.forEach(function (key) {
        if (!tags[key]) return;
        var link = el("a", "tag", tags[key].title);
        link.href = "journal.html?tag=" + encodeURIComponent(key);
        row.appendChild(link);
      });
      body.appendChild(row);
    }
  }

  function openSingle(post) {
    if (!overlay) return;
    fillSingle(post);
    if (overlay.hidden) lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("is-locked");   /* Hintergrund nicht scrollen */
    panel.scrollTop = 0;
    closeBtn.focus();
  }

  function closeSingle() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* Die Adresse ist die Wahrheit: beim Laden und bei jeder
     Änderung der Raute schauen wir, was offen sein soll. */
  function syncFromHash() {
    var id = window.location.hash.replace(/^#/, "");
    var post = id ? findPost(decodeURIComponent(id)) : null;
    if (post) openSingle(post);
    else closeSingle();
  }

  function wireSingle() {
    if (!overlay) return;

    /* Schliessen räumt die Raute aus der Adresse — dann
       übernimmt syncFromHash und macht wirklich zu. */
    function dismiss() {
      if (window.location.hash) {
        history.pushState(null, "", window.location.pathname + window.location.search);
      }
      closeSingle();
    }

    closeBtn.addEventListener("click", dismiss);

    /* Klick auf den dunklen Rand schliesst auch. */
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) dismiss();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") dismiss();
    });

    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
  }


  /* =======================================================
     7. LOS GEHT'S
     ======================================================= */

  function buildTagBar(activeKey) {
    var bar = document.getElementById("tagbar");
    if (!bar) return;

    /* Nur Schlagworte zeigen, zu denen es wirklich Beiträge
       gibt — sonst führen Filter ins Leere. */
    var used = {};
    posts.forEach(function (post) {
      (post.tags || []).forEach(function (key) { used[key] = true; });
    });

    var all = el("a", "tag" + (activeKey ? "" : " is-active"), "alles");
    all.href = "journal.html";
    bar.appendChild(all);

    Object.keys(tags).forEach(function (key) {
      if (!used[key]) return;
      var link = el("a", "tag" + (key === activeKey ? " is-active" : ""), tags[key].title);
      link.href = "journal.html?tag=" + encodeURIComponent(key);
      bar.appendChild(link);
    });
  }

  function buildTagHeader(activeKey) {
    var head = document.getElementById("taghead");
    if (!head || !activeKey) return;

    var tag = tags[activeKey];
    head.appendChild(el("h1", "taghead__title", tag.title));
    if (tag.blurb) head.appendChild(el("p", "taghead__blurb", tag.blurb));
    head.appendChild(el("p", "taghead__hint",
      "Alle Beiträge zu diesem " + (tag.project ? "Projekt" : "Schlagwort") +
      ", von früh nach spät."));
    head.hidden = false;
  }

  var grid = document.getElementById("feed");
  if (!grid) return;

  assignIds(posts);

  var tagKey = currentTag();
  var list   = selectPosts(tagKey);

  buildTagBar(tagKey);
  buildTagHeader(tagKey);

  if (!list.length) {
    grid.parentNode.insertBefore(
      el("p", "feed__empty", "Hier ist noch nichts. Bald!"),
      grid
    );
  }

  list.forEach(function (post) { grid.appendChild(buildCard(post)); });

  layout(grid);
  watchLayout(grid);

  wireSingle();
  syncFromHash();

  /* Für die Startseite und spätere Spielereien. */
  window.RWJournal = { posts: posts, relayout: function () { layout(grid); } };
})();
