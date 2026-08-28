# ChangeProof

**AI can write the change. ChangeProof proves what deserves to ship.**

> **[Open the live ChangeProof experience →](https://jtflack-grc.github.io/changeproof/)**  
> Run the synthetic ORDERPRO change, review the actual machine evidence behind the release decision, then inspect the independent reuse proof.
>
> **[Launch ORDERPRO directly →](https://jtflack-grc.github.io/changeproof/orderpro/app/)**  
> Synthetic enterprise order-processing workload used to reproduce CHG-0042.

ChangeProof is an evidence-producing maintenance workflow built for the **IBM TechXchange 2026 Pre-conference Dev Day Hackathon**. ORDERPRO is the primary demonstration workload, not the product itself.

The public **ChangeProof Review Workspace** loads actual preserved evidence artifacts from this repository and lets a reviewer walk backward from a release decision to machine records, test receipts, inference logic, source artifacts, remediation, and residual validation boundaries.

A second workload, **REPORT-GW**, exists specifically to demonstrate reuse. It contains no RPGLE, CLLE, DDS, Db2, 5250 surface, ORDERPRO adapter, or IBM i dependency. GitHub Actions runs REPORT-GW through the same workload-neutral evidence core and commits the resulting evidence receipts back to the repository.

## Primary scenario: ORDERPRO / CHG-0042

> **CHG-0042:** Preferred customers (`CUSCLS = 'P'`) may submit expedited orders until 6:00 PM instead of the standard 4:00 PM cutoff.

ORDERPRO crosses a Node.js API, RPGLE business logic, CLLE batch processing, DDS, Db2 for i DDL, tests, local SQLite surrogate data, and operations documentation.

The one-line request hides a downstream consequence. In the preserved baseline, ChangeProof found that `FULMNT.clle` contained `SCDTIME(180000)`, the exact new Preferred-customer cutoff. The evidence engine emitted the preserved machine finding:

```text
id: inferred-fulmnt-batch-window-collision
evidenceBasis: INFERRED
status: OPEN
validationTarget: IBM_I
symbol: SCDTIME(180000)
```

The remediation keeps Preferred at 18:00, keeps Standard at 16:00, and moves the submitted CL source to `SCDTIME(181500)`.

## The ChangeProof Review Workspace

This is the primary review surface in the public experience.

The browser loads **eight required repository artifacts at runtime**:

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

The workspace reconstructs this path:

```text
CHG-0042
   ↓
BASELINE EXECUTION RECEIPT
Preferred / expedited / 17:00 → FAIL
   +
PRESERVED MACHINE FINDING
inferred-fulmnt-batch-window-collision
SCDTIME(180000) / OPEN / IBM_I
   ↓
INFERENCE IMPLEMENTATION
inferBatchWindowCollision()
   ↓
REVIEW DECISION
functional acceptance can pass / release remains HOLD
   ↓
REMEDIATION
ORDPRC conditional rule + FULMNT SCDTIME(181500)
   ↓
POST-CHANGE EXECUTION RECEIPT
same Preferred / expedited / 17:00 check → PASS
   ↓
RESIDUAL BOUNDARY
3 IBM_I checks remain pending
```

Every node is inspectable. The evidence drawer exposes evidence ID, artifact, line reference, `evidenceBasis`, status, `validationTarget`, finding text, raw machine record, and links back to the submitted artifact.

### Fail-closed review rendering

The Review Workspace has **no canned evidence fallback**. If a required repository artifact cannot be fetched, or an expected machine finding/test record cannot be resolved, the workspace shows an evidence-load failure and does not render the lineage.

> **NO EVIDENCE → NO CHAIN**

ORDERPRO demonstrates the problem. The Review Workspace renders the evidence produced by ChangeProof.

## Reuse proof: REPORT-GW / CHG-WEB-017

The second workload exists to answer two obvious objections:

1. “This looks hard-coded to the IBM i scenario.”
2. “You created a synthetic problem that conveniently fits the solution.”

REPORT-GW is deliberately boring: Node.js source, a small edge-proxy configuration file, a Markdown runbook, and a scoped Jest test.

Its ticket says only:

> **CHG-WEB-017:** Increase the application request timeout from 30 seconds to 60 seconds.

It does **not** request a proxy change.

The same ChangeProof evidence core processes three immutable fixture states:

| State | App timeout | Proxy timeout | Scoped Jest | Evidence result |
|---|---:|---:|---:|---|
| `baseline` | 30s | 45s | **1 pass / 1 fail** | requested behavior missing |
| `literal` | 60s | 45s | **2 pass / 0 fail** | **`INFERRED / OPEN` upstream timeout mismatch** |
| `post-change` | 60s | 75s | **2 pass / 0 fail** | mismatch removed |

The literal pass emits this independent machine finding:

```text
id: inferred-upstream-timeout-ordering
artifact: config/edge-proxy.conf
lineRef: config/edge-proxy.conf:2
evidenceBasis: INFERRED
status: OPEN
validationTarget: LOCAL
symbol: proxy(45) < app(60)
```

The REPORT-GW profile does not change the evidence model. It supplies discovery scope, canonical artifact mapping across snapshots, a scoped Jest configuration, and one small domain inference plug-in. The common implementation remains in:

```text
engine/evidence/core.js
engine/evidence/model.js
engine/evidence/diff.js
engine/profile-runner.js
engine/reporters/profile-pack.js
```

The profile-specific pieces are:

```text
examples/timeout-service/changeproof.profile.js
examples/timeout-service/inference.js
```

### CI-generated, not hand-authored evidence

`.github/workflows/reuse-proof.yml` performs the reuse proof on GitHub-hosted CI:

1. syntax-check the reusable engine/profile code;
2. rerun the authoritative ORDERPRO test gate (`16 passed / 3 skipped`);
3. generate REPORT-GW baseline, literal, and remediated evidence;
4. assert that the literal state has functional PASS plus `inferred-upstream-timeout-ordering` as `INFERRED / OPEN / LOCAL`;
5. assert that the remediated state no longer contains that finding;
6. commit the generated evidence receipts with `github-actions[bot]`.

The resulting artifacts are under:

```text
examples/timeout-service/evidence-pack/
  baseline/
  literal/
  post-change/
```

The public Reuse Proof section loads those generated receipts at runtime. If they are unavailable or inconsistent, the page refuses to substitute a canned reuse story.

This makes the claim falsifiable: change the application timeout, proxy timeout, scoped test, source discovery profile, or inference plug-in and the generated evidence changes.

## Interactive ORDERPRO lifecycle

The public page embeds an enterprise-style ORDERPRO workbench with three scenario states:

1. **Current production** — the default Preferred expedited order at 17:00 fails because the effective cutoff is still 16:00.
2. **Ticket applied literally** — the same order passes locally, but the release remains **HOLD** because preserved baseline evidence contains `SCDTIME(180000)`.
3. **ChangeProof remediation** — the order still passes and submitted CL source contains `SCDTIME(181500)`. The workflow advances to IBM i target validation rather than declaring production success.

The middle state is intentionally split:

> **FUNCTIONAL TEST = PASS**  
> **RELEASE GATE = HOLD**

Passing an acceptance criterion is not the same as proving the whole change is ready to ship.

ORDERPRO uses dense enterprise ERP/BASIS-style visual conventions for realism, but no SAP assets, logos, proprietary fonts, or live SAP system are used.

## Authoritative ORDERPRO results

| | Baseline | Post-change |
|---|---:|---:|
| Passing tests | **14** | **16** |
| Failing tests | **2** | **0** |
| IBM i validation-boundary skips | **3** | **3** |
| Machine-readable findings | **65** | **83** |
| Human-facing Blast Radius rows | **12** | **11** |

The two baseline failures are API/regression representations of the same missing Preferred-at-17:00 behavior. The three IBM i checks stay pending after remediation because they cannot honestly be proven on the local hackathon runtime.

## Evidence model

ChangeProof separates three questions that AI-assisted maintenance often blurs together.

### `evidenceBasis` — How do we know?

- `EXECUTED_LOCAL` — code or checks actually ran locally.
- `OBSERVED_SOURCE` — directly present in source, configuration, tests, or documentation.
- `INFERRED` — derived by reasoning across observations.

### `status` — Where is remediation now?

- `OPEN`
- `RESOLVED`
- `TARGET_VALIDATION_REQUIRED`

### `validationTarget` — Where must final validation occur?

- `LOCAL`
- `IBM_I`

An RPGLE or CLLE source edit can therefore be directly observed without being represented as target runtime proof. The same model also works for an entirely local modern workload such as REPORT-GW.

## IBM i evidence sessions

The Pages experience includes three bounded IronTerm-style 5250 source-evidence replays:

1. preserved baseline `FULMNT.clle` evidence around `SCDTIME(180000)`;
2. submitted `ORDPRC.rpgle` conditional Preferred/Standard rule;
3. submitted `FULMNT.clle` remediation with `SCDTIME(181500)`.

These are source-evidence fixtures, not live `WRKJOBSCDE` state and not a live TN5250 connection. They are supporting inspection surfaces; the Review Workspace is the primary evidence-lineage view.

## Repository layout

```text
api/                          Node.js/Express ORDERPRO facade and tests
engine/
  analyzers/                   Reusable artifact analyzers, including generic config
  evidence/
    core.js                    Workload-neutral discovery/evidence/test core
    collector.js               ORDERPRO specialization
    model.js                   Common Finding/evidence semantics
    diff.js                    Common baseline/change diff
  profile-runner.js            Config-driven workload runner
  reporters/
    pack.js                    ORDERPRO evidence pack
    profile-pack.js            Workload-neutral profile evidence pack
orderpro/                      Primary IBM i brownfield demonstration workload
examples/timeout-service/      Independent modern reuse workload
  changeproof.profile.js       Discovery/test/diff profile
  inference.js                 Timeout-ordering inference plug-in
  states/                      baseline / literal / post-change fixtures
  evidence-pack/               CI-generated receipts committed by Actions
tests/regression/             ORDERPRO cross-artifact regression tests
evidence-pack/                Preserved ORDERPRO baseline/post-change evidence
bob_sessions/                 IBM Bob task/session evidence
review-workspace.js           Runtime ORDERPRO evidence-lineage renderer
reuse-proof.js                Runtime second-workload proof renderer
.github/workflows/
  reuse-proof.yml              Independent CI regeneration + assertions
CHANGE_REQUEST.md             Formal CHG-0042 input
DEMO.md                       Three-minute demonstration script
SUBMISSION.md                 Hackathon submission copy
index.html                    GitHub Pages shell
```

## Historical-integrity note

The main ORDERPRO working tree is intentionally in the **post-change** state.

`evidence-pack/baseline/` is preserved historical evidence generated while source still represented the original 16:00 behavior and `SCDTIME(180000)` schedule literal. Do **not** run `npm run baseline` against the current tree and expect it to recreate that historical state.

REPORT-GW avoids that limitation by storing separate immutable baseline/literal/post-change fixture directories and canonicalizing their artifact paths through the workload profile before diffing.

## Local surrogate versus IBM i

SQLite and the browser ORDERPRO UI exist to make part of the primary workflow executable during the hackathon. They are explicitly **not equivalent to Db2 for i or an IBM i runtime**.

Documented real IBM i adapter paths include:

- Db2 access through ODBC / IBM i Node connectivity
- program interaction through `itoolkit` / XMLSERVICE or SSH where appropriate
- compile/system commands through SSH or `QSYS2.QCMDEXC` via Db2

No live IBM i connection was required. ChangeProof treats that absence as an evidence boundary instead of pretending it does not exist.

## IBM Bob 2.0

IBM Bob was a core development component of ChangeProof across planning, project scaffolding, polyglot source creation, API and test implementation, analyzer development, evidence-pack generation, and iterative remediation. The project consumed the full hackathon allocation of **40 Bobcoins**.

The retained Bob task-session summary and full task-context screenshots are in `bob_sessions/`.

## Hackathon artifacts

- Live judge-facing Pages experience
- Interactive ORDERPRO workload
- Evidence-driven Review Workspace
- Runtime Reuse Proof backed by CI-generated REPORT-GW evidence
- ORDERPRO baseline and post-change Evidence Packs / traceability / Jest receipts
- REPORT-GW baseline, literal, and post-change Evidence Packs / traceability / Jest receipts
- Reusable profile-driven evidence core
- IBM Bob task-session screenshots
- Three-minute demo script
- Submission copy

## Scope

ORDERPRO and REPORT-GW are fictional and all data is synthetic. No client, employer, personal, or confidential data is included.
