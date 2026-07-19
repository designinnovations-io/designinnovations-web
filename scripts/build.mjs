import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";

const sourceFile = resolve("index.html");
const outputDir = resolve("dist");
const assetsDir = resolve(outputDir, "assets");
const socialImage = resolve("assets/og.png");
const siteUrl = "https://designinnovations.io/";

const mimeExtensions = {
  "text/javascript": ".js",
  "text/css": ".css",
  "font/woff2": ".woff2",
  "image/svg+xml": ".svg",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

const scriptContents = (source, type) => {
  const expression = new RegExp(`<script type="__bundler/${type}">\\s*([\\s\\S]*?)\\s*</script>`);
  const match = source.match(expression);
  if (!match) throw new Error(`The bundled ${type} data is missing.`);
  return match[1];
};

const decodeAsset = (entry) => {
  const bytes = Buffer.from(entry.data, "base64");
  return entry.compressed ? gunzipSync(bytes) : bytes;
};

const extractInlineStyles = (html) => {
  const classes = new Map();
  const rules = [];
  const usedNames = new Set();

  const semanticStem = (name, attributes) => {
    const existingClasses = attributes.match(/\sclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];
    const existingClass = existingClasses.find((className) => className.startsWith("di-"));
    if (existingClass) return existingClass.replace(/^di-/, "");

    const id = attributes.match(/\sid="([^"]*)"/)?.[1];
    if (id) return id;
    if (/\sdata-buildterm(?:\s|=|$)/.test(attributes)) return "build-terminal";
    if (/\sdata-reveal(?:\s|=|$)/.test(attributes)) return "reveal";
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };

  const uniqueName = (preferredName) => {
    let className = preferredName;
    let index = 2;
    while (usedNames.has(className)) className = `${preferredName}-${index++}`;
    usedNames.add(className);
    return className;
  };

  const classFor = (declarations, stem, suffix = "") => {
    const key = `${suffix}:${declarations}`;
    if (!classes.has(key)) {
      const purpose = suffix ? "hover" : "rule";
      const className = uniqueName(`di-${stem}-${purpose}`);
      classes.set(key, className);
      rules.push(`.${className}${suffix} { ${declarations} }`);
    }
    return classes.get(key);
  };

  return {
    html: html.replace(/<([A-Za-z][\w:-]*)([^>]*?)>/g, (tag, name, attributes) => {
      const styleMatch = attributes.match(/\sstyle="([^"]*)"/);
      const hoverMatch = attributes.match(/\sstyle-hover="([^"]*)"/);
      if (!styleMatch && !hoverMatch) return tag;

      let updatedAttributes = attributes
        .replace(/\sstyle="[^"]*"/, "")
        .replace(/\sstyle-hover="[^"]*"/, "");
      const stem = semanticStem(name, updatedAttributes);
      const styleClasses = [];
      if (styleMatch) styleClasses.push(classFor(styleMatch[1], stem));
      if (hoverMatch) styleClasses.push(classFor(hoverMatch[1], stem, ":hover"));

      const existingClass = updatedAttributes.match(/\sclass="([^"]*)"/);
      if (existingClass) {
        updatedAttributes = updatedAttributes.replace(
          /\sclass="[^"]*"/,
          ` class="${existingClass[1]} ${styleClasses.join(" ")}"`,
        );
      } else {
        updatedAttributes += ` class="${styleClasses.join(" ")}"`;
      }
      return `<${name}${updatedAttributes}>`;
    }),
    css: rules.join("\n"),
  };
};

const source = await readFile(sourceFile, "utf8");
const template = JSON.parse(scriptContents(source, "template"));
const manifest = JSON.parse(scriptContents(source, "manifest"));

