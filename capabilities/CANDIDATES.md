# Capability candidates

**Status:** Wishlist. Nothing in this file is an admitted capability.
**Evidence class:** `RESEARCH_PATTERN`. Every entry is a URL or a tool name,
not executed evidence. No entry has been installed, run, or validated against
a target.
**Authority boundary:** NONE. Listing a tool here grants no capability, no
permission, and no admission. The file exists so that candidates are written
down in one place with an honest label, rather than leaking into the atlas.

Fail-closed rules for this file:

- Absence of an entry does not mean absence of capability.
- Presence of an entry does not mean approval, admission, or endorsement.
- Nothing here may be cited as `EXECUTED` or `EVIDENCE_READY`.
- Removing an entry requires a commit. Adding one does not require removal.

## 1. Network reconnaissance

| Tool | URL | Notes |
|---|---|---|
| nmap | https://www.kali.org/tools/nmap/ | Port and service discovery |
| wireshark | https://www.kali.org/tools/wireshark/ | Packet capture and analysis |
| hping3 | https://www.kali.org/tools/hping3/ | Custom TCP/IP packet crafting |

## 2. Web application testing

| Tool | URL | Notes |
|---|---|---|
| sqlmap | https://www.kali.org/tools/sqlmap/ | SQL injection detection |
| skipfish | https://www.kali.org/tools/skipfish/ | Web application security scanner |

## 3. Wireless

| Tool | URL | Notes |
|---|---|---|
| aircrack-ng | https://www.kali.org/tools/aircrack-ng/ | Wireless network auditing |

## 4. Password and credential testing

| Tool | URL | Notes |
|---|---|---|
| hashcat | https://www.kali.org/tools/hashcat/ | GPU-accelerated hash recovery |
| john | https://www.kali.org/tools/john/ | John the Ripper |

## 5. Forensics

| Tool | URL | Notes |
|---|---|---|
| foremost | https://www.kali.org/tools/foremost/ | File carving and data recovery |

## 6. Exploitation and social engineering

| Tool | URL | Notes |
|---|---|---|
| metasploitmcp | https://www.kali.org/tools/metasploitmcp/ | Metasploit MCP interface |
| Kali social engineering toolkit | https://www.kali.org/tools/kali-meta/#kali-tools-social-engineering | SET metapackage |

## 7. Agent and skill catalogues

| Item | URL | Notes |
|---|---|---|
| skillsmp.com | https://skillsmp.com | Agent skill catalogue. Content not inspected. Treat as `RESEARCH_PATTERN` only. |

## 8. Installation and tooling references

These are not capabilities. They are install references that belong in an
ADR or a build document, not in the atlas. Listed here so the reference is
recorded and not lost.

| Item | URL | Where it belongs |
|---|---|---|
| PostgreSQL on Ubuntu | https://www.postgresql.org/download/linux/ubuntu/ | ADR for any future Postgres-backed service |
| MkDocs | https://github.com/mkdocs/mkdocs | ADR if MkDocs replaces the current pandoc pipeline |
| langfuse (PyPI) | https://pypi.org/project/langfuse/ | ADR for LLM observability tooling |

## 9. Out of scope for this file

The following do not belong here and should be added only against a real
CapabilityRecord schema, once that exists:

- OSINT collectors (amass, theHarvester, SpiderFoot, pywb, ReplayWeb.page,
  Common Crawl, GDELT) — the schema does not exist yet
- Agent and coding tools (aider, aider-mcp-server, Codex, SGLang, smolcc) —
  identity of several is unconfirmed; do not list until pinned
- Lineage, telemetry, orchestration (OpenLineage, OpenTelemetry, Temporal) —
  candidates for the reference catalogue, not this one

## Revision history

- 2026-10-07 — Initial candidates file. No entry has been installed, run, or
  validated. Evidence class `RESEARCH_PATTERN` throughout.
