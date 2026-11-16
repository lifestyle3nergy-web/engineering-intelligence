import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const PUBLIC_ARTIFACTS = [
  { path: "registry/repositories/repository-inventory.json", classified: true },
  { path: "registry/repositories/upstream-pins.json", classified: true },
  { path: "registry/repositories/inventory-reconciliation.json", classified: false }
];

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
function trackedFiles(root) {
  return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
    .split(/\r?\n/).filter(Boolean);
}
function privateTextTokens(record) {
  return [record.full_name, record.node_id, record.observed_sha, record.head_sha]
    .filter(value => value !== undefined && value !== null && String(value).length > 0)
    .map(String);
}

export function inspectPublication({ root, privateInventoryPath, files = trackedFiles(root) }) {
  const failures = [];
  if (!privateInventoryPath || !path.isAbsolute(privateInventoryPath)) {
    return { pass: false, failures: ["E-G06-PRIVATE-SOURCE-MISSING"] };
  }
  const privatePath = fs.existsSync(privateInventoryPath)
    ? fs.realpathSync(privateInventoryPath)
    : path.resolve(privateInventoryPath);
  if (isInside(root, privatePath)) failures.push("E-G06-PRIVATE-SOURCE-IN-REPOSITORY");
  if (!fs.existsSync(privatePath)) failures.push("E-G06-PRIVATE-SOURCE-UNAVAILABLE");

  const trackedPrivate = files.filter(file =>
    /(^|\/)([^/]*\.(private|restricted)\.json|private|restricted)(\/|$)/i.test(file)
  );
  if (trackedPrivate.length) failures.push("E-G06-TRACKED-PRIVATE-ARTIFACT");
  if (failures.length) return { pass: false, failures };

  let privateRecords;
  try {
    const parsed = JSON.parse(fs.readFileSync(privatePath, "utf8"));
    privateRecords = Array.isArray(parsed) ? parsed : parsed.records;
    if (!Array.isArray(privateRecords)) throw new Error("invalid records");
  } catch {
    return { pass: false, failures: ["E-G06-PRIVATE-SOURCE-INVALID"] };
  }

  for (const artifact of PUBLIC_ARTIFACTS) {
    const target = path.join(root, artifact.path);
    if (!fs.existsSync(target)) {
      failures.push("E-G06-PUBLIC-ARTIFACT-MISSING");
      continue;
    }
    const raw = fs.readFileSync(target, "utf8");
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { failures.push("E-G06-PUBLIC-ARTIFACT-INVALID"); continue; }

    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (artifact.classified && rows.some(row =>
      row.visibility !== "PUBLIC" || row.publication !== "PUBLIC"
    )) failures.push("E-G06-NONPUBLIC-CLASSIFICATION");

    for (const record of privateRecords) {
      if (privateTextTokens(record).some(token => raw.includes(token))) {
        failures.push("E-G06-PRIVATE-IDENTIFIER-LEAK");
        break;
      }
      if (rows.some(row => row && row.repo_id !== undefined &&
          String(row.repo_id) === String(record.repo_id))) {
        failures.push("E-G06-PRIVATE-IDENTIFIER-LEAK");
        break;
      }
    }
  }
  return { pass: failures.length === 0, failures: [...new Set(failures)] };
}

export function runPrivacyGate(root = process.cwd()) {
  const result = inspectPublication({
    root,
    privateInventoryPath: process.env.PRIVATE_INVENTORY_FILE
  });
  return {
    exit: result.pass ? 0 : 30,
    out: result.pass
      ? "public artifacts contain only approved public records"
      : result.failures.join(",")
  };
}
