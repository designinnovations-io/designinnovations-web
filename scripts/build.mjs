import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve("dist");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await copyFile(resolve("index.html"), resolve(outputDir, "index.html"));
await copyFile(resolve("index.html"), resolve(outputDir, "404.html"));
await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8");

console.log(`Built static site in ${outputDir}`);
