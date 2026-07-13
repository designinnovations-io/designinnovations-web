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

const templatePattern = /(<script type="__bundler\/template">\s*)(.*?)(\s*<\/script>)/s;
const templateMatch = page.match(templatePattern);
if (!templateMatch) {
  throw new Error("Bundled page template was not found");
}

let template = JSON.parse(templateMatch[2]);
template = replaceExact(
  template,
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Design Innovations | Software, Web & AI</title>\n<meta name="description" content="Senior software engineering, web development, AI integration, and real-time graphics from Design Innovations LLC.">\n<meta name="theme-color" content="#0c0d0f">',
  1,
);

const paletteChanges = [
  ["--paper:#f4f3ee", "--paper:#e7e3da", 1],
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
    'style-hover="background:#fff;padding-left:18px"',
    'style-hover="background:#f0ece4;padding-left:18px"',
    4,
  ],
];

for (const [search, replacement, expectedCount] of paletteChanges) {
  template = replaceExact(template, search, replacement, expectedCount);
}

const serializedTemplate = JSON.stringify(template).replace(
  /<\/script/gi,
  "<\\u002Fscript",
);

page = page.replace(
  templatePattern,
  () => `${templateMatch[1]}${serializedTemplate}${templateMatch[3]}`,
);

writeFileSync(outputPath, page, "utf8");
console.log(`Prepared ${outputPath} from ${inputPath}`);
