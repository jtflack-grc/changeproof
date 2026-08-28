# Reuse Proof: REPORT-GW Timeout Service

This example exists for one reason: **to prove that ChangeProof is not an ORDERPRO-specific IBM i collision detector.**

REPORT-GW is a deliberately small modern Node.js workload. It uses the same reusable ChangeProof evidence core, Finding model, analyzer dispatch, Jest-receipt ingestion, diff logic, and evidence semantics as ORDERPRO. The workload contributes only:

- a profile defining which files belong to the workload,
- a small inference plug-in describing one domain relationship,
- the change request and fixture states.

No ORDERPRO source, IBM i adapter, RPGLE, CLLE, DDS, Db2, or 5250 surface is involved.

## Change request

`CHG-WEB-017` asks for one small change: increase the application request timeout from **30 seconds to 60 seconds**.

The ticket does not mention the upstream edge proxy.

## Three states

| State | App timeout | Proxy timeout | Functional test | ChangeProof conclusion |
|---|---:|---:|---|---|
| `baseline` | 30s | 45s | FAIL | Requested behavior not implemented |
| `literal` | 60s | 45s | PASS | **OPEN inferred upstream timeout mismatch** |
| `post-change` | 60s | 75s | PASS | Inferred mismatch removed |

The important middle state mirrors the ORDERPRO lesson without sharing its technology stack: **the stated acceptance criterion passes, while the broader change still has an unresolved consequence.**

## Run it

From the repository root:

```bash
node engine/profile-runner.js --profile examples/timeout-service/changeproof.profile.js --pass baseline
node engine/profile-runner.js --profile examples/timeout-service/changeproof.profile.js --pass literal
node engine/profile-runner.js --profile examples/timeout-service/changeproof.profile.js --pass post-change
```

Or run all three through:

```bash
npm run reuse-proof
```

Generated artifacts land under:

```text
examples/timeout-service/evidence-pack/
  baseline/
  literal/
  post-change/
```

Each pass emits:

- `traceability.json`
- `test-results.json`
- `evidence-pack.md`
- `evidence-pack.html`
- `summary.json`

## Why this matters

The scenario is synthetic. That is intentional and makes the demonstration safe and reproducible. The important claim is falsifiable: the same evidence core processes two materially different workloads.

Change or remove the proxy timeout, change the application timeout, remove the inference plug-in, or break the scoped test receipt and the generated evidence changes accordingly. The browser presentation is not the source of truth; the generated evidence artifacts are.
