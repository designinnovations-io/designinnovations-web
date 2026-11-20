// Graphite palette: keeps the whole page dark. The light "paper" sections
// (Capabilities, How we work) and the light build terminal are remapped to the
// Design Innovations design system's graphite tokens. Labels use JetBrains Mono.
//
// Usage: node scripts/graphite.mjs [page.html]   (defaults to index.html, in place)
// prepare-page.mjs also runs applyGraphitePage() on every re-import.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Design-system tokens (Graphite theme).
const t = {
  bg000: "#0a0b0d",
  bg200: "#14161b",
  bg300: "#1c1f26",
  term: "#12141a",
  line100: "#23262d",
  line200: "#2c2f37",
  lineHover: "#3a3d44",
  ink200: "#e7e9ee",
  ink300: "#aeb2bb",
  ink400: "#8a8f99",
  code: "#cdd0d6",
  link: "#8fb3ff",
  eyebrow: "#9fb0ff",
  signal: "#7dd8a8",
};

const replaceExact = (text, search, replacement, expectedCount, label) => {
  const count = text.split(search).length - 1;
  if (count !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount} of ${JSON.stringify(search)}, found ${count}.`);
  }
  return text.split(search).join(replacement);
};

const sectionBounds = (template, id) => {
  const start = template.indexOf(`<section id="${id}"`);
  if (start < 0) throw new Error(`Section #${id} is missing.`);
  const end = template.indexOf("</section>", start);
  return [start, end];
};

const editRange = (template, [start, end], edits, label) => {
  let part = template.slice(start, end);
  for (const [search, replacement, count] of edits) {
    part = replaceExact(part, search, replacement, count, label);
  }
  return template.slice(0, start) + part + template.slice(end);
};

const lightSectionOpen = (id) => [
  `<section id="${id}" data-nav="light" style="padding:`,
  `<section id="${id}" data-nav="dark" style="background:${t.bg200};color:#fff;border-top:1px solid ${t.line100};padding:`,
  1,
];

export const applyGraphite = (template) => {
  if (template.includes('data-graphite="1"')) return template;
  let out = template;

  // Root: drop the unresolved {{ }} placeholders (they ship literally and void
  // --accent and --label in production), set mono labels, retire the tan paper.
  out = replaceExact(
    out,
    ":root{--accent:#2b4cff;--ink:#0c0d0f;--paper:#ddd8ce;--label:'IBM Plex Mono',monospace}",
    `:root{--accent:#2b4cff;--ink:#0c0d0f;--paper:${t.bg200};--label:'JetBrains Mono',ui-monospace,monospace}`,
    1,
    "root",
  );
  out = replaceExact(
    out,
    'style="--accent:{{ accent }};--label:{{ labelStack }};background:var(--paper)',
    'data-graphite="1" style="background:var(--paper)',
    1,
    "root placeholders",
  );

  out = editRange(
    out,
    sectionBounds(out, "capabilities"),
    [
      lightSectionOpen("capabilities"),
      ["color:var(--accent)", `color:${t.eyebrow}`, 4],
      ["background:#f1eee7;border:1px solid #d3cec3", `background:${t.bg300};border:1px solid ${t.line200}`, 3],
      ["rgba(12,13,15,.32)", "rgba(0,0,0,.55)", 3],
      ["border-color:#d6d3c8", `border-color:${t.lineHover}`, 3],
      ["color:#5b5f67", `color:${t.ink300}`, 3],
      ["color:#6b6f76;border:1px solid #e6e4dc", `color:${t.ink400};border:1px solid ${t.line200}`, 9],
      ["border:1px solid var(--ink)", "border:1px solid var(--accent)", 1],
      ["background:#ece8df;border:1px solid #d3cec3", `background:${t.bg000};border:1px solid ${t.line200}`, 1],
      ["border-bottom:1px solid #d6d0c5;background:#dfd9cf", `border-bottom:1px solid ${t.line100};background:${t.term}`, 1],
      ["background:#d6d3c8", `background:${t.lineHover}`, 3],
      ["color:#9a9588", `color:${t.ink400}`, 1],
      ["color:#4a4e56", `color:${t.code}`, 1],
    ],
    "capabilities",
  );

  out = editRange(
    out,
    sectionBounds(out, "approach"),
    [
      lightSectionOpen("approach"),
      ["color:var(--accent)", `color:${t.eyebrow}`, 5],
      ["border-top:1px solid #e2dfd6", `border-top:1px solid ${t.line100}`, 1],
      ["border-bottom:1px solid #cbc5ba", `border-bottom:1px solid ${t.line100}`, 4],
      ["background:#f0ece4", `background:${t.bg300}`, 4],
      ["color:#1c1d20", `color:${t.ink300}`, 4],
      ["color:#5b5f67", `color:${t.ink300}`, 4],
    ],
    "approach",
  );

  // The build terminal used to sit on a light card; give it dark-panel colours.
  const start = out.indexOf("_runBuildTerminal(term, reduce) {");
  const end = out.indexOf("\n  _runTerminal(", start);
  if (start < 0 || end < 0) throw new Error("Build terminal script is missing.");
  out = editRange(
    out,
    [start, end],
    [
      ["const acc = 'var(--accent)';", `const acc = '${t.link}';`, 1],
      ["const grn = '#1f8a5b';", `const grn = '${t.signal}';`, 1],
      ["const mut = '#9a9588';", `const mut = '${t.ink400}';`, 1],
      ["const fil = '#2b6fb5';", `const fil = '${t.eyebrow}';`, 1],
      ["const dim = '#73767d';", "const dim = '#7d828c';", 1],
      ["'#1c1d20'", `'${t.ink200}'`, 3],
      ["#4a4e56", t.code, 4],
      // Labels longer than 15 characters ("compile components", "rebuild lib/cache.ts")
      // were cut off and ran into their result. Pad instead of truncating.
      ["(label + '              ').slice(0, 15)", "label.padEnd(19) + ' '", 1],
    ],
    "build terminal",
  );

  return out;
};

const templateExpression = /(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;

export const applyGraphitePage = (page) => {
  const match = page.match(templateExpression);
  if (!match) throw new Error("The bundled template is missing.");
  const template = applyGraphite(JSON.parse(match[2]));
  const encoded = JSON.stringify(template).replaceAll("</", "<\\u002F");
  return page.replace(templateExpression, (_, open, __, close) => `${open}${encoded}${close}`);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const path = resolve(process.argv[2] ?? "index.html");
  writeFileSync(path, applyGraphitePage(readFileSync(path, "utf8")), "utf8");
  console.log(`Applied the Graphite palette to ${path}`);
}
