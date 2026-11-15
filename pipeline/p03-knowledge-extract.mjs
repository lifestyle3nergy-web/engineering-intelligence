#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CHUNK = 1000;
const OUT = "registry/knowledge-index.json";
const CACHE_DIR = ".cache/embed";
fs.mkdirSync(CACHE_DIR, { recursive: true });

// Fallback provider — explicitly NOT semantic. Never claims confidence.
class LexicalHashFallback {
  kind = "sha256-truncated-32";
  semantic = false;
  model_version = "v0-hash";
  async generate(text) {
    const h = crypto.createHash("sha256").update(text).digest();
    return Array.from(h.slice(0, 32)).map(b => b / 255);
  }
}

function cacheKey(sha, provider) {
  return path.join(CACHE_DIR, `${sha}-${provider.model_version}.json`);
}

async function embed(provider, text, sha) {
  const key = cacheKey(sha, provider);
  if (fs.existsSync(key)) return { ...JSON.parse(fs.readFileSync(key, "utf8")), cached: true };
  const vec = await provider.generate(text);
  const rec = { embedding: vec, embedding_kind: provider.kind, semantic: provider.semantic,
                model_version: provider.model_version };
  fs.writeFileSync(key, JSON.stringify(rec));
  return { ...rec, cached: false };
}

function chunk(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK) {
    const c = text.slice(i, i + CHUNK);
    chunks.push({
      chunk_index: chunks.length,
      chunk_offset: i,
      chunk_sha: crypto.createHash("sha256").update(c).digest("hex"),
      text: c
    });
  }
  return chunks;
}

const provider = new LexicalHashFallback();
const targets = process.argv.slice(2);
const index = [];

for (const file of targets) {
  if (!fs.existsSync(file)) { console.error(`SKIP missing ${file}`); continue; }
  const content = fs.readFileSync(file, "utf8");
  const sha = crypto.createHash("sha256").update(content).digest("hex");
  for (const c of chunk(content)) {
    const e = await embed(provider, c.text, c.chunk_sha);
    index.push({
      uid: `lifestyle3nergy:doc:${path.basename(file)}@1.0.0#chunk${c.chunk_index}`,
      source_path: file,
      source_sha: sha,
      parent_sha: sha,
      chunk_index: c.chunk_index,
      chunk_offset: c.chunk_offset,
      chunk_sha: c.chunk_sha,
      text: c.text,
      embedding: e.embedding,
      embedding_kind: e.embedding_kind,
      semantic: e.semantic,
      model_version: e.model_version,
      cached: e.cached
    });
  }
}
fs.mkdirSync("registry", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(index, null, 2));
console.log(`wrote ${index.length} chunks to ${OUT} (semantic=false; hash fallback)`);
