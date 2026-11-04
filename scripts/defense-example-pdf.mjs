#!/usr/bin/env node
// Prints public/defense-live-sheet-example.pdf, the example live sheet the
// defense page links: /tools/defense-scoresheets/example/ from the built
// site, served from dist/ on a local port and printed by headless Chrome.
// `npm run defense:example` builds first. npm test fails when the PDF was
// printed from an older rubric (defense-example.mjs), so run this after
// every edit to canvas/assignments/defense/defense-rubric.csv.
//
// Chrome is found at CHROME_PATH, else at the usual macOS and Linux paths.

import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { EXAMPLE_PDF, pdfTitle } from "../src/lib/tools/defense-example.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const out = join(root, "public", EXAMPLE_PDF);
const PAGE = "/tools/defense-scoresheets/example/";

const CHROMES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const TYPES = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const chrome = CHROMES.find((path) => existsSync(path));
if (!chrome) {
  console.error(
    `No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary; tried:\n${CHROMES.join("\n")}`
  );
  process.exit(1);
}
const built = join(dist, PAGE, "index.html");
if (!existsSync(built)) {
  console.error(`${built} is missing. Run npm run build first.`);
  process.exit(1);
}

// dist/ as the site serves it: a directory is its index.html.
const server = createServer(async (request, response) => {
  const path = normalize(
    decodeURIComponent(new URL(request.url, "http://x").pathname)
  );
  const file = join(dist, path.endsWith("/") ? join(path, "index.html") : path);
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

// Asynchronous, so this process keeps serving while Chrome loads the page.
try {
  await promisify(execFile)(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--virtual-time-budget=10000",
      `--print-to-pdf=${out}`,
      `http://127.0.0.1:${port}${PAGE}`,
    ],
    { timeout: 120_000 }
  );
} finally {
  server.close();
}

console.log(`${EXAMPLE_PDF}: ${pdfTitle(readFileSync(out))}`);
