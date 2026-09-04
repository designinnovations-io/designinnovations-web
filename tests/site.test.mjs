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
  const gateScript = readFileSync(
    new URL("../dist/cardboard-spaceship-proposal/gate.min.js", import.meta.url),
    "utf8",
  );

  assert.match(proposal, /Agentic workflows\. <span>Ready to run\.<\/span>/);
  assert.match(proposal, /Start with what matters\. Lay the track as we go\./);
  assert.match(proposal, /<meta name="robots" content="noindex, nofollow, noarchive">/);
  assert.match(proposal, /id="proposal-gate"/);
  assert.match(proposal, /src="\.\/gate\.min\.js"/);
  assert.match(gateScript, /crypto\.subtle\.digest/);
  assert.doesNotMatch(gateScript, /Cardboard-Rocket-2026/);
  assert.ok(gateScript.split(/\r?\n/).length <= 2);
  assert.match(proposal, /\$5,700/);
  assert.match(proposal, /\$3,000/);
});

test("the Battlegrounds to Board Games SOW is published at its standalone route", () => {
  const sow = readFileSync(
    new URL("../dist/battlegrounds-to-board-games-sow/index.html", import.meta.url),
    "utf8",
  );
  const gateScript = readFileSync(
    new URL("../dist/battlegrounds-to-board-games-sow/gate.min.js", import.meta.url),
    "utf8",
  );

  assert.match(sow, /Battlegrounds to Board Games, Ltd/);
  assert.match(sow, /How the Square connection works/);
  assert.doesNotMatch(sow, /Square → Web|Web → Square|>Synced<|>Updated<|>Connected</);
  assert.match(sow, /From kickoff to handoff/);
  assert.match(sow, /Project deliverables/);
  assert.match(sow, /The design phase comes first/);
  assert.match(sow, /Experience design \+ responsive interface/);
  assert.match(sow, /Square store integration<\/span><span>40 hours/);
  assert.match(sow, /Experience design \+ responsive interface<\/span><span>38 hours/);
  assert.match(sow, /Ready to launch when/);
  assert.match(sow, /Checkout is hosted by Square/);
  assert.match(sow, /Scope changes require written approval/);
  assert.match(sow, /src="\.\/di-mark\.svg"/);
  assert.match(sow, /rel="icon" href="\.\/favicon\.svg"/);
  assert.match(sow, /cta-grid-drift/);
  assert.match(sow, /\$10,000/);
  assert.equal((sow.match(/\$10,000/g) ?? []).length, 1);
  assert.match(sow, /<h2 data-reveal>Project investment<\/h2>/);
  assert.doesNotMatch(sow, /<h2 data-reveal>\$10,000 fixed fee<\/h2>/);
  assert.match(sow, /200 planned hours/);
  assert.match(sow, /<meta name="robots" content="noindex, nofollow, noarchive">/);
  assert.match(sow, /id="proposal-gate"/);
  assert.match(sow, /src="\.\/gate\.min\.js"/);
  assert.doesNotMatch(sow, /signature|signing below/i);
  assert.doesNotMatch(sow, /automat/i);
  assert.match(gateScript, /crypto\.subtle\.digest/);
  assert.doesNotMatch(gateScript, /Meeple-Canton-2026!/);
  assert.doesNotMatch(gateScript, /b2bgames26/);
  assert.doesNotMatch(gateScript, /rollforgames/);
  assert.doesNotMatch(gateScript, /thequestbegins/);
  assert.ok(gateScript.split(/\r?\n/).length <= 2);
  assert.ok(existsSync(new URL("../dist/battlegrounds-to-board-games-sow/favicon.svg", import.meta.url)));
  assert.ok(existsSync(new URL("../dist/battlegrounds-to-board-games-sow/di-mark.svg", import.meta.url)));
});
