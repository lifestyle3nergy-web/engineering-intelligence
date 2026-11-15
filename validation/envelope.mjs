import fs from "node:fs";
import path from "node:path";
export async function writeEnvelope(phase, payload, outDir = "reports/validation-results") {
  fs.mkdirSync(outDir, { recursive: true });
  const env = {
    phase,
    at: new Date().toISOString(),
    target_sha: process.env.TARGET_SHA ?? null,
    ...payload,
    // state is explicit — no SKIPPED masquerading as PASS
    state: payload.state ?? (payload.exit_code === 0 ? "PASS" : "BLOCKED"),
    disposition: payload.exit_code === 0 ? "PASS" : "FAILED"
  };
  const out = path.join(outDir, `${phase}.json`);
  fs.writeFileSync(out, JSON.stringify(env, null, 2));
  return out;
}