await rm(outputDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

const assetPaths = new Map();
for (const [id, entry] of Object.entries(manifest)) {
  const extension = mimeExtensions[entry.mime] || ".bin";
  const fileName = `${id}${extension}`;
  await writeFile(resolve(assetsDir, fileName), decodeAsset(entry));
  assetPaths.set(id, `/assets/${fileName}`);
}

let documentHtml = template;
for (const [id, path] of assetPaths) documentHtml = documentHtml.split(id).join(path);

const helmetMatch = documentHtml.match(/<helmet>([\s\S]*?)<\/helmet>/i);
if (!helmetMatch) throw new Error("The bundled page does not contain its document styles.");
const helmet = helmetMatch[1];
const stylesheet = [...helmet.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
  .map((match) => match[1].trim())
  .join("\n\n");
await cp(socialImage, resolve(assetsDir, "og.png"));

documentHtml = documentHtml.replace(/<helmet>[\s\S]*?<\/helmet>/i, "");
documentHtml = documentHtml.replace(/<script src="[^"]+"><\/script>/i, "");
documentHtml = documentHtml.replace(/<head>[\s\S]*?<\/head>/i, "<head></head>");

const componentScript = documentHtml.match(
  /<script([^>]*\bdata-dc-script(?:="")?[^>]*)>([\s\S]*?)<\/script>/i,
);
if (!componentScript) throw new Error("The bundled page does not contain its component script.");

const componentScriptPath = "/assets/site.js";
const componentSource = componentScript[2].trim();
documentHtml = documentHtml.replace(
  componentScript[0],
  `<script${componentScript[1]}></script>`,
);
await writeFile(
  resolve(assetsDir, "site.js"),
  `const componentScript = document.querySelector("script[data-dc-script]");\nif (componentScript) componentScript.textContent = ${JSON.stringify(componentSource)};\n`,
  "utf8",
);

const extractedStyles = extractInlineStyles(documentHtml);
documentHtml = extractedStyles.html;
await writeFile(
  resolve(assetsDir, "site.css"),
  `${stylesheet}\n\n/* Styles extracted from the page template */\n${extractedStyles.css}\n`,
  "utf8",
);

const runtimePath = [...assetPaths.entries()].find(([id]) => manifest[id].mime === "text/javascript")?.[1];
if (!runtimePath) throw new Error("The bundled runtime is missing.");

const metadata = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design Innovations | Software Engineering, Web Development & AI</title>
  <meta name="description" content="Design Innovations LLC provides senior software engineering, web development, AI integration, and real-time graphics for ambitious products.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#0c0d0f">
  <link rel="canonical" href="${siteUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Design Innovations">
  <meta property="og:title" content="Design Innovations | Software Engineering, Web Development & AI">
  <meta property="og:description" content="Senior software engineering, web development, AI integration, and real-time graphics for ambitious products.">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:image" content="${siteUrl}assets/og.png">
  <meta property="og:image:width" content="1659">
  <meta property="og:image:height" content="947">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Design Innovations | Software Engineering, Web Development & AI">
  <meta name="twitter:description" content="Senior software engineering, web development, AI integration, and real-time graphics for ambitious products.">
  <meta name="twitter:image" content="${siteUrl}assets/og.png">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"ProfessionalService","name":"Design Innovations LLC","url":"${siteUrl}","email":"chris@designinnovations.io","description":"Senior software engineering, web development, AI integration, and real-time graphics.","areaServed":"United States","serviceType":["Software engineering","Web development","AI integration","Real-time graphics"]}</script>
  <script defer src="${componentScriptPath}"></script>
  <script defer src="${runtimePath}"></script>`;

documentHtml = documentHtml.replace("<head></head>", `<head>${metadata}\n</head>`);
documentHtml = `<!doctype html>\n${documentHtml.replace(/^<!DOCTYPE html>\s*/i, "")}`;

await writeFile(resolve(outputDir, "index.html"), documentHtml, "utf8");
await cp(resolve(outputDir, "index.html"), resolve(outputDir, "404.html"));
await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8");
await writeFile(resolve(outputDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`, "utf8");
await writeFile(resolve(outputDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`, "utf8");

console.log(`Built readable, cacheable static site in ${outputDir}`);
