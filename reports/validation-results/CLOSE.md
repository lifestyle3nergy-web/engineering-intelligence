# Session Close Artifact
Generated: 2026-11-04T09:35:15Z

## 1. Actual PR Chain
- ei-registry-001/m02-m05-milestones → main
- ei-registry-001/m06-divergence → ei-registry-001/m02-m05-milestones (distance: 4)
- ei-registry-001/m07-remediation → ei-registry-001/m06-divergence (distance: 7)
- ei-registry-001/m07.1-race-fix → ei-registry-001/m07-remediation (distance: 7)
- ei-registry-001/m07.3-compare-fix → ei-registry-001/m07.1-race-fix (distance: 4)
- ei-registry-001/m07.5-adr-lint → ei-registry-001/m07.3-compare-fix (distance: 4)

## 2. Gate Count (parsed)
Total Gates: 10
IDs: G01, G02, G03, G04, G05, G06, G07, G08, G09, G10

## 3. Signature Verification
| SHA | Verified | Reason | Subject |
|---|---|---|---|
| 74a5f11 | True | valid | fix(scripts): overwrite CLOSE.md instead |
| 882efa4 | True | valid | feat(scripts): close-report generates CL |
| 771a0d3 | True | valid | feat(scripts): generate CLOSE.md via par |
| ab7b076 | True | valid | fix(governance): close review R1, R9 and |
| 43259d0 | True | valid | docs(lessons): L-RACE-002-VALIDATED + L- |
| 51465e4 | True | valid | fix(pipeline): M07.3 FINAL — L-RACE-002  |
| 3ea8984 | True | valid | docs(lessons): L-RACE-002-VALIDATED — /c |
| 56f586a | True | valid | fix(pipeline): M07.3 — fetch fork HEAD v |
| 89e49be | True | valid | docs(lessons): refine L-RACE-002 — /comp |
| 64b2bbe | True | valid | chore(m07.2): record docs enrichment aft |
| 339d482 | True | valid | docs(lessons): L-RACE-002 — per-endpoint |
| 70670aa | True | valid | chore(m07.2): capture docs fork sync (po |
| 256d37e | True | valid | fix(pipeline): M07.1 REDO — actually add |
| 9860e20 | True | valid | docs(lessons): L-SHELL-CHAIN-001 — hered |
| 3f9b4f2 | True | valid | fix(pipeline): M07.1 — poll propagation  |
| 843e5a0 | True | valid | docs(registry): M07 boundary — explicit  |
| 70865b9 | True | valid | fix(lessons): restore 9 + add L-SYNC-COM |
| 1e9737a | True | valid | docs(lessons): L-SYNC-COMPARE-001 |
| 20c1e1b | True | valid | chore(remediation): alacritty sync proof |
| 5135308 | True | valid | chore(registry): checkpoint enrichment b |
| 3cda6d1 | True | valid | fix(pipeline): M07 comparison logic and  |
| e60568b | True | valid | feat(pipeline): M07 remediation script a |
| e2aca8f | True | valid | chore(registry): complete M06 boundary c |
| 8b85e88 | True | valid | docs(registry): M06 boundary and gitigno |
| 2657ef4 | True | valid | chore(registry): reconcile divergence af |
| e628f69 | True | valid | feat(registry): M06 — upstream fork dive |
| 2b152a3 | True | valid | feat(registry): M02-M05 milestones |
| 56df47c | True | valid | feat(ei-registry): UDXR v1.3.2 safe slic |

## 4. R6 Conflict Magnitude
### ei-registry-001/m07.5-adr-lint
```
 governance/adr-registry.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```
