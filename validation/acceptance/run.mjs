#!/usr/bin/env node
// 4 gates. G01/G02 real. G03/G04 report BLOCKED (not PASS) until implemented.
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeEnvelope } from "../envelope.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const EXCLUDE = new Set([".git", ".DS_Store", "node_modules", ".cache", "coverage"]);
// NOTE: `docs` intentionally NOT excluded — ADRs live there.

function walk(root) {
  const out = [];
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (EXCLUDE.has(e.name)) continue;
      const p = d === "." ? e.name : `${d}/${e.name}`;
      if (e.isDirectory()) rec(p); else out.push(p);
    }
  })(".");
  return out.sort();
}

const GATES = [
  {
    id: "G01", name: "tree-digest",
    run() {
      const files = walk(".");
      const digest = crypto.createHash("sha256").update(files.join("\n")).digest("hex");
      const expected = process.env.EXPECTED_TREE_DIGEST;
      if (!expected) {
        console.error(`E_NO_EXPECTED_DIGEST — first run, record this: ${digest}`);
        return { exit: 31, out: `files=${files.length} digest=${digest}` };
      }
      const ok = digest === expected;
      if (!ok) console.error(`E_DIGEST_MISMATCH expected=${expected} actual=${digest}`);
      return { exit: ok ? 0 : 30, out: `files=${files.length} digest=${digest}` };
    }
  },
  {
    id: "G02", name: "schemas-loaded",
    run() {
      const dirs = ["contracts/bases", "contracts/manifests"].filter(d => fs.existsSync(d));
      let n = 0;
      for (const d of dirs) for (const f of fs.readdirSync(d)) {
        if (!f.endsWith(".json")) continue;
        const s = JSON.parse(fs.readFileSync(`${d}/${f}`, "utf8"));
        if (!s.$id) { console.error(`E_NO_ID ${f}`); return { exit: 30, out: "" }; }
        n++;
      }
      // zero schemas is not a pass
      return { exit: n > 0 ? 0 : 32, out: `schemas=${n}` };
    }
  },
  { id: "G03", name: "canonical-vs-bytes", run: () => ({ exit: 33, out: "BLOCKED: not implemented in this slice", blocked: true }) },
  { id: "G04", name: "fixtures",             run: () => ({ exit: 33, out: "BLOCKED: not implemented in this slice", blocked: true }) },
];

const results = GATES.map(g => {
  const r = g.run();
  const state = r.blocked ? "BLOCKED" : (r.exit === 0 ? "PASS" : "FAIL");
  console.log(`[${g.id}] ${g.name}: ${state} ${r.out}`);
  return { id: g.id, state, exit: r.exit, out: r.out };
});

const anyFail = results.some(r => r.state === "FAIL");
const anyBlocked = results.some(r => r.state === "BLOCKED");
// exit 0 only if EVERY gate PASSes — blocked is not pass
const exitCode = anyFail ? 30 : anyBlocked ? 33 : 0;

await writeEnvelope("A00", { exit_code: exitCode, gates: results });
console.log(`\nConsolidated: exit=${exitCode} disposition=${exitCode === 0 ? "PASS" : exitCode === 33 ? "BLOCKED" : "FAILED"}`);
process.exit(exitCode);
