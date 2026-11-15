import crypto from "node:crypto";

export class LexicalHashFallback {
  kind = "sha256-truncated-32";
  semantic = false;
  model_version = "v0-hash";
  async generate(text) {
    const h = crypto.createHash("sha256").update(text).digest();
    return Array.from(h.slice(0, 32)).map(b => b / 255);
  }
}

// HOLD: Implement JEPA / HF / OpenAI here when acceptance criteria and API keys are provided.
