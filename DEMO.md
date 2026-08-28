# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:48 to 2:58  
**Recording style:** One continuous screen + camera take. No editing required.  
**Requirement:** Keep at least 90 seconds on the working solution itself.

## Before recording

Open the live ChangeProof page and hard-refresh it. Scroll through once so all dynamic sections have loaded.

Do **not** record unless:

- Review Workspace says **8/8 repository artifacts loaded**.
- Reuse Proof says **9/9 generated artifacts loaded**.
- ORDERPRO defaults are Hartwell / Preferred / Expedited / 17:00.

The video has two proof moments:

1. ORDERPRO functional PASS → release HOLD → reviewable evidence lineage.
2. REPORT-GW uses the same core on a completely different workload and independently reproduces the same class of “acceptance passed, consequence still open” problem.

## 0:00–0:13 | Hook

**On screen:** ChangeProof hero, then move directly to ORDERPRO.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i system. The ticket sounds tiny: Preferred customers get until 6 PM instead of 4 PM for expedited orders.”

## 0:13–0:35 | Show the split decision

**On screen:** ORDERPRO. Start on **Current production**, run the default order, then select **Ticket applied literally** and run the exact same order again.

**Say:**

“At 5 PM, the baseline rejects this Preferred expedited order. Apply the ticket literally and the exact same acceptance check passes. But release still stops: preserved CL evidence contains `SCDTIME(180000)`, the same new boundary.”

Pause on:

- `FUNCTIONAL TEST = PASS`
- `RELEASE GATE = HOLD`

Click **Prove the HOLD**.

## 0:35–1:25 | Follow the actual evidence — centerpiece

**On screen:** ChangeProof Review Workspace.

**Say:**

“This is ChangeProof itself. The warning is not hard-coded into the fake ERP. The workspace loads eight actual repository artifacts: preserved traceability, Jest receipts, the ticket, submitted RPG and CL, and the inference implementation. If those artifacts cannot be resolved, the chain does not render.”

Pause on **8/8 repository artifacts loaded** and **NO EVIDENCE → NO CHAIN**.

Click **`inferred-fulmnt-batch-window-collision`**.

“This is the preserved machine finding: evidence ID, artifact, line reference, basis, status, target, and raw record.”

Close it and click **Inference engine**.

“And this is the submitted code that created it. The collector sees the CL `SCDTIME` value and correlates it with the requested 18:00 boundary.”

Continue down to remediation/re-run.

“The submitted RPG keeps Preferred at 18:00 and Standard at 16:00; CL moves to `SCDTIME(181500)`. The same targeted test then passes.”

## 1:25–1:42 | Show where proof stops

**On screen:** **RESIDUAL / IBM_I** node.

**Say:**

“Three checks remain pending because they require IBM i. Source observation is not runtime proof, so ChangeProof does not claim compilation, CL execution, job submission, or Db2 behavior that never ran.”

## 1:42–2:18 | Prove it is reusable

**On screen:** Scroll to **Reuse Proof / ORDERPRO is not the product**.

**Say:**

“And this is the answer to ‘did you just build a detector for your own synthetic problem?’ REPORT-GW is a second workload with no RPG, CL, Db2, 5250, or IBM i adapter. It uses the same evidence core.”

Pause on the architecture and three states.

“The ticket changes an application timeout from 30 to 60 seconds. In the literal state, both scoped Jest tests pass — but the same core emits this independent `INFERRED / OPEN / LOCAL` finding because the upstream proxy is still 45 seconds. Move the proxy to 75, rerun, and the finding disappears.”

Point to **9/9 generated artifacts loaded** and the machine record.

“These receipts were generated and verified by GitHub Actions and committed by the Actions bot. The page is rendering those receipts, not a canned second example.”

## 2:18–2:32 | Bob role

**On screen:** Bob section or retained Bob task-session screenshot.

**Say:**

“IBM Bob 2.0 was the core build environment for planning, polyglot authoring, analyzers, tests, evidence generation, and remediation, consuming the full hackathon allocation.”

## 2:32–2:55 | Close

**On screen:** Return to the Review Workspace final release question or hero.

**Say:**

“ORDERPRO is synthetic and REPORT-GW is synthetic because the demonstration needs to be safe and reproducible. The evidence machinery is reusable and falsifiable. Change the source, tests, config, or inference rule and the evidence changes. ChangeProof tells a reviewer what changed, what was proven, what was inferred, and exactly where proof stops.”

---

## Recording notes

- **Review Workspace is the product centerpiece.** ORDERPRO only establishes the problem.
- The Reuse Proof is essential now. Give it roughly 30–35 seconds.
- Verify **8/8** Review Workspace artifacts and **9/9** Reuse Proof artifacts before recording.
- Click at least one real machine finding and the inference-engine node.
- You do not need to show all three IronTerm sessions in the final video. They are optional supporting inspection surfaces on the public page.
- The ORDERPRO baseline source is historical; current working source is post-change. The viewer preserves that distinction.
- The original ORDERPRO baseline inference stored the detected `SCDTIME(180000)` literal and cross-artifact conclusion in one INFERRED record. The viewer does not invent parent IDs.
- REPORT-GW uses immutable baseline/literal/post-change fixture states and canonical artifact names before diffing.
- Do not run `npm run baseline` against the current ORDERPRO source tree.
- Do not claim live IBM i execution.
