import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const templateMatch = page.match(/<script type="__bundler\/template">\s*(.*?)\s*<\/script>/s);

test("the bundled page has deployable metadata", () => {
  assert.match(page, /<title>Design Innovations \| Software, Web & AI<\/title>/);
  assert.match(page, /<meta name="description" content="Senior software engineering/);
  assert.doesNotMatch(page, /<title>Bundled Page<\/title>/);
});

test("the embedded site template and assets are present", () => {
  assert.ok(templateMatch, "embedded page template should exist");
  assert.match(page, /<script type="__bundler\/manifest">/);
  assert.match(page, /<script type="__bundler\/ext_resources">/);

  const template = JSON.parse(templateMatch[1]);
  assert.match(template, /id="capabilities"/);
  assert.match(template, /id="work"/);
  assert.match(template, /id="approach"/);
  assert.match(template, /id="contact"/);
});

test("the toned-down light palette is applied", () => {
  const template = JSON.parse(templateMatch[1]);
  assert.match(template, /--paper:#ddd8ce/);
  assert.match(template, /background:#f1eee7/);
  assert.match(template, /background:#ece8df/);
  assert.doesNotMatch(template, /--paper:#f4f3ee/);
});

test("the primary contact remains a working email link", () => {
  const template = JSON.parse(templateMatch[1]);
  assert.match(template, /href="mailto:hello@designinnovations\.studio"/);
});

test("hidden technology references stay out of the public copy", () => {
  const template = JSON.parse(templateMatch[1]);
  assert.doesNotMatch(template, /PIXI\.js/);
  assert.equal((template.match(/GSAP/g) || []).length, 3);
  assert.equal((template.match(/WebGL/g) || []).length, 1);
});

test("hidden client names stay out of the public copy", () => {
  const template = JSON.parse(templateMatch[1]);
  assert.doesNotMatch(template, /Cleveland Clinic/);
  assert.doesNotMatch(template, /Paylocity/);
});

test("the AI copy describes recognizable uses without technical jargon", () => {
  const template = JSON.parse(templateMatch[1]);
  assert.match(template, />Practical AI & Automation<\/h3>/);
  assert.match(template, /assistants that answer questions/);
  assert.match(template, />AI for Real Work<\/h4>/);
  assert.match(template, />AI Assistants<\/span>/);
  assert.match(template, />Task Automation<\/span>/);
  assert.match(template, />Search Your Documents<\/span>/);
  assert.match(template, />Extract Data from Files<\/span>/);
  assert.doesNotMatch(template, /\bLLMs?\b|>RAG<|Vector Search|LLM pipelines/);
});
