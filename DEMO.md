# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:45 to 2:55  
**Recording style:** One continuous screen + camera take. No editing required.  
**Requirement:** Keep at least 90 seconds on the working solution itself.

## Before recording

Open the live ChangeProof page and hard-refresh it. Scroll through once so the embedded ORDERPRO workbench and ChangeProof Review Workspace have loaded. The Review Workspace should show **8/8 repository artifacts loaded**. If it does not, do not record until that is fixed.

Use the default ORDERPRO test throughout:

- Customer: `1000001 — Hartwell Manufacturing Ltd`
- Class: Preferred (`P`)
- Order type: Expedited (`E`)
- Time: `17:00`
- Item: `ITM0001`
- Quantity: `10`

The memorable moment is not merely the fake ERP. It is the transition from **FUNCTIONAL TEST = PASS / RELEASE GATE = HOLD** into the evidence lineage that proves why.

## 0:00–0:14 | Hook

**On screen:** ChangeProof hero, then move to ORDERPRO.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i system. The ticket sounds tiny: Preferred customers get until 6 PM instead of 4 PM for expedited orders.”

## 0:14–0:34 | Reproduce the gap

**On screen:** ORDERPRO / Current production. Run **Check Order** with the defaults.

**Say:**

“In the preserved baseline, this Preferred customer at 5 PM fails the requested behavior. That is the obvious part.”

**Expected visual:** functional FAIL / release NO-GO.

## 0:34–0:54 | Implement the ticket literally

**On screen:** Select **02 / Ticket applied literally** and run the same order.

**Say:**

“Apply the ticket literally and the exact same order passes. The acceptance criterion is satisfied. But ChangeProof still holds the release because preserved CL evidence contains `SCDTIME(180000)`, the same new boundary.”

Pause on:

- `FUNCTIONAL TEST = PASS`
- `RELEASE GATE = HOLD`

Then click **Prove the HOLD**.

## 0:54–1:42 | Follow the evidence lineage — centerpiece

**On screen:** ChangeProof Review Workspace.

**Say:**

“This is the part I care about. The warning is not a label I typed into the ERP. This workspace loads the actual preserved traceability JSON, Jest receipts, change request, submitted RPG and CL source, and the inference engine from the repository.”

Pause on **8/8 repository artifacts loaded** and **NO EVIDENCE → NO CHAIN**.

Continue:

“The chain starts with CHG-0042, then the baseline execution receipt, then this actual machine finding.”

Click **`inferred-fulmnt-batch-window-collision`**.

“Here is its real evidence ID, artifact, line reference, basis, status, target, and raw machine record. The baseline engine recorded an inferred collision at `SCDTIME(180000)`.”

Close the drawer and click **Inference engine**.

“And here is the submitted collector code that produced that finding. It analyzes the CL symbols for `SCDTIME` and emits the collision when the requested 18:00 boundary equals the detected 180000 value.”

## 1:42–2:10 | Follow remediation and re-run

**On screen:** Continue down the lineage to **REMEDIATE** and **RE-RUN**.

**Say:**

“Now the same chain shows the submitted RPG rule, the CL remediation to `SCDTIME(181500)`, and the preserved post-change Jest receipt for the same Preferred-at-17:00 case. Sixteen tests pass and zero fail.”

Click either the RPG or CL node briefly so the fetched source excerpt is visible.

## 2:10–2:28 | Show what ChangeProof refuses to prove

**On screen:** Final **RESIDUAL / IBM_I** node. Click it.

**Say:**

“Three checks remain deliberately pending because they require IBM i. ChangeProof can prove local execution and observe source. It will not claim RPG compilation, CL execution, job submission, or Db2 runtime behavior without the target.”

## 2:28–2:42 | Bob role

**On screen:** Scroll to the Bob section or briefly show the retained Bob task screenshot.

**Say:**

“IBM Bob 2.0 was the core build environment for planning, polyglot authoring, analyzers, tests, evidence generation, and remediation, consuming the full hackathon allocation.”

## 2:42–2:55 | Close

**On screen:** Return to the lineage or final release question.

**Say:**

“The requested change is not always the actual change. ChangeProof lets a reviewer ask why, follow the evidence all the way down, and see exactly where proof stops.”

---

## Recording notes

- The **Review Workspace is the product centerpiece**. Spend more time there than in ORDERPRO.
- Verify it says **8/8 repository artifacts loaded** before recording.
- Click at least one machine finding and one source/remediation node so the evidence drawer is visibly demonstrated.
- The workspace deliberately fails closed: if required evidence cannot be fetched or resolved, it does not render a canned lineage.
- The baseline working source is historical. The current repository working tree is post-change. The viewer explicitly labels that distinction.
- The original baseline inference stored the detected `SCDTIME(180000)` literal and cross-artifact conclusion in one INFERRED record. The viewer does not invent parent IDs; it reconstructs the review path from the preserved change request, machine finding, and test receipt.
- ORDERPRO is synthetic and browser-based. It demonstrates the workload; it is not the evidence source.
- IronTerm-style screens remain optional supporting inspection surfaces. Do not spend scarce video time on all three unless the run is comfortably under three minutes.
- Do not run `npm run baseline` against the final source tree.
- Do not claim live IBM i execution.