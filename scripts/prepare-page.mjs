import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [inputArg, outputArg = "index.html"] = process.argv.slice(2);

if (!inputArg) {
  console.error("Usage: node scripts/prepare-page.mjs <source-html> [output-html]");
  process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
let page = readFileSync(inputPath, "utf8");

const replaceExact = (source, search, replacement, expectedCount) => {
  const count = source.split(search).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} occurrence(s) of ${search}, found ${count}`);
  }
  return source.split(search).join(replacement);
};

page = replaceExact(
  page,
  "<title>Bundled Page</title>",
  "<title>Design Innovations | Software, Web & AI</title>\n  <meta name=\"description\" content=\"Senior software engineering, web development, AI integration, and real-time graphics from Design Innovations LLC.\">\n  <meta name=\"theme-color\" content=\"#0c0d0f\">",
  1,
);

page = replaceExact(
  page,
  "hello@designinnovations.studio",
  "chris@designinnovations.io",
  2,
);

const technologyChanges = [
  [
    'font-size:11.5px;color:#6b6f76;border:1px solid #e6e4dc;border-radius:7px;padding:4px 9px\\">PIXI.js<\\u002Fspan>',
    'font-size:11.5px;color:#6b6f76;border:1px solid #e6e4dc;border-radius:7px;padding:4px 9px\\">GSAP<\\u002Fspan>',
    1,
  ],
  [
    'font-size:12.5px;color:#c8ccd4;border:1px solid #2c2f37;border-radius:8px;padding:6px 11px;background:#0f1116\\">PIXI.js<\\u002Fspan>',
    'font-size:12.5px;color:#c8ccd4;border:1px solid #2c2f37;border-radius:8px;padding:6px 11px;background:#0f1116\\">WebGL<\\u002Fspan>',
    1,
  ],
  [
    "['graphics', 'Electron · PIXI.js · Three.js']",
    "['graphics', 'Electron · GSAP · Three.js']",
    1,
  ],
];

for (const [search, replacement, expectedCount] of technologyChanges) {
  page = replaceExact(page, search, replacement, expectedCount);
}

const audienceCopyChanges = [
  [
    ">AI Integration<\\u002Fh3>",
    ">Practical AI & Automation<\\u002Fh3>",
    1,
  ],
  [
    "Practical AI woven into real products — copilots, search, automation and LLM pipelines that ship to production, not demos.",
    "AI that helps your team get real work done — assistants that answer questions, tools that find information in your documents, and repetitive tasks handled automatically.",
    1,
  ],
  [">LLMs<\\u002Fspan>", ">AI Assistants<\\u002Fspan>", 1],
  [">RAG<\\u002Fspan>", ">Search Your Documents<\\u002Fspan>", 1],
  [">Automation<\\u002Fspan>", ">Task Automation<\\u002Fspan>", 1],
];

for (const [search, replacement, expectedCount] of audienceCopyChanges) {
  page = replaceExact(page, search, replacement, expectedCount);
}

const clientSeparator =
  '<span style=\\"color:var(--accent);font-size:clamp(10px,1.2vw,15px);margin:0 clamp(30px,4.4vw,60px)\\">◆<\\u002Fspan>\\n            ';
const clientStyle =
  "font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(22px,2.8vw,38px);letter-spacing:-.02em;color:#e7e9ee";

for (const client of ["Cleveland Clinic", "Paylocity"]) {
  const clientLabel = `<span style=\\"${clientStyle}\\">${client}<\\u002Fspan>\\n            `;
  page = replaceExact(page, clientSeparator + clientLabel, "", 2);
}

const toolkitCardStyle =
  "background:var(--ink);padding:clamp(24px,2.6vw,32px) clamp(22px,2vw,28px);transition:background .25s ease";
const toolkitHeadingStyle =
  "font-family:var(--label);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#9fb0ff";
const toolkitTagStyle =
  "font-family:var(--label);font-size:12.5px;color:#c8ccd4;border:1px solid #2c2f37;border-radius:8px;padding:6px 11px;background:#0f1116";

const buildToolkitCard = (title, count, tags) =>
  [
    `        <div style=\\"${toolkitCardStyle}\\" style-hover=\\"background:#12141a\\">`,
    '          <div style=\\"display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:18px\\">',
    `            <h4 style=\\"${toolkitHeadingStyle}\\">${title}<\\u002Fh4>`,
    `            <span style=\\"font-family:var(--label);font-size:11px;color:#4f545e\\">${count}<\\u002Fspan>`,
    "          <\\u002Fdiv>",
    '          <div style=\\"display:flex;flex-wrap:wrap;gap:8px\\">',
    ...tags.map(
      (tag) => `            <span style=\\"${toolkitTagStyle}\\">${tag}<\\u002Fspan>`,
    ),
    "          <\\u002Fdiv>",
    "        <\\u002Fdiv>",
  ].join("\\n");

const qualityCard = buildToolkitCard("Quality", "03", ["Playwright", "Jest", "xUnit"]);
const aiCard = buildToolkitCard("AI for Real Work", "04", [
  "AI Assistants",
  "Task Automation",
  "Search Your Documents",
  "Extract Data from Files",
]);
page = replaceExact(page, qualityCard, `${aiCard}\\n${qualityCard}`, 1);

const paletteChanges = [
  ["--paper:#f4f3ee", "--paper:#ddd8ce", 1],
  [
    "background:#fff;border:1px solid #e6e4dc;border-radius:18px",
    "background:#f1eee7;border:1px solid #d3cec3;border-radius:18px",
    3,
  ],
  [
    "background:#fbfaf6;border:1px solid #e6e4dc",
    "background:#ece8df;border:1px solid #d3cec3",
    1,
  ],
  [
    "border-bottom:1px solid #ece9e1;background:#f1efe8",
    "border-bottom:1px solid #d6d0c5;background:#dfd9cf",
    1,
  ],
  ["border-bottom:1px solid #e2dfd6", "border-bottom:1px solid #cbc5ba", 4],
  [
    "background:#fff;padding-left:18px",
    "background:#f0ece4;padding-left:18px",
    4,
  ],
];

for (const [search, replacement, expectedCount] of paletteChanges) {
  page = replaceExact(page, search, replacement, expectedCount);
}

writeFileSync(outputPath, page, "utf8");
console.log(`Prepared ${outputPath} from ${inputPath}`);
