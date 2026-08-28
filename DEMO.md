# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:45 to 2:55  
**Requirement:** Keep at least 90 seconds on the working solution itself.  
**Recording setup:** Have the baseline and post-change HTML Evidence Packs open in two browser tabs. Also have one Bob task-session summary screenshot ready to show briefly.

## 0:00-0:20 | Hook and problem

**On screen:** Title, then `CHANGE_REQUEST.md`.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i order system with RPGLE, CL, Db2/DDS, and a Node API. The ticket looks simple: let Preferred customers place expedited orders until 6 PM instead of 4 PM. The hard part is proving what that change actually touches.”

## 0:20-0:35 | IBM Bob role

**On screen:** One real Bob task-session summary screenshot, then a quick view of the repository tree.

**Say:**

“I used IBM Bob 2.0 as the core build environment for the project: planning the workflow, authoring the polyglot sample application, building the analyzers and tests, generating the Evidence Packs, and iterating on remediation. The project used the full 40-Bobcoin hackathon allocation.”

## 0:35-1:20 | Baseline evidence

**On screen:** `evidence-pack/baseline/evidence-pack.html`, starting at Executive Summary and Blast Radius.

**Say:**

“Here is the preserved baseline before CHG-0042. ChangeProof executes local tests, analyzes the source and documentation, and correlates findings to the change request. Fourteen tests pass, two intentionally fail, and three IBM i-only validations are skipped. The human view shows 12 primary blast-radius items, backed by 65 machine-readable evidence findings.”

“Each item tells the reviewer how it was established: `EXECUTED_LOCAL`, `OBSERVED_SOURCE`, or `INFERRED`, plus whether final validation is local or requires IBM i.”

## 1:20-1:50 | The hidden consequence

**On screen:** Highlight the baseline `SCDTIME(180000)` inferred finding in the Blast Radius or Static Analysis section.

**Say:**

“This is the finding that matters most. The change ticket never mentions batch processing, but ChangeProof sees that the CL fulfillment job is scheduled for 18:00, exactly when the new Preferred-order window closes. It infers a potential batch-window collision. That is the requested change revealing a downstream operational change the ticket never described.”

## 1:50-2:30 | Post-change proof

**On screen:** Switch to `evidence-pack/post-change/evidence-pack.html`. Show Executive Summary, then test results/diff.

**Say:**

“After remediation, the API and RPG rules differentiate Preferred and Standard customers, the stale customer-class documentation is corrected, regression tests are added, and the batch moves to 18:15.”

“The post-change run has 16 passing tests, zero failures, and the same three intentionally skipped IBM i validations. Forty-six findings are resolved locally. Thirty-seven remain `TARGET_VALIDATION_REQUIRED` because RPG, CL, and Db2 behavior still need confirmation on an actual IBM i.”

## 2:30-2:48 | Why the validation boundary matters

**On screen:** IBM i Validation Boundary section.

**Say:**

“ChangeProof does not turn static analysis into fake production evidence. It can observe that RPG and CL source changed, but it will not claim those programs compiled or ran correctly on IBM i until target validation actually occurs. A real adapter can replace the local surrogate without changing the evidence model.”

## 2:48-2:58 | Close

**On screen:** Post-change Executive Summary or title card.

**Say:**

“The requested change is not always the actual change. ChangeProof gives maintainers and reviewers a traceable answer to what changed, what was proven, what was inferred, and what still has to be validated before release.”

---

## Recording Notes

- Do not run `npm run baseline` during the recording. The repository is intentionally in the post-change state; use the preserved baseline HTML.
- If you want one live command, run `npm run post-change` before recording or briefly show the successful console output, then return to the HTML report.
- Keep the Bob screenshot segment short. The judges need to see Bob usage clearly, but the working ChangeProof solution should dominate the video.
- Do not spend time explaining every finding. The 18:00 batch collision is the memorable example.
- Avoid claiming live IBM i execution. The `IBM_I` validation boundary is a feature of the project, not a limitation to hide.
