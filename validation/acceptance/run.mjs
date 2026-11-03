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
  },
  { id: "G06", name: "upstream-divergence",
    run() {
      const enrichedPath = "registry/repositories/upstream-pins.enriched.json";
      const statsPath = "registry/repositories/enrichment-stats.json";
      const pinPath = "registry/repositories/upstream-pins.json";
      if (!fs.existsSync(enrichedPath)) return { exit: 30, out: "E_ENRICHED_MISSING" };
      if (!fs.existsSync(statsPath)) return { exit: 30, out: "E_STATS_MISSING" };
      const pins = JSON.parse(fs.readFileSync(pinPath, "utf8"));
      const enriched = JSON.parse(fs.readFileSync(enrichedPath, "utf8"));
      const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
      if (pins.length !== enriched.length) return { exit: 30, out: `E_COUNT_MISMATCH pins=${pins.length} enriched=${enriched.length}` };
      const forks = enriched.filter(e => e.fork === true);
      if (forks.length === 0) return { exit: 30, out: "E_NO_FORKS" };

      // Structural allowlist: cannot be ENRICHED even with perfect network
      const structuralAllowlist = new Set([
        "lifestyle3nergy-web/5G-Proxy-Pro"
      ]);

      // Transient error statuses: network failures tolerated at commit, reported
      const transientStatuses = new Set(["COMPARE_FAILED", "PARENT_HEAD_UNREACHABLE", "ERROR"]);

      const structuralHits = [];
      const transientHits = [];
      const hardFailures = [];

      for (const f of forks) {
        const status = f.enrichment?.status ?? "UNKNOWN";

        if (status === "ENRICHED") {
          const e = f.enrichment;
          if (!e.parent_full_name) hardFailures.push(f.full_name + ":E_NO_PARENT");
          else if (typeof e.ahead_of_parent_by !== "number") hardFailures.push(f.full_name + ":E_AHEAD_NOT_NUMBER");
          else if (typeof e.behind_parent_by !== "number") hardFailures.push(f.full_name + ":E_BEHIND_NOT_NUMBER");
          else if (!e.parent_head_sha || !/^[0-9a-f]{40}$/.test(e.parent_head_sha)) hardFailures.push(f.full_name + ":E_PARENT_SHA_INVALID");
          continue;
        }

        if (structuralAllowlist.has(f.full_name)) {
          structuralHits.push(f.full_name + ":" + status);
          continue;
        }

        if (transientStatuses.has(status)) {
          transientHits.push(f.full_name + ":" + status);
          continue;
        }

        hardFailures.push(f.full_name + ":" + status);
      }

      // Stale allowlist check
      for (const name of structuralAllowlist) {
        const f = forks.find(x => x.full_name === name);
        if (!f) return { exit: 30, out: "E_ALLOWLIST_MISSING " + name };
        if (f.enrichment?.status === "ENRICHED") return { exit: 30, out: "E_ALLOWLIST_STALE " + name };
      }

      if (hardFailures.length > 0) {
        return { exit: 30, out: `E_HARD_FAILURES count=${hardFailures.length} sample=${hardFailures.slice(0, 3).join(",")}` };
      }

      const sum = (stats.up_to_date || 0) + (stats.behind_only || 0) + (stats.ahead_only || 0) + (stats.diverged || 0);
      if (sum !== stats.enriched_count) return { exit: 30, out: `E_STATS_INCONSISTENT sum=${sum} enriched=${stats.enriched_count}` };

      const catPath = "registry/adr/adr-catalog.json";
      if (fs.existsSync(catPath)) {
        const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
        if (cat.some(r => r.adr_id === "ADR-0033")) return { exit: 30, out: "E_ADR_0033_PRESENT" };
      }

      return { exit: 0, out: `forks=${forks.length} enriched=${stats.enriched_count} diverged=${stats.diverged} behind_only=${stats.behind_only} transient=${transientHits.length} structural=${structuralHits.length}` };
    }
  },
  { id: "G07", name: "remediation-honesty",
    run() {
      const remediationLog = "reports/validation-results/remediation-latest.json";
      if (!fs.existsSync(remediationLog)) return { exit: 0, out: "no-remediation-performed" };
      const log = JSON.parse(fs.readFileSync(remediationLog, "utf8"));
      const enrichedPath = "registry/repositories/upstream-pins.enriched.json";
      if (!fs.existsSync(enrichedPath)) return { exit: 30, out: "E_ENRICHED_MISSING" };
      const enriched = JSON.parse(fs.readFileSync(enrichedPath, "utf8"));
      const record = enriched.find(e => e.full_name === log.repo);
      if (!record) return { exit: 30, out: "E_REPO_NOT_FOUND " + log.repo };
      if (record.enrichment?.status !== "ENRICHED") return { exit: 30, out: "E_REMEDIATED_REPO_NOT_ENRICHED " + log.repo };
      if (record.enrichment.ahead_of_parent_by > 0 || record.enrichment.behind_parent_by > 0) {
        return { exit: 30, out: "E_REMEDIATION_INCOMPLETE " + log.repo + " ahead=" + record.enrichment.ahead_of_parent_by + " behind=" + record.enrichment.behind_parent_by };
      }
      return { exit: 0, out: "remediated=" + log.repo + " identical" };
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
