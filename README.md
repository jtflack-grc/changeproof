# ChangeProof

**AI can write the change. ChangeProof proves what deserves to ship.**

> **[Open the live ChangeProof experience →](https://jtflack-grc.github.io/changeproof/)**  
> Judge-facing walkthrough of the CHG-0042 scenario, interactive ORDERPRO workload, before/after evidence, IBM i validation boundary, and Bob usage.
>
> **[Launch ORDERPRO directly →](https://jtflack-grc.github.io/changeproof/orderpro/app/)**  
> Synthetic enterprise order-processing workbench used to reproduce the change lifecycle.

ChangeProof is a proof-of-concept built for the **IBM TechXchange 2026 Pre-conference Dev Day Hackathon**. It demonstrates a complete, auditable change-management lifecycle for a fictional polyglot IBM i brownfield application named **ORDERPRO**.

The scenario begins with a deceptively simple request:

> **CHG-0042:** Preferred customers (`CUSCLS = 'P'`) may submit expedited orders until 6:00 PM instead of the standard 4:00 PM cutoff.

That one-line request crosses a Node.js API, RPGLE business logic, CL scheduling, DDS/Db2 definitions, tests, operational documentation, and the browser-visible ORDERPRO workbench. ChangeProof uses static analysis, local execution, document inspection, and evidence correlation to show what is affected, what was actually validated, what is inferred, and what still requires IBM i target validation.

The central design principle is simple:

> **The requested change is not necessarily the actual change.**

In the preserved pre-change baseline, ChangeProof discovers an operational consequence not stated in CHG-0042: the `FULMNT.clle` source contains `SCDTIME(180000)`, the same boundary introduced by the new Preferred-customer cutoff. ChangeProof correlates those observations and produces an **INFERRED** potential batch-window collision. The remediation moves that source schedule literal to `SCDTIME(181500)` while updating application behavior, RPGLE logic, customer-class documentation, and regression coverage.

## Interactive scenario

The GitHub Pages experience embeds a synthetic ORDERPRO enterprise workbench with three explicit lifecycle states:

1. **Current production** — the default Preferred expedited order at 17:00 fails because the effective cutoff is still 16:00.
2. **Ticket applied literally** — the same order now passes locally because Preferred customers receive the requested 18:00 cutoff. **The functional test is PASS, but the release gate is HOLD** because the preserved CL schedule evidence is also 18:00.
3. **ChangeProof remediation** — the functional test remains PASS and the submitted CL source moves FULMNT to 18:15. The change advances to **IBM i target validation**, not directly to production approval.

The middle state is intentionally a split outcome:

> **ORDER TEST = PASS**  
> **RELEASE GATE = HOLD**

That is not a contradiction. It demonstrates a core ChangeProof claim: **passing the stated acceptance criterion is not the same as proving the whole change is ready to ship.** The browser state is a scenario replay of the ticket implemented literally, not another preserved source snapshot.

ORDERPRO intentionally uses dense enterprise ERP/BASIS-style visual conventions for realism, but it uses no SAP assets, logos, proprietary fonts, or live SAP system.

## Demo results

| | Baseline | Post-change |
|---|---:|---:|
| Passing tests | **14** | **16** |
| Failing tests | **2** | **0** |
| IBM i validation-boundary skips | **3** | **3** |
| Human-facing Blast Radius rows | **12** | **11** |

The baseline includes an **INFERRED** finding for the 18:00 batch-window collision. The post-change state moves `FULMNT` to `SCDTIME(181500)`, removing the open collision while correctly preserving IBM i runtime validation requirements.

## Evidence model

ChangeProof intentionally separates three questions that are often blurred together in AI-assisted development:

### `evidenceBasis` — How do we know?

- `EXECUTED_LOCAL` — established by running code locally, such as Jest tests or SQLite queries.
- `OBSERVED_SOURCE` — directly present in source code, configuration, tests, or documentation.
- `INFERRED` — derived by reasoning across multiple observations.

### `status` — Where is remediation now?

- `OPEN`
- `RESOLVED`
- `TARGET_VALIDATION_REQUIRED`

### `validationTarget` — Where must final validation occur?

- `LOCAL`
- `IBM_I`

An RPGLE or CLLE source edit can therefore be directly observed without being falsely presented as target runtime proof. ChangeProof never claims that RPG compilation, CL execution, job submission, or Db2 for i runtime behavior occurred when no IBM i runtime was available.

## IBM i evidence sessions

The Pages experience includes three bounded IronTerm-style 5250 evidence replays:

1. **Baseline CL source evidence** — `FULMNT.clle` with the preserved `SCDTIME(180000)` finding.
2. **Submitted RPG source** — the real `ORDPRC.rpgle` conditional rule for expedited orders and Preferred customers.
3. **Submitted post-change CL source** — `FULMNT.clle` with `SCDTIME(181500)`.

These are **source-evidence fixtures**, not live `WRKJOBSCDE` state and not a live TN5250 connection. The screen structure follows Legacy Control Lab source-display conventions; IronTerm remains a separate GPL-3.0 work and is not redistributed by ChangeProof.

## Repository layout

```text
api/                  Node.js/Express API facade and API tests
engine/               ChangeProof analyzers, evidence model, diff, reporter, CLI
orderpro/             Fictional IBM i brownfield workload
  app/                 Browser-visible synthetic enterprise workbench
  rpgle/               RPGLE business logic
  clle/                CL batch workflow
  dds/                 DDS definitions
  sql/db2/             Db2 for i DDL used for static analysis
  sql/sqlite/          Explicitly labeled local hackathon execution surrogate
  docs/                Brownfield operational documentation
tests/regression/     Cross-artifact regression tests
evidence-pack/
  baseline/            Preserved PRE-CHG-0042 evidence
  post-change/         Final POST-CHG-0042 evidence
bob_sessions/         IBM Bob task/session evidence
CHANGE_REQUEST.md     Formal CHG-0042 input
DEMO.md               Three-minute demonstration script
SUBMISSION.md         Hackathon written submission material
index.html            GitHub Pages judge-facing experience
```

## Important baseline note

The repository is intentionally left in the **post-change CHG-0042 source state**.

`evidence-pack/baseline/` is the preserved pre-change snapshot generated while the source still represented the original 4:00 PM behavior and `SCDTIME(180000)` schedule literal.

**Do not run `npm run baseline` against the current post-change source and expect it to recreate that historical state.** Doing so would analyze the current source and overwrite the preserved baseline artifacts.

For demonstration purposes, open the saved baseline evidence directly:

```text
evidence-pack/baseline/evidence-pack.html
```

The current post-change state can be analyzed with:

```bash
npm install
npm run post-change
```

## Local surrogate versus IBM i

SQLite exists only to make a portion of the workflow executable during the hackathon. The surrogate schema explicitly states that it is **not equivalent to Db2 for i runtime semantics**.

The browser-visible ORDERPRO workbench is likewise a synthetic interaction layer over repository fixture data and business-rule states. It is not a live IBM i or SAP session and does not replace the evidence engine.

Real IBM i integration is isolated behind a transport-independent adapter contract. Documented production paths include:

- Db2 access through ODBC / IBM i Node connectivity
- program interaction through `itoolkit` / XMLSERVICE or SSH where appropriate
- compile/system commands through SSH or `QSYS2.QCMDEXC` via Db2

No live IBM i connection was required for this proof of concept, and ChangeProof treats that absence as an evidence boundary rather than pretending it does not exist.

## IBM Bob

IBM Bob was a core development component of ChangeProof and was used across architecture, project scaffolding, polyglot source creation, API and test implementation, analyzer development, evidence-pack generation, and iterative remediation. The project consumed the full hackathon allocation of **40 Bobcoins**.

The retained Bob task-session summary and full task-context screenshots are included in `bob_sessions/` alongside supporting historical session notes. Bob retained the ChangeProof build as one continuous task session.

## Hackathon artifacts

- `orderpro/app/` — interactive synthetic ORDERPRO workload
- `evidence-pack/baseline/evidence-pack.html` — preserved before-state report
- `evidence-pack/post-change/evidence-pack.html` — final after-state report
- `evidence-pack/*/traceability.json` — machine-readable evidence
- `evidence-pack/*/test-results.json` — preserved Jest results
- `bob_sessions/*.png` — retained IBM Bob task/session evidence
- `SUBMISSION.md` — problem/solution and IBM Bob usage statements
- `DEMO.md` — timed three-minute demo script

## Scope

ORDERPRO is fictional and all data is synthetic. No client, employer, personal, or confidential data is included.
