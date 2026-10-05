/* =========================================================
   RSS-Feed bauen
   =========================================================

   WAS IST RSS?

   Eine einfache Datei, in der alle deine Beiträge stehen.
   Wer dir folgen will, trägt die Adresse dieser Datei in
   sein Leseprogramm ein (z.B. NetNewsWire, Reeder, Feedly)
   und bekommt neue Beiträge dort automatisch angezeigt.

   Das ist das Gegenteil von Social Media:
     · du erfährst nicht, wer dir folgt
     · niemand wird von einem Algorithmus sortiert
     · es gibt keine Likes und keine Zahlen
     · es funktioniert ohne Konto, ohne Tracking, ohne Cookies

   Es ist alt, langweilig und funktioniert seit über
   zwanzig Jahren unverändert.

   ---------------------------------------------------------
   WARUM EIN SKRIPT UND NICHT EINFACH JAVASCRIPT AUF DER SEITE?
   ---------------------------------------------------------

   Das Journal baut sich im Browser zusammen. Ein
   Leseprogramm führt aber kein JavaScript aus — es lädt nur
   eine Datei. Die Datei muss also VORHER schon fertig sein.
   Dieses Skript schreibt sie.

   ---------------------------------------------------------
   SO BENUTZT DU ES
   ---------------------------------------------------------

   Im Terminal, im Projektordner:

       bun tools/build-feed.mjs

   Das liest js/posts.js und schreibt feed.xml.
   Danach feed.xml mit hochladen / mit committen.

   Immer dann ausführen, wenn du etwas gepostet hast.
   (Wenn das später nervt, kann ein GitHub-Workflow das bei
   jedem Push automatisch machen — wie beim RAL-Projekt.)
   ========================================================= */

import { readFileSync, writeFileSync } from "node:fs";

/* =========================================================
   EINSTELLUNGEN
   ========================================================= */

/* ⚠️ Sobald die Domain registriert ist, hier eintragen.
   RSS braucht vollständige Adressen (mit https://), weil die
   Datei ja in einem fremden Programm geöffnet wird und
   relative Pfade dort ins Nichts zeigen würden. */
const SITE  = "https://ronjawagler.de";

const TITLE = "Ronja Wagler — Journal";
const DESC  = "Prozess, Gedanken und Projekte aus Konzept, Design und Illustration.";
const LANG  = "de";

/* Wie viele Beiträge in den Feed? Leseprogramme brauchen
   keine komplette Archivdatei. */
const LIMIT = 30;

/* =========================================================
   POSTS EINLESEN

   js/posts.js schreibt in  window.TAGS  und  window.POSTS.
   Hier gibt es kein window (das gibt es nur im Browser), also
   stellen wir ein leeres Objekt hin und lassen die Datei
   dagegen laufen. So bleibt posts.js die EINZIGE Quelle —
   nichts muss doppelt gepflegt werden.
   ========================================================= */

const source = readFileSync("js/posts.js", "utf8");
const fake = {};
new Function("window", source)(fake);

const posts = fake.POSTS || [];
const tags  = fake.TAGS  || {};

/* Permalink-Namen genau wie im Browser vergeben: Datum +
   laufende Nummer innerhalb des Tages. Muss zur Rechnung in
   js/journal.js passen, sonst zeigen die Feed-Links daneben. */
const perDay = {};
for (const post of posts) {
  if (post.id) continue;
  const n = (perDay[post.date] || 0) + 1;
  perDay[post.date] = n;
  post.id = `${post.date}-${n}`;
}

/* Neueste zuerst. */
const newest = [...posts]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  .slice(0, LIMIT);

/* =========================================================
   XML BAUEN
   ========================================================= */

/* In XML haben <, > und & eine eigene Bedeutung. Steht so ein
   Zeichen im Text, muss es umgeschrieben werden, sonst ist die
   Datei kaputt. Dasselbe Prinzip wie &amp; in HTML. */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* RSS will Datumsangaben im alten E-Mail-Format,
   z.B. "Thu, 02 Oct 2026 09:00:00 +0000". */
function rfc822(isoDate) {
  return new Date(`${isoDate}T09:00:00Z`).toUTCString();
}

/* Der Inhalt eines Beitrags als kleines Stück HTML:
   Absätze, dann Bilder. Leseprogramme zeigen das direkt an. */
function contentHtml(post) {
  const parts = [];

  for (const paragraph of post.text || []) {
    parts.push(`<p>${esc(paragraph)}</p>`);
  }

  for (const image of post.images || []) {
    const src = `${SITE}/${image.src}`;
    parts.push(
      `<p><img src="${esc(src)}" alt="${esc(image.alt || "")}"></p>` +
      (image.caption ? `<p><em>${esc(image.caption)}</em></p>` : "")
    );
  }

  return parts.join("\n");
}

/* Ohne Titel nimmt der Feed das Datum als Überschrift —
   ein Beitrag ohne Titel ist erlaubt, ein <item> ohne
   irgendeine Überschrift sieht im Leseprogramm aber leer aus. */
function titleOf(post) {
  if (post.title) return post.title;
  const caption = post.images?.[0]?.caption;
  if (caption) return caption;
  return post.date;
}

const items = newest.map((post) => {
  const url = `${SITE}/journal.html#${post.id}`;
  const categories = (post.tags || [])
    .filter((key) => tags[key])
    .map((key) => `    <category>${esc(tags[key].title)}</category>`)
    .join("\n");

  return [
    "  <item>",
    `    <title>${esc(titleOf(post))}</title>`,
    `    <link>${esc(url)}</link>`,
    /* isPermaLink="false" heisst: das ist eine Kennung, keine
       Adresse. Wichtig, weil unsere Links eine Raute (#)
       enthalten und manche Leseprogramme sonst stolpern. */
    `    <guid isPermaLink="false">${esc(post.id)}</guid>`,
    `    <pubDate>${rfc822(post.date)}</pubDate>`,
    categories,
    `    <description><![CDATA[${contentHtml(post)}]]></description>`,
    "  </item>"
  ].filter(Boolean).join("\n");
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(TITLE)}</title>
  <link>${esc(SITE)}/journal.html</link>
  <description>${esc(DESC)}</description>
  <language>${esc(LANG)}</language>
  <atom:link href="${esc(SITE)}/feed.xml" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
</channel>
</rss>
`;

writeFileSync("feed.xml", xml, "utf8");
console.log(`feed.xml geschrieben — ${newest.length} von ${posts.length} Beiträgen.`);
