# ChangeProof Hackathon Submission Copy

## Problem and Solution Statement

**Word count: approximately 417 words. Limit: 500 words.**

Brownfield application changes are rarely as small as the ticket makes them look. A developer may be asked to change one business rule, but the real work is discovering duplicated logic, downstream processing, stale documentation, missing tests, data dependencies, and validation that can only happen on the target platform. AI can make code changes faster, but faster code generation can make review and release confidence the new bottleneck.

ChangeProof is an evidence-producing maintenance workflow built around a fictional IBM i order system called ORDERPRO. Its target users are developers maintaining unfamiliar applications and reviewers deciding whether a change is ready to advance toward release.

The demonstration starts with CHG-0042: Preferred customers may submit expedited orders until 6:00 PM instead of the standard 4:00 PM cutoff. ORDERPRO is deliberately polyglot: RPGLE contains core order logic, CL handles fulfillment scheduling, DDS and Db2 define data, a Node.js API fronts the application, and operational documentation describes expected behavior.

In the interactive ORDERPRO workload, a Preferred expedited order at 5 PM initially fails. Apply the ticket literally and that exact order passes locally, but ChangeProof keeps the release on HOLD because preserved baseline evidence contains `SCDTIME(180000)`, exactly the new customer cutoff. The engine emitted an `INFERRED`, `OPEN`, `IBM_I` finding named `inferred-fulmnt-batch-window-collision`.

The public ChangeProof Review Workspace makes that conclusion reviewable rather than decorative. At runtime it loads the actual baseline/post-change traceability JSON, preserved Jest receipts, change request, submitted RPGLE/CLLE, and the evidence collector from the repository. The reviewer can follow the chain from request → execution receipt → machine finding → inference rule → release decision → remediation → re-run → residual IBM i boundary. Clicking a node exposes the evidence ID, artifact, line reference, basis, status, validation target, raw machine record, and source excerpt. If required evidence cannot be loaded or resolved, the workspace does not render a canned lineage: no evidence means no chain.

The remediation keeps Preferred at 18:00, Standard at 16:00, and moves submitted CL source to `SCDTIME(181500)`. The preserved baseline has 14 passing tests, 2 failures, and 3 IBM i boundary skips. Post-change, 16 tests pass with zero failures while the three target-only checks remain pending.

ChangeProof therefore separates functional acceptance from release assurance. It can prove local execution, observe source, and preserve an inference trail without claiming RPG compilation, CL execution, job submission, or Db2 runtime behavior that did not occur. The reviewer gets a defensible answer to four questions: **What changed? What did we prove? What did we infer? What still requires the target?**

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