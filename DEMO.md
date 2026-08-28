# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:45 to 2:55  
**Recording style:** One continuous screen + camera take. No editing required.  
**Requirement:** Keep at least 90 seconds on the working solution itself.

## Before recording

Open the live ChangeProof page and hard-refresh it. Scroll once through the page so the browser has loaded the embedded ORDERPRO work center and evidence sessions. Keep the Bob task-session summary available in another tab if you want to show it briefly.

Use the default ORDERPRO order throughout the demo:

- Customer: `1000001 — Hartwell Manufacturing Ltd`
- Class: Preferred (`P`)
- Order type: Expedited (`E`)
- Time: `17:00`
- Item: `ITM0001`
- Quantity: `10`

## 0:00–0:18 | Hook

**On screen:** ChangeProof hero, then scroll immediately to **LIVE SCENARIO / ORDERPRO**.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i order system. The ticket sounds tiny: Preferred customers get until 6 PM instead of 4 PM for expedited orders.”

## 0:18–0:48 | Reproduce the existing behavior

**On screen:** Embedded ORDERPRO. Leave **Current production** selected and submit the default 17:00 Preferred expedited order.

**Say:**

“Here is the actual workload ChangeProof is protecting. In the current state, a Preferred customer submitting at 5 PM is rejected because the existing expedited cutoff is 4 PM.”

**Expected result:** `ORDER REJECTED` with effective cutoff `16:00`.

## 0:48–1:18 | Implement the ticket literally

**On screen:** Click **Requested CHG-0042**, submit the exact same order again, then point to the FULMNT schedule / ChangeProof observation.

**Say:**

“Now implement the ticket literally. The same order passes — so the acceptance criterion looks satisfied. But fulfillment is already scheduled for 18:00, exactly when the new order window closes. ChangeProof correlates the customer rule with the batch schedule and surfaces a potential operational collision the ticket never mentioned.”

**Expected result:** `ORDER ACCEPTED`, plus `FULMNT 18:00` and collision warning.

## 1:18–1:42 | Show the remediation

**On screen:** Click **ChangeProof remediation**, submit the order once more.

**Say:**

“The remediated state keeps the Preferred cutoff at 18:00 but moves fulfillment to 18:15. The order still passes and the source-level collision is gone.”

**Expected result:** `ORDER ACCEPTED`, `FULMNT 18:15`, source collision resolved.

## 1:42–2:08 | Inspect the IBM i surface

**On screen:** Scroll to **IronTerm evidence sessions**. Click through Session 01 and Session 02; briefly show Session 03.

**Say:**

“ChangeProof also gives the reviewer an IBM i-shaped inspection surface. Session one shows the 18:00 schedule. Session two traces the actual RPG business rule — expedited order, Preferred class, and the conditional 18:00 cutoff. Session three shows the 18:15 remediation.”

## 2:08–2:31 | Show the evidence receipt

**On screen:** Open the final Evidence Pack, then return to the before/after or evidence-model section if useful.

**Say:**

“The baseline has fourteen passing tests, two failures, and three intentionally skipped IBM i validations. After remediation, sixteen pass and zero fail. Every finding records how it was established: executed locally, observed in source, or inferred.”

## 2:31–2:46 | Make the boundary explicit

**On screen:** Evidence model / IBM i validation boundary.

**Say:**

“And ChangeProof does not turn static analysis into fake production evidence. It can observe that RPG and CL source changed, but it will not claim those programs compiled or executed correctly until validation occurs on IBM i.”

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
- The **Requested CHG-0042** UI state is a scenario replay of the ticket implemented literally so the collision can be demonstrated. It is not presented as the final source tree.
- ORDERPRO is a synthetic browser simulation backed by the repository’s synthetic customer/inventory/order fixtures. It is not a live IBM i session.
- IronTerm screens are bounded fixture replays, not a live TN5250 connection.
- Do not claim RPG compilation, CL execution, or Db2 for i runtime execution occurred locally.
- The 18:00 collision is the memorable moment. Give it a beat before moving on.
