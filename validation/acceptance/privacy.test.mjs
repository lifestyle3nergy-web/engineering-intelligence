import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectPublication } from "./g06-publication-privacy.mjs";

function setup(records = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ei-privacy-repo-"));
  const privateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ei-privacy-private-"));
  const privateInventoryPath = path.join(privateRoot, "inventory.json");
  fs.writeFileSync(privateInventoryPath, JSON.stringify({ records }));
  fs.mkdirSync(path.join(root, "registry/repositories"), { recursive: true });
  const clean = [{ repo_id: 10, full_name: "public/example", visibility: "PUBLIC", publication: "PUBLIC", observed_sha: "a".repeat(40) }];
  for (const file of ["repository-inventory.json", "upstream-pins.json", "inventory-reconciliation.json"]) {
    fs.writeFileSync(path.join(root, "registry/repositories", file), JSON.stringify(clean));
  }
  return { root, privateInventoryPath };
}

test("accepts public artifacts when private tokens are absent", () => {
  const env = setup([{ repo_id: 99, full_name: "private/synthetic", visibility: "PRIVATE", observed_sha: "b".repeat(40) }]);
  const result = inspectPublication({ ...env, files: ["pipeline/p00-populate-inventory.mjs"] });
  assert.equal(result.pass, true);
});

for (const [field, value] of [
  ["full_name", "private/synthetic"],
  ["repo_id", 99],
  ["observed_sha", "b".repeat(40)]
]) {
  test("rejects private " + field + " leakage", () => {
    const env = setup([{ repo_id: 99, full_name: "private/synthetic", visibility: "PRIVATE", observed_sha: "b".repeat(40) }]);
    const target = path.join(env.root, "registry/repositories/upstream-pins.json");
    const rows = JSON.parse(fs.readFileSync(target, "utf8"));
    rows.push({ visibility: "PUBLIC", publication: "PUBLIC", [field]: value });
    fs.writeFileSync(target, JSON.stringify(rows));
    const result = inspectPublication({ ...env, files: [] });
    assert.equal(result.pass, false);
    assert.ok(result.failures.includes("E-G06-PRIVATE-IDENTIFIER-LEAK"));
  });
}

test("rejects tracked private artifacts", () => {
  const env = setup([]);
  const result = inspectPublication({ ...env, files: ["registry/repositories/repository-inventory.private.json"] });
  assert.ok(result.failures.includes("E-G06-TRACKED-PRIVATE-ARTIFACT"));
});

test("rejects unknown or non-public publication classification", () => {
  const env = setup([]);
  fs.writeFileSync(path.join(env.root, "registry/repositories/repository-inventory.json"), JSON.stringify([{ visibility: "UNKNOWN", publication: "PUBLIC" }]));
  const result = inspectPublication({ ...env, files: [] });
  assert.ok(result.failures.includes("E-G06-NONPUBLIC-CLASSIFICATION"));
});
