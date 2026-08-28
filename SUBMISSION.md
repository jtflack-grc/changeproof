# ChangeProof Hackathon Submission Copy

## Problem and Solution Statement

**Word count: approximately 440 words. Limit: 500 words.**

Brownfield application changes are rarely as small as the ticket makes them look. A developer may be asked to change one business rule, but the real work is discovering duplicated logic, downstream processing, stale documentation, missing tests, data dependencies, and validation that can only happen on the target platform. AI can make code changes faster, but faster code generation can make review and release confidence the new bottleneck.

**ChangeProof** is an evidence-producing maintenance workflow built around a fictional IBM i order system called ORDERPRO. Its target users are developers maintaining unfamiliar applications and the reviewers responsible for deciding whether those changes are ready to advance toward release.

The demonstration starts with CHG-0042: “Preferred customers may submit expedited orders until 6:00 PM instead of the standard 4:00 PM cutoff.” ORDERPRO is deliberately polyglot: RPGLE contains core order logic, CL handles fulfillment scheduling, DDS and Db2 define data, a Node.js API fronts the application, and operational Markdown describes expected behavior.

The public demo includes an interactive enterprise-style ORDERPRO workbench. In current production, a Preferred expedited order at 5 PM fails. Apply the ticket literally and that exact order passes locally — but ChangeProof keeps the **release gate on HOLD** because preserved CL source evidence contains `SCDTIME(180000)`, exactly the new customer cutoff. The functional acceptance criterion is satisfied while the broader change is still not ready to ship. The remediated source moves fulfillment to `SCDTIME(181500)`, after which the workflow advances to IBM i target validation rather than declaring production success.

ChangeProof analyzes source and documentation, executes the tests and local data checks that can actually run, correlates findings to the change request, and produces a human-readable HTML/Markdown Evidence Pack plus machine-readable traceability JSON. Every finding records three separate facts: how it was established (`EXECUTED_LOCAL`, `OBSERVED_SOURCE`, or `INFERRED`), its remediation status, and whether final validation can occur locally or requires IBM i.

The preserved baseline contains 14 passing tests, 2 intentional failures, and 3 IBM i validation-boundary skips. After remediation, 16 tests pass with zero failures; the three IBM i-only checks remain intentionally unclaimed. ChangeProof can observe RPGLE and CLLE source changes without pretending those programs compiled, jobs were submitted, or Db2 behavior executed successfully on IBM i.

The result is not another code-generation assistant. It is a review workflow that separates **functional acceptance, operational change safety, and target validation** so maintainers can answer four release questions: **What changed? What did we actually prove? What did we infer? What still requires the target?**

## IBM Bob Usage Statement

IBM Bob 2.0 was the core development environment used to create ChangeProof. Bob was first used in planning mode to turn the hackathon theme into a bounded end-to-end maintenance workflow and define the ORDERPRO scenario, evidence model, adapter boundary, baseline/post-change lifecycle, and implementation plan.

Bob then performed the substantive build work in the IDE. It scaffolded the repository; authored the polyglot sample application across Node.js, RPGLE, CLLE, DDS, Db2 for i DDL, SQLite surrogate data, and Markdown documentation; created the transport-independent IBM i adapter contract; built the six static/document analyzers; implemented evidence collection, reporting, and baseline/post-change comparison; and authored the Jest and cross-artifact regression tests.

Bob was also used iteratively to inspect generated evidence and remediate implementation defects. That included reducing noisy lexical matches, repairing CL continuation-line analysis so `SCDTIME(180000)` could be extracted, surfacing the inferred 18:00 batch-window collision, preserving the intentional baseline failures as evidence, restoring the post-change state, and improving the human-readable Blast Radius.

The project consumed the full hackathon allocation of **40 Bobcoins**. Actual IBM Bob task-session consumption-summary screenshots are included in the repository’s `bob_sessions/` directory as required. The existing Markdown files in that directory are supporting historical session notes.

The final result demonstrates Bob being used across planning, polyglot development, testing, document understanding, code analysis, evidence generation, and iterative remediation rather than only as a code-completion tool.

## Submission Fields

**Public video URL:** _add after upload_  
**Public repository URL:** https://github.com/jtflack-grc/changeproof  
**Team:** ChangeProof  
**Team size:** 1
