#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
/**
 * Pixel diff for M2 parity: reference capture vs. fork capture.
 *
 * Usage:
 *   node scripts/visual-diff.mjs <reference.png> <fork.png> [options]
 *
 * Options:
 *   --tolerance <ratio>   Max unexpected changed pixels as a ratio (default 0.01).
 *   --mask x,y,w,h        Ignore a rectangle (CSS pixels, repeatable).
 *   --threshold <y>       pixelmatch color distance sensitivity (default 0.1).
 *   --out <path>          Write a JSON report and the visual diff PNG next to it.
 *
 * Exit codes: 0 = inside tolerance, 1 = outside tolerance or size mismatch.
 * Dimension mismatches always fail: the contract compares the same viewport.
 *
 * Masks are for volatile content only (timestamps, generated text, remote
 * thumbnails). Masking structural UI to make a diff pass is forbidden — see
 * .planning/phases/10-reference-visual-contract/.
 */
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");
const { default: pixelmatch } = require("pixelmatch");

function parseArgs(argv) {
  const args = { tolerance: 0.01, threshold: 0.1, masks: [], positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--tolerance") args.tolerance = Number(argv[++i]);
    else if (arg === "--threshold") args.threshold = Number(argv[++i]);
    else if (arg === "--mask") {
      const [x, y, w, h] = argv[++i].split(",").map(Number);
      if ([x, y, w, h].some((n) => !Number.isFinite(n) || n < 0)) {
        throw new Error(`Invalid --mask rectangle: ${argv[i]}`);
      }
      args.masks.push({ x, y, width: w, height: h });
    } else if (arg === "--out") args.out = argv[++i];
    else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else args.positional.push(arg);
  }
  if (args.positional.length !== 2) throw new Error("Pass exactly two PNG paths");
  return args;
}

function loadPng(file) {
  return PNG.sync.read(readFileSync(file));
}

function applyMasks(diffPng, masks) {
  for (const { x, y, width, height } of masks) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || py < 0 || px >= diffPng.width || py >= diffPng.height) continue;
        const idx = (diffPng.width * py + px) << 2;
        diffPng.data[idx] = 255;
        diffPng.data[idx + 1] = 204;
        diffPng.data[idx + 2] = 0;
        diffPng.data[idx + 3] = 255;
      }
    }
  }
}

const args = parseArgs(process.argv.slice(2));
const reference = loadPng(args.positional[0]);
const fork = loadPng(args.positional[1]);

if (reference.width !== fork.width || reference.height !== fork.height) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "dimension-mismatch",
        reference: { width: reference.width, height: reference.height },
        fork: { width: fork.width, height: fork.height },
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const { width, height } = reference;
const diff = new PNG({ width, height });
const rawChanged = pixelmatch(reference.data, fork.data, diff.data, width, height, {
  threshold: args.threshold,
  includeAA: false,
});
const rawChangedCount = rawChanged;

// Volatile regions are excluded from the score after the match pass by
// repainting them as equal pixels in a second count.
const maskedEqual = new PNG({ width, height });
maskedEqual.data.set(diff.data);
applyMasks(maskedEqual, args.masks);
let changed = 0;
const total = width * height;
for (let i = 0; i < total; i++) {
  const idx = i << 2;
  if (
    maskedEqual.data[idx] === 255 &&
    maskedEqual.data[idx + 1] === 204 &&
    maskedEqual.data[idx + 2] === 0
  ) {
    continue;
  }
  if (diff.data[idx] > 0 || diff.data[idx + 1] > 0 || diff.data[idx + 2] > 0) {
    changed++;
  }
}

const ratio = changed / total;
const report = {
  ok: ratio <= args.tolerance,
  changedPixels: changed,
  changedBeforeMasks: rawChangedCount,
  totalPixels: total,
  changedRatio: Number(ratio.toFixed(6)),
  tolerance: args.tolerance,
  maskedRegions: args.masks,
  size: { width, height },
};

if (args.out) {
  writeFileSync(path.resolve(args.out, "diff.json"), JSON.stringify(report, null, 2));
  const maskedOutput = new PNG({ width, height });
  applyMasks(maskedOutput, args.masks);
  writeFileSync(path.resolve(args.out, "diff.png"), PNG.sync.write(maskedOutput));
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
