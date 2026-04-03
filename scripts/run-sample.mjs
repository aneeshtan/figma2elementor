import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { convertFigmaSelectionToElementor } from "../packages/converter/src/index.js";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const inputPath = join(currentDir, "../examples/landing-page.figjson");
const outputPath = join(currentDir, "../examples/hero-elementor.json");

const source = JSON.parse(await readFile(inputPath, "utf8"));
const result = convertFigmaSelectionToElementor(source);

await writeFile(outputPath, `${JSON.stringify(result.template, null, 2)}\n`, "utf8");

console.log(`Generated ${outputPath}`);
console.log(`Converted nodes: ${result.report.convertedNodes}`);
if (result.report.warnings.length) {
  console.log(`Warnings: ${result.report.warnings.join(" | ")}`);
}
