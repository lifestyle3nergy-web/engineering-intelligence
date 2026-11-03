#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
const inv = JSON.parse(fs.readFileSync("registry/repositories/repository-inventory.json", "utf8"));
const pins = [];
for (const r of inv) {
  const [owner, name] = r.full_name.split("/");
  try {
    const meta = JSON.parse(execSync(
      `gh api repos/${owner}/${name}`, { encoding: "utf8" }));
    const head = JSON.parse(execSync(
      `gh api repos/${owner}/${name}/commits/HEAD`, { encoding: "utf8" }));
    pins.push({
      repo_id: meta.id,
      full_name: meta.full_name,
      visibility: meta.private ? "PRIVATE" : "PUBLIC",
      default_branch: meta.default_branch,
      head_sha: head.sha,
      fork: meta.fork,
      parent_full_name: meta.parent?.full_name ?? null,
      parent_id: meta.parent?.id ?? null,
      observed_at: new Date().toISOString()
    });
  } catch (e) {
    pins.push({ full_name: r.full_name, visibility: r.visibility, error: String(e).slice(0, 200) });
  }
}
fs.mkdirSync("registry/repositories", { recursive: true });
fs.writeFileSync("registry/repositories/upstream-pins.json", JSON.stringify(pins, null, 2));
fs.writeFileSync("registry/repositories/upstream-pins.private.json",
  JSON.stringify(pins.filter(p => p.visibility === "PRIVATE"), null, 2));
console.log(`pinned ${pins.length} repos; private=${pins.filter(p=>p.visibility==="PRIVATE").length}`);
