import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

function parseArgs(argv) {
  const args = {
    positional: [],
    diff: "",
    fixture: "",
    threshold: 0.1,
    output: "pretty"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--diff") {
      args.diff = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--fixture") {
      args.fixture = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--threshold") {
      args.threshold = Number(argv[index + 1] || 0.1);
      index += 1;
      continue;
    }
    if (value === "--json") {
      args.output = "json";
      continue;
    }
    args.positional.push(value);
  }

  return args;
}

function resolveFixture(args) {
  if (!args.fixture) {
    return {
      label: "regression-run",
      baseline: args.positional[0],
      candidate: args.positional[1],
      diff: args.diff,
      threshold: args.threshold
    };
  }

  const fixturePath = path.resolve(process.cwd(), args.fixture);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  return {
    label: fixture.name || path.basename(fixturePath),
    baseline: fixture.baseline,
    candidate: fixture.candidate,
    diff: args.diff || fixture.diff || "",
    threshold: typeof fixture.threshold === "number" ? fixture.threshold : args.threshold
  };
}

function loadPng(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  return PNG.sync.read(fs.readFileSync(absolutePath));
}

function writeDiff(filePath, image) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, PNG.sync.write(image));
}

function runComparison(config) {
  if (!config.baseline || !config.candidate) {
    throw new Error("Provide baseline and candidate PNG files, or use --fixture with both paths.");
  }

  const baseline = loadPng(config.baseline);
  const candidate = loadPng(config.candidate);
  const result = {
    label: config.label,
    baseline: path.resolve(process.cwd(), config.baseline),
    candidate: path.resolve(process.cwd(), config.candidate),
    threshold: config.threshold
  };

  if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
    result.ok = false;
    result.error = "Images must have identical dimensions for pixel comparison.";
    result.baselineSize = { width: baseline.width, height: baseline.height };
    result.candidateSize = { width: candidate.width, height: candidate.height };
    result.similarity = 0;
    return result;
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const mismatchPixels = pixelmatch(
    baseline.data,
    candidate.data,
    diff.data,
    baseline.width,
    baseline.height,
    {
      threshold: config.threshold,
      includeAA: true
    }
  );

  const totalPixels = baseline.width * baseline.height;
  const mismatchRatio = totalPixels ? mismatchPixels / totalPixels : 0;
  const similarity = Math.max(0, Number(((1 - mismatchRatio) * 100).toFixed(3)));

  if (config.diff) {
    writeDiff(config.diff, diff);
    result.diff = path.resolve(process.cwd(), config.diff);
  }

  result.ok = true;
  result.width = baseline.width;
  result.height = baseline.height;
  result.totalPixels = totalPixels;
  result.mismatchPixels = mismatchPixels;
  result.mismatchRatio = Number(mismatchRatio.toFixed(6));
  result.similarity = similarity;
  return result;
}

function printPretty(result) {
  if (!result.ok) {
    console.error(`Regression score failed for ${result.label}`);
    console.error(result.error);
    if (result.baselineSize && result.candidateSize) {
      console.error(`Baseline: ${result.baselineSize.width}x${result.baselineSize.height}`);
      console.error(`Candidate: ${result.candidateSize.width}x${result.candidateSize.height}`);
    }
    process.exit(1);
  }

  console.log(`Regression score: ${result.label}`);
  console.log(`Baseline: ${result.baseline}`);
  console.log(`Candidate: ${result.candidate}`);
  console.log(`Similarity: ${result.similarity}%`);
  console.log(`Mismatch pixels: ${result.mismatchPixels}/${result.totalPixels}`);
  console.log(`Threshold: ${result.threshold}`);
  if (result.diff) {
    console.log(`Diff image: ${result.diff}`);
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const config = resolveFixture(args);
  const result = runComparison(config);

  if (args.output === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printPretty(result);
  }

  if (!result.ok) {
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Regression scoring failed.");
  process.exit(1);
}
