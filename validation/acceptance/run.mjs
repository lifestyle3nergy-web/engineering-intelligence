#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeEnvelope } from "../envelope.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const EXCLUDE = new Set([".git", ".DS_Store", "node_modules", ".cache", "coverage"]);

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
  { id: "G01", name: "tree-digest",
    run() {
      const files = walk(".");
      const digest = crypto.createHash("sha256").update(files.join("\n")).digest("hex");
      const expected = process.env.EXPECTED_TREE_DIGEST;
      if (!expected) return { exit: 31, out: `files=${files.length} digest=${digest}` };
      return { exit: digest === expected ? 0 : 30, out: `files=${files.length} digest=${digest}` };
    }
  },
  { id: "G02", name: "schemas-loaded",
    run() {
      const dirs = ["contracts/bases", "contracts/manifests"].filter(d => fs.existsSync(d));
      let n = 0;
      for (const d of dirs) for (const f of fs.readdirSync(d)) {
        if (!f.endsWith(".json")) continue;
        if (!JSON.parse(fs.readFileSync(`${d}/${f}`, "utf8")).$id) return { exit: 30, out: `E_NO_ID ${f}` };
        n++;
      }
      return { exit: n > 0 ? 0 : 32, out: `schemas=${n}` };
    }
  },
  { id: "G03", name: "canonical-vs-bytes",
    run() {
      const inv = JSON.parse(fs.readFileSync("registry/repositories/repository-inventory.json", "utf8"));
      const pins = JSON.parse(fs.readFileSync("registry/repositories/upstream-pins.json", "utf8"));
      if (inv.length !== pins.length) return { exit: 30, out: `Count mismatch: inv=${inv.length} pins=${pins.length}` };
      for (const p of pins) {
        if (!p.head_sha || !p.head_sha.match(/^[0-9a-f]{40}$/)) {
          return { exit: 30, out: `E-P04-SHA-MISMATCH: ${p.full_name} has invalid SHA` };
        }
      }
      return { exit: 0, out: `verified ${pins.length} pins` };
    }
  },
  { id: "G04", name: "fixtures",
    run() {
      let count = 0;
      const dirs = ["fixtures/repositories", "fixtures/adr"];
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        (function walkFix(d) {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = `${d}/${e.name}`;
            if (e.isDirectory()) walkFix(p);
            else if (p.endsWith(".json")) {
              const f = JSON.parse(fs.readFileSync(p, "utf8"));
              if (!f.fixture_id || !f.expected_outcome) return { exit: 30, out: `Invalid fixture: ${p}` };
              if (f.expected_outcome === "REJECT" && !f.expected_rejection_code) return { exit: 30, out: `Missing code: ${p}` };
              count++;
            }
          }
        })(dir);
      }
      return { exit: count > 0 ? 0 : 32, out: `loaded ${count} fixtures` };
    }
  },
  { id: "G05", name: "catalog-content",
    run() {
      const p = "registry/adr/adr-catalog.json";
      if (!fs.existsSync(p)) return { exit: 30, out: "E_CATALOG_MISSING" };
      const raw = fs.readFileSync(p, "utf8");
      if (!raw.trim()) return { exit: 30, out: "E_CATALOG_EMPTY (0 bytes)" };
      let cat;
      try { cat = JSON.parse(raw); } catch (e) { return { exit: 30, out: "E_CATALOG_INVALID_JSON: " + e.message.slice(0,80) }; }
      if (!Array.isArray(cat)) return { exit: 30, out: "E_CATALOG_NOT_ARRAY" };
      if (cat.length === 0) return { exit: 30, out: "E_CATALOG_EMPTY" };
      if (cat.some(r => r.adr_id === "ADR-0033")) return { exit: 30, out: "E_ADR_0033_PRESENT" };
      for (const r of cat) {
        if (!r.allocation || !r.decision) return { exit: 30, out: "E_CATALOG_SHAPE " + r.adr_id };
      }
      return { exit: 0, out: "catalog_records=" + cat.length + " adr_0033=absent" };
    }
  }
];

const results = GATES.map(g => {
  const r = g.run();
  console.log(`[${g.id}] ${g.name}: ${r.exit === 0 ? "PASS" : "FAIL"} ${r.out}`);
  return { id: g.id, state: r.exit === 0 ? "PASS" : "FAIL", out: r.out };
});

const exitCode = results.every(r => r.state === "PASS") ? 0 : 30;
await writeEnvelope("A00", { exit_code: exitCode, gates: results });
process.exit(exitCode);
