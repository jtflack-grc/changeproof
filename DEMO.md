# ChangeProof: Three-Minute Demo Script

**Target runtime:** 2:45 to 2:55  
**Requirement:** Keep at least 90 seconds on the working solution itself.  
**Recording setup:** Open the live ChangeProof GitHub Pages experience, the final Evidence Pack, and the Bob task-session summary screenshot in separate tabs.

## 0:00-0:18 | Hook

**On screen:** ChangeProof GitHub Pages hero and ORDERPRO change-control console.

**Say:**

“AI can write the change. ChangeProof asks whether the change deserves to ship. This is ORDERPRO, a fictional brownfield IBM i order system with RPGLE, CL, Db2/DDS, and a Node API. The ticket looks simple: Preferred customers get two more hours for expedited orders. The problem is proving what that request actually changes.”

## 0:18-0:32 | IBM Bob role

**On screen:** Briefly show the real Bob task-session summary screenshot with the `changeproof` workspace and 40.12 Bobcoins, then return immediately to the live site.

**Say:**

“IBM Bob 2.0 was the core build environment: planning, polyglot authoring, analyzers, tests, evidence generation, and iterative remediation. This single retained task consumed the full hackathon Bob allocation.”

## 0:32-1:05 | Session 01 — discover the hidden consequence

**On screen:** Scroll to **IronTerm evidence sessions**, Session 01 / Discover collision.

**Say:**

“ChangeProof inspects the brownfield surface, not just the modern API. Here the IBM i job-schedule fixture shows fulfillment starting at 18:00.”

“The change request extends Preferred expedited ordering to that same 18:00 boundary. ChangeProof correlates those two observations and produces an `INFERRED` finding: a potential batch-window collision that the ticket never mentioned.”

Pause briefly on the right-side evidence rail so `OBSERVED_SOURCE`, `INFERRED`, `OPEN`, and `IBM_I` are visible.

## 1:05-1:32 | Session 02 — trace the real RPG rule

**On screen:** Click **02 / Trace business rule**.

**Say:**

“The rule is also not a blind 160000-to-180000 replacement. This fixture replays the actual submitted RPG source. The procedure checks order type, customer class, and order time. Preferred customers get 18:00; Standard customers remain at 16:00.”

“That means a simplistic change could easily alter behavior for the wrong customers. ChangeProof keeps the source observation separate from whether the RPG has actually compiled and executed on IBM i.”

## 1:32-1:58 | Session 03 — verify the remediation without lying

**On screen:** Click **03 / Verify remediation**.

**Say:**

“After remediation, the fulfillment schedule is visibly moved to 18:15, beyond the new order cutoff. ChangeProof can mark the source remediation as resolved while still leaving runtime status as `TARGET_VALIDATION_REQUIRED`.”

“That distinction is intentional. A source edit is evidence of a source edit. It is not evidence that CL or RPG ran successfully on the target.”

## 1:58-2:28 | Before → after results

**On screen:** Scroll to the Before → After panels, then open the final Evidence Pack.

**Say:**

“The preserved baseline has 14 passing tests, 2 intentional failures, and 3 IBM i validation-boundary skips. After the change: 16 passing, zero failures, and the same three target-only validations.”

“The human-facing report stays concise, while `traceability.json` retains the complete machine-readable evidence trail.”

## 2:28-2:46 | Evidence model

**On screen:** Show the three evidence-model cards or the corresponding section of the final Evidence Pack.

**Say:**

“Every finding answers three separate questions: how do we know, where is remediation now, and where must final validation occur? That prevents static analysis from turning into fake production assurance.”

## 2:46-2:56 | Close

**On screen:** Final ChangeProof call-to-action panel.

**Say:**

“The requested change is not always the actual change. ChangeProof gives the reviewer a traceable answer to what changed, what was proven, what was inferred, and what still needs the target before release.”

---

## Recording Notes

- Use the live GitHub Pages site as the primary visual spine. It is substantially easier to understand than narrating the repository tree.
- The IronTerm section is a **static fixture replay**, clearly labeled as such. Do not describe it as a live TN5250 connection.
- Session 02 displays RPG lines copied from the submitted `ORDPRC.rpgle`; it is not invented terminal output.
- Do not run `npm run baseline` during recording. The repository is intentionally in the post-change state; use the preserved baseline artifacts.
- Keep the Bob screenshot segment short. Bob usage must be visible, but the working ChangeProof experience should dominate the video.
- Do not spend time explaining every finding. The 18:00 collision is the memorable example.
- Avoid claiming live IBM i execution. The `IBM_I` validation boundary is a feature, not a limitation to hide.
