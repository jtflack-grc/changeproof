# ChangeProof

**AI can write the change. ChangeProof proves what deserves to ship.**

> **[Open the live ChangeProof experience →](https://jtflack-grc.github.io/changeproof/)**  
> Run the synthetic workload, inspect the actual evidence behind the release decision, then verify that the same evidence core works on an unrelated second workload.
>
> **[Launch ORDERPRO directly →](https://jtflack-grc.github.io/changeproof/orderpro/app/)**

ChangeProof is an evidence-producing maintenance workflow built for the **IBM TechXchange 2026 Pre-conference Dev Day Hackathon**. It is designed for developers working in unfamiliar applications and reviewers deciding whether a change is ready to advance toward release.

**ORDERPRO is the primary demonstration workload. It is not the product.**

The reusable product surface is the ChangeProof evidence pipeline: change request → scoped source/document discovery → available execution receipts → cross-artifact inference → machine-readable traceability → reviewer decision → residual validation boundary.

---

## Primary workload: ORDERPRO / CHG-0042

> Preferred customers (`CUSCLS = 'P'`) may submit expedited orders until 6:00 PM instead of the standard 4:00 PM cutoff.

ORDERPRO is intentionally brownfield and polyglot: RPGLE, CLLE, DDS, Db2 for i DDL, Node.js/Express, Jest, a local SQLite surrogate, and operations documentation.

The ticket looks small. The surrounding change is not.

The preserved baseline contains `SCDTIME(180000)` in `FULMNT.clle`, the same boundary introduced by the requested Preferred-customer cutoff. ChangeProof correlated those observations and produced this preserved finding:

```text
id: inferred-fulmnt-batch-window-collision
evidenceBasis: INFERRED
status: OPEN
validationTarget: IBM_I
symbol: SCDTIME(180000)
```

The final source keeps Preferred customers at 18:00, Standard customers at 16:00, and moves the CL schedule literal to `SCDTIME(181500)`.

### ORDERPRO evidence state

| | Preserved baseline | Current post-change |
|---|---:|---:|
| Passing tests | **14** | **16** |
| Failing tests | **2** | **0** |
| IBM i target-only skips | **3** | **3** |
| Machine-readable findings | **65** | **86** |
| Human-facing Blast Radius rows | **12** | **11** |
| Resolved findings | **14** | **56** |
| Target validation required | **3** | **30** |

The current post-change pack is regenerated and verified by CI against the submitted working tree. The historical baseline remains intentionally preserved because the repository itself is left in the final post-change state.

---

## ChangeProof Review Workspace

The public Review Workspace is the primary product demonstration.

At runtime it loads eight real repository artifacts:

```text
evidence-pack/baseline/traceability.json
evidence-pack/post-change/traceability.json
evidence-pack/baseline/test-results.json
evidence-pack/post-change/test-results.json
CHANGE_REQUEST.md
orderpro/rpgle/ORDPRC.rpgle
orderpro/clle/FULMNT.clle
engine/evidence/collector.js
```

It reconstructs the review path:

```text
CHG-0042
   ↓
baseline execution receipt
Preferred / expedited / 17:00 → FAIL
   +
preserved machine finding
inferred-fulmnt-batch-window-collision
   ↓
submitted inference implementation
inferBatchWindowCollision()
   ↓
review decision
functional acceptance may pass / release remains HOLD
   ↓
submitted RPG + CL remediation
   ↓
post-change execution receipt
same targeted acceptance check → PASS
   ↓
residual IBM i validation boundary
```

Every evidence node is inspectable. The drawer exposes the evidence ID, artifact, line reference, evidence basis, status, validation target, finding text, raw machine record, and the underlying source/test artifact.

The viewer deliberately fails closed:

> **NO EVIDENCE → NO CHAIN**

If required repository evidence cannot be fetched or an expected record cannot be resolved, ChangeProof does not substitute a canned lineage.

The original baseline collector did not persist explicit parent IDs for the collision inference; it stored the detected schedule literal and cross-artifact conclusion in the same INFERRED record. The Review Workspace preserves that limitation rather than retroactively inventing provenance.

---

## Independent reuse proof: REPORT-GW / CHG-WEB-017

A second workload exists specifically to answer two obvious objections:

- “This is hard-coded to ORDERPRO or IBM i.”
- “The synthetic problem was conveniently designed around the solution.”

REPORT-GW contains **no RPGLE, CLLE, DDS, Db2, 5250 surface, ORDERPRO adapter, or IBM i dependency**. It is deliberately boring: Node.js source, an edge-proxy configuration file, a Markdown runbook, and scoped Jest tests.

Its request is:

> Increase the application request timeout from 30 seconds to 60 seconds.

The ticket does not request a proxy change.

| State | App timeout | Proxy timeout | Scoped Jest | ChangeProof result |
|---|---:|---:|---:|---|
| `baseline` | 30s | 45s | **1 pass / 1 fail** | requested behavior missing |
| `literal` | 60s | 45s | **2 pass / 0 fail** | **INFERRED / OPEN** upstream mismatch |
| `post-change` | 60s | 75s | **2 pass / 0 fail** | mismatch removed |

The literal state produces an independent machine finding:

```text
id: inferred-upstream-timeout-ordering
artifact: config/edge-proxy.conf
lineRef: config/edge-proxy.conf:2
evidenceBasis: INFERRED
status: OPEN
validationTarget: LOCAL
symbol: proxy(45) < app(60)
```

The acceptance criterion passes, but the upstream proxy can still terminate the request before the application timeout is reached. After the proxy is moved to 75 seconds, the finding disappears.

That result is generated by the **same workload-neutral evidence core** used underneath ORDERPRO. REPORT-GW contributes only a workload profile and a small domain inference plug-in.

Common implementation:

```text
engine/evidence/core.js
engine/evidence/model.js
engine/evidence/diff.js
engine/profile-runner.js
engine/reporters/profile-pack.js
```

Profile-specific implementation:

```text
examples/timeout-service/changeproof.profile.js
examples/timeout-service/inference.js
```

The public Reuse Proof section loads the generated REPORT-GW receipts from the repository at runtime. It also fails closed: missing or inconsistent generated receipts mean **no reuse claim**.

---

## CI evidence freeze

`.github/workflows/reuse-proof.yml` provides an independent machine gate on GitHub-hosted Actions.

It:

1. syntax-checks the reusable evidence/profile implementation;
2. runs the authoritative ORDERPRO test gate (`16 passed / 3 skipped`);
3. regenerates current ORDERPRO post-change evidence and asserts **86 findings / 56 resolved / 30 target-validation-required / 16-0-3 tests**;
4. generates REPORT-GW baseline, literal, and post-change evidence;
5. asserts the REPORT-GW literal state has **2 passing tests plus `INFERRED / OPEN / LOCAL` timeout mismatch**;
6. asserts the remediated REPORT-GW state has **2 passing tests and no mismatch**;
7. commits the generated current evidence receipts using `github-actions[bot]`.

The evidence-freeze commit is therefore machine-produced rather than a hand-edited set of favorable JSON files.

The reuse claim is falsifiable: change the source, tests, config, profile, or inference rule and the resulting evidence changes.

---

## Evidence semantics

ChangeProof keeps three questions separate.

### `evidenceBasis` — How do we know?

- `EXECUTED_LOCAL` — established by code/checks that actually ran locally.
- `OBSERVED_SOURCE` — directly present in source, configuration, tests, or documentation.
- `INFERRED` — derived by reasoning across observations.

### `status` — What is its remediation state?

- `OPEN`
- `RESOLVED`
- `TARGET_VALIDATION_REQUIRED`

### `validationTarget` — Where must final validation occur?

- `LOCAL`
- `IBM_I`

An RPGLE or CLLE source edit can therefore be observed without being presented as proof that it compiled or executed on IBM i.

---

## Interactive ORDERPRO workload

The GitHub Pages experience includes an enterprise ERP/BASIS-inspired ORDERPRO workbench with three scenario states:

1. **Current production** — Preferred expedited @17:00 fails the requested acceptance behavior.
2. **Ticket applied literally** — the same order passes, but release stays **HOLD** because preserved baseline evidence contains `SCDTIME(180000)`.
3. **ChangeProof remediation** — functional behavior still passes, submitted CL source contains `SCDTIME(181500)`, and the workflow advances to IBM i target validation.

The important middle state is intentionally split:

> **FUNCTIONAL TEST = PASS**  
> **RELEASE GATE = HOLD**

The browser workload is synthetic and uses no SAP assets, logos, proprietary fonts, or live SAP system.

---

## IBM i source-evidence sessions

The public experience also includes three bounded IronTerm-style source replays:

1. preserved baseline CL evidence around `SCDTIME(180000)`;
2. submitted RPG conditional Preferred/Standard rule;
3. submitted CL remediation around `SCDTIME(181500)`.

These are **source-evidence fixtures**, not a live TN5250 session and not observed `WRKJOBSCDE` runtime state. They are supporting inspection surfaces; the Review Workspace is the main evidence-lineage surface.

---

## Repository structure

```text
api/                          ORDERPRO Node.js facade and API tests
engine/
  analyzers/                   RPGLE / CLLE / DDS / SQL / Node / docs / config analyzers
  evidence/
    core.js                    workload-neutral evidence collection core
    collector.js               ORDERPRO profile/specialization
    model.js                   common Finding semantics
    diff.js                    common evidence diff
  profile-runner.js            config-driven reusable workload runner
  reporters/
    pack.js                    ORDERPRO reporter
    profile-pack.js            workload-neutral reporter
orderpro/                      primary IBM i brownfield workload
examples/timeout-service/      independent modern reuse workload
  states/                      baseline / literal / post-change fixtures
  evidence-pack/               CI-generated receipts
evidence-pack/
  baseline/                    preserved historical ORDERPRO baseline
  post-change/                 CI-refreshed current ORDERPRO evidence
bob_sessions/                  IBM Bob task/session screenshots
review-workspace.js/.css       evidence-lineage UI
reuse-proof.js/.css            independent reuse-proof UI
ironterm-experience.js         IBM i source-evidence replay UI
.github/workflows/reuse-proof.yml
DEMO.md                        final one-take three-minute script
SUBMISSION.md                  hackathon submission source
SUBMISSION_FIELDS.txt          direct copy/paste fields
```

---

## Important baseline rule

The repository is intentionally left in the final ORDERPRO post-change state.

Do **not** run `npm run baseline` against the current working tree and expect it to recreate the historical baseline. The preserved baseline was generated while source still represented the pre-change behavior.

REPORT-GW avoids this historical-state limitation by storing immutable baseline/literal/post-change fixtures and canonicalizing their artifact paths before diffing.

---

## IBM i boundary

SQLite and the browser UI are local hackathon surrogates. They are explicitly not equivalent to Db2 for i or an IBM i runtime.

Documented target adapter paths include ODBC/IBM i connectivity, `itoolkit`/XMLSERVICE, SSH, and `QSYS2.QCMDEXC` where appropriate.

No live IBM i connection was required for the proof of concept. ChangeProof treats that absence as an evidence boundary rather than pretending it does not exist.

---

## IBM Bob 2.0

IBM Bob was the core development environment for the substantive hackathon build: architecture/planning, repository scaffolding, polyglot ORDERPRO source, API/tests, analyzers, evidence generation, and iterative remediation.

The project consumed the **full 40-Bobcoin hackathon allocation**. The retained Bob task-session summary and full-context screenshots are in `bob_sessions/`.

---

## Scope

ORDERPRO and REPORT-GW are fictional and all data is synthetic. No client, employer, personal, or confidential data is included.
