# Session 08 — Sub-Task 8: CHG-0042 Implementation and Post-Change Evidence Pack

> **Historical Bob session note:** This file records an intermediate build state. Counts and paths may predate final remediation. Use the generated baseline and post-change Evidence Packs for authoritative final results.

## Status
Completed

## Artifacts Modified

| Artifact | Change |
|---|---|
| `orderpro/rpgle/ORDPRC.rpgle` | Added `CUSCLS = 'P'` branch in `CHKORDCTF`; Preferred cutoff = 180000 |
| `orderpro/clle/FULMNT.clle` | `SCDTIME(180000)` → `SCDTIME(181500)`; comments updated |
| `orderpro/dds/CUSMAS.dds` | CUSCLS field text: "B=Business" → "P=Preferred" |
| `orderpro/sql/db2/CUSMAS.sql` | LABEL ON COLUMN CUSCLS updated |
| `orderpro/docs/operations-guide.md` | v2.4 — Preferred cutoff, updated Customer Classes and Batch sections |
| `api/src/routes/orders.js` | `cutoffHour` now branches on `CUSCLS` (P→18, else→16) |
| `api/src/adapters/mock-adapter.js` | ORDPRC fixture updated to CHG-0042 logic |
| `api/tests/orders.test.js` | Added Preferred/hour=17 (201) and Preferred/hour=19 (422) tests |
| `engine/evidence/collector.js` | Post-change IBM_I findings get TARGET_VALIDATION_REQUIRED status |
| `engine/runner.js` | Passes `pass` parameter to collector |

## Artifacts Created

| Artifact | Description |
|---|---|
| `evidence-pack/baseline/` | evidence-pack.md, evidence-pack.html, traceability.json |
| `evidence-pack/post-change/` | evidence-pack.md, evidence-pack.html, traceability.json |
| `DEMO.md` | Full narrated demo script |

## Historical Test Results

This note reflects the intermediate Bob implementation. The authoritative final results are preserved in the generated Evidence Packs and test JSON.

Post-change: 16 passing, 3 skipped (IBM_I boundary stubs — remain skipped by design).

## Historical Evidence Pack Summary

Bob initially produced noisy evidence counts before the final bounded remediation pass. Those intermediate counts are intentionally not treated as authoritative here.

For final results, see:

- `evidence-pack/baseline/evidence-pack.html`
- `evidence-pack/post-change/evidence-pack.html`
- the corresponding `traceability.json` and `test-results.json` files

## Key Decision: TARGET_VALIDATION_REQUIRED in Post-Change

RPGLE, CLLE, and Db2 DDL findings in the post-change pass carry
`TARGET_VALIDATION_REQUIRED` status because:
- evidenceBasis = OBSERVED_SOURCE (we see the source changed)
- validationTarget = IBM_I (compile/runtime confirmation requires IBM i)
- ChangeProof does not claim IBM i validation occurred
