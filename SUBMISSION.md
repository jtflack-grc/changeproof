# ChangeProof Hackathon Submission Copy

## Problem and Solution Statement

**Word count: approximately 465 words. Limit: 500 words.**

Brownfield application changes are rarely as small as the ticket makes them look. A developer may be asked to change one business rule, but the real work is discovering duplicated logic, downstream processing, stale documentation, missing tests, data dependencies, and validation that can only happen on the target platform. AI can make code changes faster, but faster generation can make review and release confidence the new bottleneck.

ChangeProof is an evidence-producing maintenance workflow for developers maintaining unfamiliar applications and reviewers deciding whether a change is ready to advance toward release. ORDERPRO, a fictional polyglot IBM i order system, is the primary demonstration workload rather than the product itself.

CHG-0042 asks that Preferred customers submit expedited orders until 6:00 PM instead of 4:00 PM. ORDERPRO spans RPGLE, CLLE, DDS, Db2, Node.js, tests, and operations documentation. A Preferred expedited order at 5 PM initially fails. Apply the ticket literally and that order passes locally, but ChangeProof keeps release on HOLD because preserved baseline evidence contains `SCDTIME(180000)`, exactly the new cutoff. The engine emitted an `INFERRED / OPEN / IBM_I` finding named `inferred-fulmnt-batch-window-collision`.

The public Review Workspace makes that conclusion reviewable rather than decorative. It loads actual traceability JSON, preserved Jest receipts, the change request, submitted RPGLE/CLLE, and inference implementation from the repository. Reviewers can walk request → execution receipt → machine finding → inference rule → release decision → remediation → re-run → residual target boundary. Each node exposes evidence ID, artifact, line reference, basis, status, validation target, raw record, and source excerpt. If required evidence cannot be loaded or resolved, no canned lineage appears: **no evidence means no chain**.

The remediation keeps Preferred at 18:00, Standard at 16:00, and moves submitted CL source to `SCDTIME(181500)`. Baseline evidence records 14 passing tests, 2 failures, and 3 IBM i boundary skips. Post-change, 16 pass with zero failures while the three target-only checks remain pending.

To prove ChangeProof is reusable rather than an ORDERPRO-specific detector, the repository also includes **REPORT-GW**, a small Node.js/configuration workload with no IBM i code. Its ticket raises an application timeout from 30 to 60 seconds. The same profile-driven evidence core runs on GitHub Actions. The literal change passes its scoped Jest tests but emits `inferred-upstream-timeout-ordering` because an upstream proxy remains at 45 seconds. The remediated state moves the proxy to 75 seconds and the finding disappears. CI verifies those semantics and commits the generated evidence receipts.

ChangeProof therefore separates functional acceptance from release assurance across materially different workloads. It answers four questions: **What changed? What did we prove? What did we infer? What still requires the target?**

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
