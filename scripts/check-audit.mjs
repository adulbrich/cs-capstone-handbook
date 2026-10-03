#!/usr/bin/env node
// `npm audit --audit-level=high` with a reviewed exception list. A bare audit
// fails every pull request the day an advisory is published with no patched
// release, and the only way through is to weaken the gate for everything.
// This keeps the gate at high and critical, and lets through only the
// advisories listed below, each with the reason it does not reach this site.
//
// It fails on:
// - a high or critical advisory not on the list;
// - a listed advisory that `npm audit fix` can now resolve without a major
//   bump, so the exception ends the day a patch ships;
// - a listed advisory npm no longer reports, so the list cannot go stale.
//
// Run: node scripts/check-audit.mjs

import { spawnSync } from "node:child_process";

const BLOCKING = new Set(["high", "critical"]);

// Advisory id: why it does not reach this site. Remove an entry once its
// package ships a patched release; the fixable and stale checks below enforce that.
const EXCEPTIONS = {
  "GHSA-ch52-4w7c-c8xp":
    "http-cache-semantics <=4.2.0, no patched release. Cross-user disclosure from a shared cache; astro uses it only in its build-time cache for remote images, and the site is static, so no cache serves more than one user.",
  "GHSA-vfj7-8cjw-p6xm":
    "braces <=3.0.3, no patched release. Stack-exhaustion DoS on deeply nested patterns; reached only through chokidar (starlight-page-actions) and fast-glob (ultracite) at build and lint time, with patterns from this repository's own config.",
};

const run = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  report = undefined;
}
// npm writes its own failures (no network, no lockfile) as JSON too, so a
// report that parses is not yet a report: fail closed unless it carries the
// vulnerabilities map.
if (run.error || !report || report.error || !report.vulnerabilities) {
  console.error("npm audit did not produce a report:");
  console.error(
    run.error?.message ||
      report?.error?.summary ||
      report?.message ||
      run.stderr ||
      run.stdout
  );
  process.exit(1);
}

const idOf = (url) => url.split("/").pop();

// Every advisory npm reports, with whether any package it affects can be
// fixed without a major bump.
const advisories = new Map();
for (const vuln of Object.values(report.vulnerabilities)) {
  for (const via of vuln.via) {
    if (typeof via !== "object") {
      continue;
    }
    const id = idOf(via.url);
    const entry = advisories.get(id) ?? {
      fixable: false,
      packages: new Set(),
      severity: via.severity,
      title: via.title,
    };
    entry.packages.add(via.name);
    // true, or an object naming the fix: only a non-major one counts, since
    // a major fix is a breaking change npm audit fix will not apply.
    const fix = vuln.fixAvailable;
    if (
      fix === true ||
      (typeof fix === "object" && fix !== null && !fix.isSemVerMajor)
    ) {
      entry.fixable = true;
    }
    advisories.set(id, entry);
  }
}

const failures = [];
for (const [id, advisory] of advisories) {
  if (!BLOCKING.has(advisory.severity)) {
    continue;
  }
  if (!(id in EXCEPTIONS)) {
    failures.push(
      `${id} (${advisory.severity}): ${advisory.title} in ${[...advisory.packages].join(", ")}`
    );
  } else if (advisory.fixable) {
    failures.push(
      `${id} is an exception, but npm audit fix can now resolve it: run it and remove the exception.`
    );
  }
}
for (const id of Object.keys(EXCEPTIONS)) {
  if (!advisories.has(id)) {
    failures.push(
      `${id} is an exception that npm audit no longer reports: remove it.`
    );
  }
}

for (const [id, reason] of Object.entries(EXCEPTIONS)) {
  if (advisories.has(id)) {
    console.log(`Allowed ${id}: ${reason}`);
  }
}

if (failures.length > 0) {
  console.error("\nAudit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
console.log(
  "\nAudit OK: no high or critical advisory outside the reviewed exceptions."
);
