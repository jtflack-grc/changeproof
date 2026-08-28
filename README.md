# ChangeProof

**AI can write the change. ChangeProof proves what deserves to ship.**

> **[Open the live ChangeProof experience →](https://jtflack-grc.github.io/changeproof/)**  
> Run the synthetic ORDERPRO change, then follow the actual machine evidence behind the release decision.
>
> **[Launch ORDERPRO directly →](https://jtflack-grc.github.io/changeproof/orderpro/app/)**  
> Synthetic enterprise order-processing workload used to reproduce CHG-0042.

ChangeProof is an evidence-producing maintenance workflow built for the **IBM TechXchange 2026 Pre-conference Dev Day Hackathon**. It demonstrates an auditable change lifecycle for a fictional polyglot IBM i brownfield application named **ORDERPRO**.

The project is not asking a reviewer to trust a warning rendered beside fake code. The public **ChangeProof Review Workspace** loads the actual preserved evidence artifacts from this repository and lets the reviewer walk backward from a release decision to the machine record, test receipt, inference rule, source artifact, and residual IBM i validation boundary that support it.

## The scenario

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

This is now the centerpiece of the public experience.

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

The workspace then reconstructs the review path:

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

Every node is inspectable. The evidence drawer exposes the exact evidence ID, artifact, line reference, `evidenceBasis`, status, `validationTarget`, finding text, raw machine record, and links back to the submitted artifact.

The inference node also links to `engine/evidence/collector.js` and shows the submitted `inferBatchWindowCollision()` implementation that produced the collision finding.

### Fail-closed review rendering

The Review Workspace deliberately has **no canned evidence fallback**.

If a required repository artifact cannot be fetched, or if the expected machine finding/test record cannot be resolved from those artifacts, the workspace shows an evidence-load failure and does **not** render the lineage.

The public UI therefore follows a simple rule:

> **NO EVIDENCE → NO CHAIN**

That is the key distinction between the synthetic ORDERPRO workload and ChangeProof itself. ORDERPRO demonstrates the problem. The Review Workspace renders the evidence produced by the engine.

## Interactive ORDERPRO lifecycle

The public page also embeds a synthetic enterprise-style ORDERPRO workbench with three states:

1. **Current production** — the default Preferred expedited order at 17:00 fails because the effective cutoff is still 16:00.
2. **Ticket applied literally** — the same order passes locally, but the release remains **HOLD** because preserved baseline evidence contains `SCDTIME(180000)`.
3. **ChangeProof remediation** — the order still passes and submitted CL source contains `SCDTIME(181500)`. The workflow advances to IBM i target validation rather than declaring production success.

The middle state is intentionally a split decision:

> **FUNCTIONAL TEST = PASS**  
> **RELEASE GATE = HOLD**

Passing an acceptance criterion is not the same as proving the whole change is ready to ship.

ORDERPRO uses dense enterprise ERP/BASIS-style visual conventions for realism, but no SAP assets, logos, proprietary fonts, or live SAP system are used.

## Authoritative results

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

An RPGLE or CLLE source edit can therefore be directly observed without being represented as target runtime proof.

## IBM i evidence sessions

The Pages experience also includes three bounded IronTerm-style 5250 source-evidence replays:

1. preserved baseline `FULMNT.clle` evidence around `SCDTIME(180000)`;
2. submitted `ORDPRC.rpgle` conditional Preferred/Standard rule;
3. submitted `FULMNT.clle` remediation with `SCDTIME(181500)`.

These are source-evidence fixtures, not live `WRKJOBSCDE` state and not a live TN5250 connection. They are supporting inspection surfaces; the Review Workspace is the primary evidence-lineage view.

## Repository layout

```text
api/                       Node.js/Express API facade and tests
engine/
  analyzers/                Polyglot static/document analyzers
  evidence/                 Finding model, collector, diff logic
  reporters/                HTML/Markdown evidence-pack generation
orderpro/
  app/                      Synthetic browser-visible enterprise workload
  rpgle/                    RPGLE business logic
  clle/                     CLLE fulfillment logic
  dds/                      DDS definitions
  sql/db2/                  Db2 for i DDL for static analysis
  sql/sqlite/               Explicit local surrogate
  docs/                     Operations documentation
tests/regression/          Cross-artifact regression tests
evidence-pack/
  baseline/                 Preserved PRE-CHG-0042 evidence
  post-change/              Final POST-CHG-0042 evidence
bob_sessions/              IBM Bob task/session evidence
review-workspace.js        Runtime evidence-lineage renderer
review-workspace.css       Review workspace presentation
CHANGE_REQUEST.md          Formal CHG-0042 input
DEMO.md                    Three-minute demonstration script
SUBMISSION.md              Hackathon submission copy
index.html                 GitHub Pages shell
```

## Important historical-integrity note

The repository working tree is intentionally in the **post-change** state.

`evidence-pack/baseline/` is the preserved historical evidence generated while the source still represented the original 16:00 behavior and `SCDTIME(180000)` schedule literal.

Do **not** run `npm run baseline` against the current tree and expect it to recreate that historical state. Doing so would analyze current source and overwrite the preserved baseline artifacts.

The Review Workspace reflects this distinction: baseline facts come from preserved baseline traceability/test evidence; current RPG/CL excerpts come from submitted post-change source. It does not present current source as historical source.

## Local surrogate versus IBM i

SQLite and the browser ORDERPRO UI exist to make part of the workflow executable during the hackathon. They are explicitly **not equivalent to Db2 for i or an IBM i runtime**.

Documented real IBM i adapter paths include:

- Db2 access through ODBC / IBM i Node connectivity
- program interaction through `itoolkit` / XMLSERVICE or SSH where appropriate
- compile/system commands through SSH or `QSYS2.QCMDEXC` via Db2

No live IBM i connection was required for this proof of concept. ChangeProof treats that absence as an evidence boundary instead of pretending it does not exist.

## IBM Bob 2.0

IBM Bob was a core development component of ChangeProof across planning, project scaffolding, polyglot source creation, API and test implementation, analyzer development, evidence-pack generation, and iterative remediation. The project consumed the full hackathon allocation of **40 Bobcoins**.

The retained Bob task-session summary and full task-context screenshots are in `bob_sessions/`.

## Hackathon artifacts

- Live judge-facing Pages experience
- Interactive ORDERPRO workload
- Evidence-driven Review Workspace
- Baseline and post-change HTML/Markdown Evidence Packs
- Baseline and post-change `traceability.json`
- Preserved Jest receipts
- IBM Bob task-session screenshots
- Three-minute demo script
- Submission copy

## Scope

ORDERPRO is fictional and all data is synthetic. No client, employer, personal, or confidential data is included.