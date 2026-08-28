# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:45 to 2:55  
**Recording style:** One continuous screen + camera take. No editing required.  
**Requirement:** Keep at least 90 seconds on the working solution itself.

## Before recording

Open the live ChangeProof page and hard-refresh it. Scroll once through the page so the browser has loaded the embedded ORDERPRO workbench and evidence sessions. Keep the Bob task-session summary available in another tab if you want to show it briefly.

Use the default ORDERPRO test throughout the demo:

- Customer: `1000001 — Hartwell Manufacturing Ltd`
- Class: Preferred (`P`)
- Order type: Expedited (`E`)
- Time: `17:00`
- Item: `ITM0001`
- Quantity: `10`

The key visual in Step 2 is the deliberate split between **FUNCTIONAL TEST = PASS** and **RELEASE GATE = HOLD**.

## 0:00–0:16 | Hook

**On screen:** ChangeProof hero, then scroll immediately to **LIVE SCENARIO / ORDERPRO**.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i order system. The ticket sounds tiny: Preferred customers get until 6 PM instead of 4 PM for expedited orders.”

## 0:16–0:42 | Reproduce the existing behavior

**On screen:** Embedded ORDERPRO. Leave **Current production** selected and run **Check Order** for the default 17:00 Preferred expedited order.

**Say:**

“In the current state, this Preferred customer submitting at 5 PM is rejected because the effective expedited cutoff is still 4 PM. So the functional gap is easy to reproduce.”

**Expected result:** `FUNCTIONAL TEST = FAIL`. Release remains `NO-GO`.

## 0:42–1:16 | Implement the ticket literally — and stop on the split result

**On screen:** Click **02 / Ticket applied literally**, run the exact same order again, then pause on the two decision cards and gate matrix.

**Say:**

“Now apply the ticket literally. The exact same order passes. That is a real functional PASS — the acceptance criterion is satisfied.”

**Pause. Point to the amber release card.**

“But the release gate is still HOLD. The preserved CL evidence contains `SCDTIME(180000)`, exactly the new customer cutoff. ChangeProof separates ‘the order test passed’ from ‘the change is ready to ship’ and holds the release because the downstream collision is still open.”

**Expected result:**

- `FUNCTIONAL TEST = PASS`
- `RELEASE GATE = HOLD`
- FULMNT source boundary = `18:00`

Do not describe Step 2 as “passing but failing.” Say: **“the functional test passes; the release gate holds.”**

## 1:16–1:42 | Show the remediation

**On screen:** Click **03 / ChangeProof remediation**, run the same order once more.

**Say:**

“The remediation keeps the Preferred cutoff at 18:00 and moves the CL schedule literal to 18:15. Functional behavior still passes, the source-level collision is removed, and the release workflow advances to the next gate: IBM i target validation.”

**Expected result:** `FUNCTIONAL TEST = PASS`; release decision = `TARGET CHECK`, not production approval.

## 1:42–2:08 | Inspect the IBM i source surface

**On screen:** Scroll to **IronTerm evidence sessions**. Click through the three sessions.

**Say:**

“These terminal views are bounded source-evidence replays, not a live IBM i session. Session one shows the preserved baseline CL literal at 18:00. Session two shows the actual submitted RPG rule — expedited order, Preferred class, conditional 18:00 cutoff. Session three shows the submitted CL remediation at `SCDTIME(181500)`.”

Give the right-side evidence rail a beat so `OBSERVED_SOURCE`, `INFERRED`, and `TARGET_VALIDATION_REQUIRED` are visible.

## 2:08–2:31 | Show the evidence receipt

**On screen:** Open the final Evidence Pack.

**Say:**

“The preserved baseline has fourteen passing tests, two failures, and three intentionally skipped IBM i validations. After remediation, sixteen pass and zero fail. Every finding records whether it was executed locally, observed in source, or inferred.”

## 2:31–2:46 | Make the validation boundary explicit

**On screen:** Evidence model / IBM i validation boundary.

**Say:**

“And ChangeProof does not turn static analysis into fake production evidence. It can observe that RPG and CL source changed, but it will not claim compilation, job submission, CL execution, or Db2 runtime behavior until validation occurs on IBM i.”

## 2:46–2:55 | Close

**On screen:** Final release question or hero.

**Say:**

“The requested change is not always the actual change. ChangeProof tells you what changed, what was proven, what was inferred, and what still needs the target before release.”

---

## Optional Bob receipt

If the walkthrough is running fast, spend **5–8 seconds** on the Bob section or task-session screenshot after the hook:

“IBM Bob 2.0 was the core build environment for planning, authoring, analysis, testing, evidence generation, and remediation, consuming the full hackathon allocation.”

Do not let the Bob screenshot displace the working-product demo. The repository contains the official retained task-session summary in `bob_sessions/`.

## Recording notes

- Do not run `npm run baseline` during the recording. The repository is intentionally in the final post-change source state; use the preserved baseline artifact.
- The **Ticket applied literally** UI state is a browser scenario replay used to demonstrate the split between functional acceptance and release readiness. It is not another preserved source snapshot.
- ORDERPRO is a synthetic browser simulation backed by the repository’s synthetic customer/inventory/order fixtures. It is not a live IBM i or SAP session.
- The enterprise ERP/BASIS visual language is parody/inspiration only; no SAP assets or live SAP system are used.
- IronTerm screens are bounded **source-evidence fixtures**, not live `WRKJOBSCDE` state and not a live TN5250 connection.
- Session 02 displays RPG lines from the submitted `ORDPRC.rpgle`; Session 03 displays the submitted `FULMNT.clle` schedule literal.
- Do not claim RPG compilation, CL execution, job submission, or Db2 for i runtime execution occurred locally.
- The memorable moment is Step 2: **the order passes and the release still stops.** Give it a beat before moving on.
