import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("the source bundle has deployable content", () => {
  assert.match(page, /<script type="__bundler\/template">/);
  const templateMatch = page.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/);
  const template = JSON.parse(templateMatch[1]);
  assert.match(template, /id="capabilities"/);
  assert.match(template, /id="work"/);
  assert.match(template, /id="approach"/);
  assert.match(template, /id="contact"/);
  assert.match(template, /href="mailto:chris@designinnovations\.io"/);
  assert.match(template, /--paper:#ddd8ce/);
  assert.match(template, /background:#f1eee7/);
  assert.match(template, /background:#ece8df/);
  assert.doesNotMatch(template, /--paper:#f4f3ee/);
  assert.doesNotMatch(template, /PIXI\.js/);
  assert.equal((template.match(/GSAP/g) || []).length, 3);
  assert.equal((template.match(/WebGL/g) || []).length, 1);
  assert.doesNotMatch(template, /Cleveland Clinic/);
  assert.doesNotMatch(template, /Paylocity/);
  assert.match(template, />Practical AI & Automation<\/h3>/);
  assert.match(template, /assistants that answer questions/);
  assert.match(template, />AI for Real Work<\/h4>/);
  assert.doesNotMatch(template, /\bLLMs?\b|>RAG<|Vector Search|LLM pipelines/);
});

test("the production page is optimized as normal static assets", () => {
  const builtPage = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(builtPage, /<link rel="stylesheet" href="\/assets\/site\.css">/);
  assert.doesNotMatch(builtPage, /\sstyle="/);
  assert.doesNotMatch(builtPage, /\sstyle-hover="/);
  assert.doesNotMatch(builtPage, /\bdi-style-\d+\b/);
  assert.match(builtPage, /\bdi-navlink-rule\b/);
  assert.match(builtPage, /\bdi-navlink-hover\b/);
  assert.match(builtPage, /<script defer src="\/assets\/site\.js"><\/script>/);
  assert.match(builtPage, /<script[^>]*data-dc-script[^>]*><\/script>/);
  assert.doesNotMatch(builtPage, /data-dc-script[^>]*>\s*class Component/);
  assert.match(builtPage, /<script defer src="\/assets\/.+\.js"><\/script>/);
  assert.match(builtPage, /<link rel="canonical" href="https:\/\/designinnovations\.io\/">/);
  assert.match(builtPage, /application\/ld\+json/);
  assert.match(builtPage, /property="og:image" content="https:\/\/designinnovations\.io\/assets\/og\.png"/);
  assert.doesNotMatch(builtPage, /__bundler\/manifest/);
  assert.ok(existsSync(new URL("../dist/assets/og.png", import.meta.url)));
  assert.ok(existsSync(new URL("../dist/assets/site.js", import.meta.url)));
  assert.ok(existsSync(new URL("../dist/robots.txt", import.meta.url)));
  assert.ok(existsSync(new URL("../dist/sitemap.xml", import.meta.url)));
});

test("terminal animations keep stable production hooks", () => {
  const builtPage = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
  const builtScript = readFileSync(new URL("../dist/assets/site.js", import.meta.url), "utf8");

  assert.match(builtPage, /<pre data-stackterm=""/);
  assert.match(builtPage, /<pre data-buildterm=""/);
  assert.match(builtScript, /document\.querySelector\('pre\[data-stackterm\]'\)/);
  assert.doesNotMatch(builtScript, /style\.minHeight/);
});

test("the Cardboard Spaceship proposal is published at its standalone route", () => {
  const proposal = readFileSync(
    new URL("../dist/cardboard-spaceship-proposal/index.html", import.meta.url),
    "utf8",
  );

  assert.match(proposal, /Agentic workflows\. <span>Ready to run\.<\/span>/);
  assert.match(proposal, /Start with what matters\. Lay the track as we go\./);
  assert.match(proposal, /<meta name="robots" content="noindex, nofollow, noarchive">/);
  assert.match(proposal, /\$5,700/);
  assert.match(proposal, /\$3,000/);
});
