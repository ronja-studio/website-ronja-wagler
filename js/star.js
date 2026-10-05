/* =========================================================
   The star
   - drawn as 25 separate rays so each one can move on its own
   - turns towards the cursor like a compass (see MODE below)
   - starts fullscreen once per session, then lives in the corner
     as the home button
   ========================================================= */

(function () {
  "use strict";

  /* --- Shape (measured from the Figma star) --- */
  var RAYS        = 25;
  var OUTER_R     = 95;     // in a 200 x 200 viewBox
  var INNER_RATIO = 0.07;  // valley radius / tip radius
  var CENTRE      = 100;

  /* --- How much the rays react to the cursor ---
     Turn these up or down to taste. Nothing else needs changing. */
  var MAX_LEAN    = 25;     // degrees a ray swings sideways
  var MAX_STRETCH = 0.30;   // how much the ray nearest the cursor grows
  var REACH       = 1500;   // px — past this the star ignores the cursor

  /* --- Welche Bewegung? ---
     "swirl"  jeder Strahl schwingt einzeln zur Seite, der
              Strahl zum Cursor hin wird länger (wie bisher)
     "tilt"   der ganze Stern kippt als Scheibe zum Cursor hin,
              wie eine Blume, die sich zur Sonne dreht
     "spin"   der Stern dreht sich wie ein Rad, das der Cursor
              im Vorbeistreichen anschubst, und rollt langsam aus
     "compass" ein Strahl ist die Nadel: der Stern dreht sich,
              bis sie auf den Cursor zeigt, und pendelt sich ein

     Zum Vergleichen musst du hier nichts ändern: hänge einfach
     ?stern=swirl  ?stern=tilt  ?stern=spin  oder  ?stern=compass
     an die Adresse, z.B.
       http://localhost:8080/journal.html?stern=tilt
     Wenn du dich entschieden hast, trag das Wort hier ein. */
  var MODE = "compass";   // Ronjas Wahl, 3. Oktober 2026

  /* --- Nur für "tilt" --- */
  var MAX_TILT    = 35;     // Grad, so weit kippt der Stern höchstens
  var TILT_SHIFT  = 6;      // px, so weit rutscht er zum Cursor hin
  var DEPTH       = 400;    // px Perspektive: kleiner = dramatischer,
                            // grösser = flacher

  /* --- Nur für "spin" --- */
  var SPIN_GRAB   = 0.08;   // wie stark ein Schubs wirkt (grösser = wilder)
  var FRICTION    = 0.95;   // pro Bild bleibt so viel Schwung übrig:
                            // 0.90 = bremst schnell, 0.98 = dreht ewig
  var MAX_SPIN    = 12;     // Grad pro Bild, schneller dreht er nie

  /* --- Nur für "compass" --- */
  var NEEDLE      = 0;      // so viel länger ist der Nadel-Strahl
                            // (0 = alle gleich, dann sieht man aber
                            // kaum, wohin er zeigt)
  var PULL        = 0.02;   // wie stark die Nadel zum Cursor zieht
  var SETTLE      = 0.80;   // wie schnell das Pendeln aufhört:
                            // 0.70 = sofort ruhig, 0.92 = wackelt lange

  /* Der grosse Stern auf der Startseite dreht sich genauso,
     aber weil er so riesig ist, rasen seine Spitzen dabei
     quer über den ganzen Bildschirm. Das ist toll, kann aber
     manchen Leuten schwindlig machen. Deshalb ist er ruhiger:
     zieht sanfter und hat eine Höchstgeschwindigkeit.
     Sobald er klein in der Ecke sitzt, gelten wieder die
     Werte oben. */
  var INTRO_PULL     = 0.006; // statt PULL — kleiner = gemächlicher
  var INTRO_MAX_TURN = 0.5;   // Grad pro Bild, schneller dreht er nie
                              // (bei 60 Bildern pro Sekunde also
                              // höchstens 90° pro Sekunde)

  var SESSION_KEY = "rw-intro-seen";

  var star = document.getElementById("star");
  var group = document.getElementById("star-rays");
  var svg = star && star.querySelector(".star__svg");
  if (!star || !group) return;

  // Die Adresse schlägt die Einstellung oben (nur zum Ausprobieren).
  var asked = new URLSearchParams(window.location.search).get("stern");
  if (["swirl", "tilt", "spin", "compass"].indexOf(asked) !== -1) MODE = asked;

  // Genauso für die Nadel-Länge:  ?stern=compass&nadel=0
  var askedNeedle = parseFloat(new URLSearchParams(window.location.search).get("nadel"));
  if (!isNaN(askedNeedle)) NEEDLE = askedNeedle;

  var innerR = OUTER_R * INNER_RATIO;   // hub radius = the star's valley radius
  var step   = 360 / RAYS;
  var half   = step / 2;
  var rays   = [];

  /* Warum es die Scheibe in der Mitte gibt:
     Der Stern besteht aus 25 einzelnen Dreiecken — nur deshalb kann sich
     jeder Strahl für sich bewegen. 25 Dreiecke im Kreis lassen aber genau
     in der Mitte ein kleines Loch übrig. Die Scheibe deckt es zu.
     Sie ist so groß wie der Innenradius aus Figma, liegt also genau da,
     wo die Mitte des Sterns sowieso war — man sieht sie nicht.

     Damit sich die Strahlen frei bewegen können, ohne aus der Scheibe
     herauszurutschen (dann blitzt Weiß durch), beginnen sie ein Stück
     INNERHALB von ihr. Wie weit innen, wird hier automatisch berechnet —
     so bleibt es dicht, egal wie hoch du MAX_STRETCH drehst. */
  var BASE_TUCK = 0.85 / (1 + MAX_STRETCH);

  /* ---------------------------------------------------------
     Draw
     Each ray is a thin triangle: valley – tip – valley.
     --------------------------------------------------------- */

  function point(angleDeg, radius) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return [
      CENTRE + Math.cos(a) * radius,
      CENTRE + Math.sin(a) * radius
    ];
  }

  function buildRay(index) {
    var base = index * step;
    var a = point(base - half, innerR * BASE_TUCK);
    var b = point(base, OUTER_R);
    var c = point(base + half, innerR * BASE_TUCK);

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M" + a[0] + "," + a[1] +
      "L" + b[0] + "," + b[1] +
      "L" + c[0] + "," + c[1] + "Z"
    );
    path.style.transformOrigin = CENTRE + "px " + CENTRE + "px";
    group.appendChild(path);

    return { el: path, angle: base };
  }

  // Filled middle, so the centre reads as solid.
  var hub = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hub.setAttribute("cx", CENTRE);
  hub.setAttribute("cy", CENTRE);
  hub.setAttribute("r", innerR);
  group.appendChild(hub);

  for (var i = 0; i < RAYS; i++) rays.push(buildRay(i));

  /* ---------------------------------------------------------
     Lean towards the cursor
     --------------------------------------------------------- */

  var pointer = { x: 0, y: 0, active: false };
  var frame = null;

  function render() {
    frame = null;

    var box = star.getBoundingClientRect();
    var cx = box.left + box.width / 2;
    var cy = box.top + box.height / 2;

    var dx = pointer.x - cx;
    var dy = pointer.y - cy;
    var distance = Math.hypot(dx, dy);

    // Fades out smoothly as the cursor moves away.
    var strength = pointer.active ? Math.max(0, 1 - distance / REACH) : 0;

    if (strength === 0) {
      rays.forEach(function (ray) { ray.el.style.transform = ""; });
      if (svg) svg.style.transform = "";
      return;
    }

    if (MODE === "tilt") {
      tilt(dx, dy, distance, strength);
      return;
    }

    // 0° = straight up, matching how the rays are drawn.
    var cursorAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    rays.forEach(function (ray) {
      var delta = (cursorAngle - ray.angle) * Math.PI / 180;
      var lean    = Math.sin(delta) * MAX_LEAN * strength;
      var stretch = 1 + Math.max(0, Math.cos(delta)) * MAX_STRETCH * strength;
      ray.el.style.transform = "rotate(" + lean + "deg) scale(" + stretch + ")";
    });
  }

  /* Kippen: der Stern bleibt ganz, nur die ganze Scheibe dreht
     sich in 3D, so dass ihre Vorderseite zum Cursor schaut.
     (dx, dy) / distance ist die Richtung zum Cursor als Pfeil
     der Länge 1 — damit hängt das Kippen nur von der Richtung
     ab, und von der Entfernung nur über strength. */
  function tilt(dx, dy, distance, strength) {
    if (!svg) return;
    var dirX = distance ? dx / distance : 0;
    var dirY = distance ? dy / distance : 0;

    // rotateY dreht nach links/rechts, rotateX nach oben/unten.
    // Das Minus bei X, weil "Cursor unten" in CSS "nach vorne
    // kippen" heisst — ohne würde der Stern wegschauen.
    var turnY  =  dirX * MAX_TILT * strength;
    var turnX  = -dirY * MAX_TILT * strength;
    var shiftX =  dirX * TILT_SHIFT * strength;
    var shiftY =  dirY * TILT_SHIFT * strength;

    svg.style.transform =
      "perspective(" + DEPTH + "px)" +
      " translate(" + shiftX + "px, " + shiftY + "px)" +
      " rotateX(" + turnX + "deg) rotateY(" + turnY + "deg)";
  }

  /* ---------------------------------------------------------
     Drehen wie ein Rad ("spin")

     Stell dir vor, du streichst mit dem Finger an einem Rad
     vorbei: nur der Teil deiner Bewegung, der QUER zur Linie
     Stern–Finger geht, dreht das Rad. Bewegst du dich direkt
     auf die Mitte zu, passiert nichts.

     Genau das rechnet push() aus (das nennt man Kreuzprodukt):
       Lage des Cursors relativ zur Sternmitte  ×  Bewegung
     Das Ergebnis kommt als Schwung in "speed". spinLoop() dreht
     den Stern dann jedes Bild um speed weiter und lässt ihn mit
     FRICTION langsam auslaufen.
     --------------------------------------------------------- */

  var angle = 0;          // aktuelle Drehung in Grad
  var speed = 0;          // Grad pro Bild
  var spinning = false;
  var last = null;        // letzte Cursorposition, für die Bewegung

  // Die Strahlen drehen sich um die Mitte des Sterns.
  group.style.transformOrigin = CENTRE + "px " + CENTRE + "px";

  function push(x, y) {
    if (last) {
      var box = star.getBoundingClientRect();
      var rx = x - (box.left + box.width / 2);    // Cursor relativ
      var ry = y - (box.top + box.height / 2);    // zur Sternmitte
      var mx = x - last.x;                        // Bewegung seit
      var my = y - last.y;                        // dem letzten Mal
      var distance = Math.hypot(rx, ry) || 1;
      var strength = Math.max(0, 1 - distance / REACH);

      // Querbewegung in px. Positiv = im Uhrzeigersinn.
      var across = (rx * my - ry * mx) / distance;

      speed += across * SPIN_GRAB * strength;
      speed = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, speed));
      if (!spinning) {
        spinning = true;
        requestAnimationFrame(spinLoop);
      }
    }
    last = { x: x, y: y };
  }

  function spinLoop() {
    angle = (angle + speed) % 360;
    speed *= FRICTION;
    group.style.transform = "rotate(" + angle + "deg)";

    // Fast still? Dann aufhören zu rechnen, spart Akku.
    if (Math.abs(speed) < 0.01) {
      spinning = false;
      return;
    }
    requestAnimationFrame(spinLoop);
  }

  /* ---------------------------------------------------------
     Kompass ("compass")

     Strahl Nummer 0 (der, der anfangs nach oben zeigt) ist die
     Nadel. Bei jeder Bewegung rechnen wir aus, in welchem Winkel
     der Cursor vom Stern aus liegt — das ist das Ziel.

     Die Nadel springt nicht hin, sondern wird hingezogen wie an
     einer Feder: je weiter weg vom Ziel, desto stärker der Zug
     (PULL). Dabei schiesst sie etwas über das Ziel hinaus und
     pendelt zurück, bis SETTLE den Schwung aufgebraucht hat.
     Genau dieses Pendeln macht es zum Kompass.
     --------------------------------------------------------- */

  var needleAngle = 0;    // wohin die Nadel gerade zeigt
  var needleSpeed = 0;
  var goal = 0;           // wohin sie zeigen will
  var swinging = false;

  function aim(x, y) {
    var box = star.getBoundingClientRect();
    var dx = x - (box.left + box.width / 2);
    var dy = y - (box.top + box.height / 2);
    // 0° = nach oben, wie beim Zeichnen der Strahlen.
    goal = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    rays[0].el.style.transform = "scale(" + (1 + NEEDLE) + ")";
    if (!swinging) {
      swinging = true;
      requestAnimationFrame(swingLoop);
    }
  }

  function swingLoop() {
    // Kürzester Weg zum Ziel: von 350° nach 10° sind es 20°
    // vorwärts, nicht 340° rückwärts. Das ((… % 360) + 540) % 360 − 180
    // bringt jeden Unterschied in den Bereich −180 bis +180.
    var diff = ((goal - needleAngle) % 360 + 540) % 360 - 180;

    var big = star.classList.contains("is-intro");

    needleSpeed += diff * (big ? INTRO_PULL : PULL);
    needleSpeed *= SETTLE;
    if (big) {
      needleSpeed = Math.max(-INTRO_MAX_TURN, Math.min(INTRO_MAX_TURN, needleSpeed));
    }
    needleAngle += needleSpeed;
    group.style.transform = "rotate(" + needleAngle + "deg)";

    // Angekommen und ruhig? Dann aufhören zu rechnen.
    if (Math.abs(diff) < 0.05 && Math.abs(needleSpeed) < 0.05) {
      swinging = false;
      return;
    }
    requestAnimationFrame(swingLoop);
  }

  function onMove(event) {
    if (MODE === "spin") {
      push(event.clientX, event.clientY);
      return;
    }
    if (MODE === "compass") {
      aim(event.clientX, event.clientY);
      return;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (frame === null) frame = requestAnimationFrame(render);
  }

  function onLeave() {
    last = null;   // sonst gibt es beim Wiederkommen einen Riesenschubs
    pointer.active = false;
    if (frame === null) frame = requestAnimationFrame(render);
  }

  var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  if (finePointer.matches && !stillMotion.matches) {
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
  }

  /* ---------------------------------------------------------
     Intro → home
     The star never actually moves in the layout. We just work
     out how far its centre is from the middle of the screen
     and hand that to CSS, so one transform does scale + travel.
     --------------------------------------------------------- */

  function measure() {
    /* Gleit-Animation kurz ausschalten. Sonst sieht man den
       grossen Stern erst in der Ecke und dann zur Mitte gleiten,
       weil das Verschieben selbst animiert würde. Wir wollen ihn
       aber sofort in der Mitte haben. (Gilt auch, wenn jemand
       das Fenster grösser oder kleiner zieht.) */
    star.style.transition = "none";

    var box = star.getBoundingClientRect();
    var homeCx = box.left + box.width / 2;
    var homeCy = box.top + box.height / 2;

    // If the star is already shifted by the intro transform, subtract
    // that shift again — otherwise we'd measure the moved star and the
    // offset would drift every time we recalculate.
    if (star.classList.contains("is-intro")) {
      homeCx -= parseFloat(star.style.getPropertyValue("--star-dx")) || 0;
      homeCy -= parseFloat(star.style.getPropertyValue("--star-dy")) || 0;
    }

    star.style.setProperty("--star-dx", (window.innerWidth / 2 - homeCx) + "px");
    star.style.setProperty("--star-dy", (window.innerHeight / 2 - homeCy) + "px");

    /* Den Browser zwingen, die neue Position JETZT zu übernehmen
       (offsetWidth abfragen reicht dafür — "void" heisst nur: wir
       wollen den Wert gar nicht, nur die Nebenwirkung).
       Danach Animation wieder an, damit das Kleinwerden beim
       Klicken weiterhin schön gleitet. */
    void star.offsetWidth;
    star.style.transition = "";
  }

  function land() {
    if (!star.classList.contains("is-intro")) return;
    star.classList.remove("is-intro");
    star.setAttribute("aria-label", "Zur Startseite");
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) { /* private mode */ }
  }

  var seen = false;
  try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { /* ignore */ }

  /* Zum Testen: mit  index.html?intro  in der Adresse kommt der
     grosse Stern immer, auch wenn du ihn schon gesehen hast. */
  if (new URLSearchParams(window.location.search).has("intro")) seen = false;

  /* Den Vorhang will nur die Seite, die den Stern mit der
     Klasse is-intro ausliefert — also die Startseite. Im
     Journal steht die Klasse nicht im HTML, dort ist der
     Stern von Anfang an der kleine Heim-Knopf. */
  var wantsIntro = star.classList.contains("is-intro");

  if (seen || !wantsIntro) {
    star.classList.remove("is-intro");
  } else {
    measure();
    star.setAttribute("aria-label", "Website betreten");
  }

  star.addEventListener("click", function () {
    if (star.classList.contains("is-intro")) {
      land();
    } else {
      window.location.href = "index.html";
    }
  });

  window.addEventListener("resize", function () {
    if (star.classList.contains("is-intro")) measure();
  });

  // Expose for the rest of the site (e.g. page transitions later).
  window.RWStar = { land: land, element: star };
})();
