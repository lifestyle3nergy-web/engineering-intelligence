#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeEnvelope } from "../envelope.mjs";
import { runPrivacyGate } from "./g06-publication-privacy.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
process.chdir(HERE);
const EXCLUDE = new Set([".git", ".DS_Store", "node_modules", ".cache", "coverage"]);

function walk(root) {
  const out = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (EXCLUDE.has(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) out.push(file);
    }
  }
  visit(root);
  return out.sort();
}

function treeDigest(files) {
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const relative = path.relative(HERE, file).split(path.sep).join("/");
    hash.update(relative + "\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function validateFixtures() {
  let count = 0;
  const dirs = ["fixtures/repositories", "fixtures/adr", "fixtures/privacy"];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && file.endsWith(".json")) {
        const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
        if (!fixture.fixture_id || !fixture.expected_outcome) {
          throw new Error("E-G04-FIXTURE-SHAPE");
        }
        if (fixture.expected_outcome === "REJECT" && !fixture.expected_rejection_code) {
          throw new Error("E-G04-REJECTION-CODE");
        }
        count++;
      }
    }
  }
  for (const directory of dirs) if (fs.existsSync(directory)) visit(directory);
  if (count === 0) throw new Error("E-G04-NO-FIXTURES");
  return count;
}

const GATES = [
  { id: "G01", name: "tree-content-digest", run() {
    const files = walk(HERE);
    const digest = treeDigest(files);
    const expected = process.env.EXPECTED_TREE_DIGEST;
    if (!expected) return { exit: 31, out: "E-G01-EXPECTED-DIGEST-MISSING files=" + files.length + " digest=" + digest };
    return { exit: digest === expected ? 0 : 30, out: "files=" + files.length + " digest=" + digest };
  }},
  { id: "G02", name: "schemas-loaded", run() {
    const dirs = ["contracts/bases", "contracts/manifests"].filter(d => fs.existsSync(d));
    let count = 0;
    for (const directory of dirs) for (const file of fs.readdirSync(directory)) {
      if (!file.endsWith(".json")) continue;
      const schema = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
      if (!schema.$id) return { exit: 30, out: "E-G02-SCHEMA-ID-MISSING" };
      count++;
    }
    return { exit: count > 0 ? 0 : 32, out: "schemas=" + count };
  }},
  { id: "G03", name: "canonical-vs-bytes", run() {
    const inventory = JSON.parse(fs.readFileSync("registry/repositories/repository-inventory.json", "utf8"));
    const pins = JSON.parse(fs.readFileSync("registry/repositories/upstream-pins.json", "utf8"));
    if (inventory.length !== pins.length) return { exit: 30, out: "E-G03-COUNT-MISMATCH" };
    const pinKeys = new Set(pins.map(pin => pin.full_name));
    for (const record of inventory) {
      if (record.visibility !== "PUBLIC" || record.publication !== "PUBLIC" || !pinKeys.has(record.full_name)) {
        return { exit: 30, out: "E-G03-PUBLICATION-OR-IDENTITY-MISMATCH" };
      }
    }
    for (const pin of pins) {
      if (pin.visibility !== "PUBLIC" || pin.publication !== "PUBLIC" || !/^[0-9a-f]{40}$/.test(pin.head_sha || "")) {
        return { exit: 30, out: "E-G03-PIN-INVALID" };
      }
    }
    return { exit: 0, out: "verified public inventory and " + pins.length + " pins" };
  }},
  { id: "G04", name: "fixtures", run() {
    try { return { exit: 0, out: "loaded " + validateFixtures() + " fixtures" }; }
    catch (error) { return { exit: 30, out: error.message.startsWith("E-G04-") ? error.message : "E-G04-FIXTURE-INVALID" }; }
  }},
  { id: "G05", name: "catalog-content", run() {
    const file = "registry/adr/adr-catalog.json";
    if (!fs.existsSync(file)) return { exit: 30, out: "E-CATALOG-MISSING" };
    let catalog;
    try { catalog = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch { return { exit: 30, out: "E-CATALOG-INVALID-JSON" }; }
    if (!Array.isArray(catalog) || catalog.length === 0) return { exit: 30, out: "E-CATALOG-EMPTY-OR-NOT-ARRAY" };
    if (catalog.some(record => record.adr_id === "ADR-0033")) return { exit: 30, out: "E-ADR-0033-PRESENT" };
    if (catalog.some(record => !record.allocation || !record.decision)) return { exit: 30, out: "E-CATALOG-SHAPE" };
    return { exit: 0, out: "catalog_records=" + catalog.length };
  }},
  { id: "G06", name: "publication-privacy", run() { return runPrivacyGate(HERE); }}
];

const results = GATES.map(gate => {
  const result = gate.run();
  console.log("[" + gate.id + "] " + gate.name + ": " + (result.exit === 0 ? "PASS" : "FAIL") + " " + result.out);
  return { id: gate.id, state: result.exit === 0 ? "PASS" : "FAIL", out: result.out };
});
const exitCode = results.every(result => result.state === "PASS") ? 0 : 30;
await writeEnvelope("A00", { exit_code: exitCode, gates: results });
process.exit(exitCode);
