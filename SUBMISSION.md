# ChangeProof Hackathon Submission Copy

## Problem and Solution Statement

**Word count: approximately 430 words. Limit: 500 words.**

Brownfield application changes are rarely as small as the ticket makes them look. A developer may be asked to change one business rule, but the real work is discovering duplicated logic, downstream processing, stale documentation, missing tests, data dependencies, and validation that can only happen on the target platform. AI can make code changes faster, but faster generation can make review and release confidence the new bottleneck.

ChangeProof is a profile-driven change-evidence runtime for developers maintaining unfamiliar applications and reviewers deciding whether a change is ready to advance toward release. A workload supplies source patterns, scoped tests, optional inference rules, and target mappings; the shared engine performs discovery, execution-receipt ingestion, evidence classification, cross-artifact correlation, diffing, and evidence-pack generation.

ORDERPRO is the primary brownfield demonstration workload. CHG-0042 asks that Preferred customers submit expedited orders until 6:00 PM instead of 4:00 PM across RPGLE, CLLE, DDS, Db2, Node.js, tests, and operations documentation. A Preferred expedited order at 5 PM initially fails. Apply the ticket literally and that acceptance behavior passes locally, but ChangeProof holds release because preserved baseline evidence contains `SCDTIME(180000)`, exactly the new cutoff. The engine emitted an `INFERRED / OPEN / IBM_I` finding named `inferred-fulmnt-batch-window-collision`. The Review Workspace lets a reviewer walk request → execution receipt → machine finding → inference implementation → release decision → remediation → re-run → residual target boundary. If required evidence cannot be resolved, no canned lineage appears.

The remediation keeps Preferred at 18:00, Standard at 16:00, and moves submitted CL source to `SCDTIME(181500)`. Post-change, 16 tests pass, zero fail, and three IBM i-only checks remain pending rather than being presented as proven.

ChangeProof now generates a machine-readable **Impact Receipt** instead of claiming invented ROI. In the current ORDERPRO CI pass, it scanned **17 configured source files**, analyzed **348 symbols**, executed **19 tests**, produced **86 evidence records**, and compressed those into **11 primary reviewer rows** while preserving **30 target-validation records**. Those numbers are emitted by the pipeline, not typed into the presentation.

A second workload, REPORT-GW, proves portability and rework prevention without IBM i. Its literal timeout change passes both scoped Jest tests, yet the same core emits one OPEN cross-artifact inference because the application timeout is 60 seconds while the upstream proxy remains 45. After remediation moves the proxy to 75 seconds, both tests still pass and the open inference disappears. GitHub Actions regenerates and verifies these receipts.

ChangeProof therefore separates functional acceptance from release assurance and makes its productivity claim falsifiable: it automates evidence-gathering and review-compression work and surfaces consequences that scoped acceptance checks alone can miss, while explicitly showing where proof stops.

## IBM Bob Usage Statement

IBM Bob 2.0 was the core development environment used to create ChangeProof. Bob was first used in planning mode to turn the hackathon theme into a bounded end-to-end maintenance workflow and define the ORDERPRO scenario, evidence model, adapter boundary, baseline/post-change lifecycle, and implementation plan.

Bob then performed the substantive build work in the IDE. It scaffolded the repository; authored the polyglot sample application across Node.js, RPGLE, CLLE, DDS, Db2 for i DDL, SQLite surrogate data, and Markdown documentation; created the transport-independent IBM i adapter contract; built the static/document analyzers; implemented evidence collection, reporting, and baseline/post-change comparison; and authored the Jest and cross-artifact regression tests.

Bob was also used iteratively to inspect generated evidence and remediate implementation defects. That included reducing noisy lexical matches, repairing CL continuation-line analysis so `SCDTIME(180000)` could be extracted, surfacing the inferred 18:00 batch-window collision, preserving intentional baseline failures as evidence, restoring the post-change state, and improving the human-readable Blast Radius.

The project consumed the full hackathon allocation of **40 Bobcoins**. Actual IBM Bob task-session consumption-summary screenshots are included in `bob_sessions/` as required. The Markdown files in that directory are supporting historical session notes.

The final result demonstrates Bob being used across planning, polyglot development, testing, document understanding, code analysis, evidence generation, and iterative remediation rather than only as a code-completion tool.

## Submission Fields

**Public video URL:** _add after upload_  
**Public repository URL:** https://github.com/jtflack-grc/changeproof  
**Live experience:** https://jtflack-grc.github.io/changeproof/  
**Team:** ChangeProof  
**Team size:** 1
