# ChangeProof Final Submission Checklist

## 1. IBM Bob evidence

The retained Bob task-session evidence is already in `bob_sessions/`.

Before submission:

- [ ] Confirm `changeproof_task01_session_summary.png` opens and remains readable.
- [ ] Confirm `changeproof_task01_full_task_context.png` opens.
- [ ] Confirm the repository still shows the Bob task/session evidence publicly.
- [ ] Do not manufacture additional Bob sessions or screenshots.

The submission wording should say the project consumed the **full 40-Bobcoin hackathon allocation**. The retained Bob UI may show the underlying accounting value separately.

## 2. Repository and evidence gate

- [ ] `node_modules/` is not committed.
- [ ] No `.env`, API keys, passwords, tokens, employer/client data, or credentials are present.
- [ ] ORDERPRO baseline evidence remains preserved under `evidence-pack/baseline/`.
- [ ] ORDERPRO post-change evidence remains under `evidence-pack/post-change/`.
- [ ] Current ORDERPRO source remains post-CHG-0042.
- [ ] Do **not** run `npm run baseline` against the current ORDERPRO source tree.
- [ ] Public repository is accessible without authentication.

Authoritative ORDERPRO gate:

```text
16 passed / 0 failed / 3 intentionally skipped IBM i checks
```

The CI reuse-proof workflow must also be green. It verifies that:

```text
REPORT-GW baseline:     app 30 / proxy 45 / functional gap
REPORT-GW literal:      app 60 / proxy 45 / scoped Jest PASS / INFERRED OPEN mismatch
REPORT-GW post-change:  app 60 / proxy 75 / scoped Jest PASS / mismatch removed
```

- [ ] `.github/workflows/reuse-proof.yml` most recent run = success.
- [ ] `examples/timeout-service/evidence-pack/` contains baseline, literal, and post-change generated receipts.
- [ ] Generated REPORT-GW evidence was committed by `github-actions[bot]`, not manually fabricated.

## 3. Public Pages QA

Hard-refresh the live site before recording.

- [ ] ORDERPRO loads and the default Hartwell / Preferred / Expedited / 17:00 scenario works.
- [ ] Step 2 clearly reads **FUNCTIONAL TEST = PASS / RELEASE GATE = HOLD**.
- [ ] **Prove the HOLD** reaches the ChangeProof Review Workspace.
- [ ] Review Workspace says **8/8 repository artifacts loaded**.
- [ ] Collision node opens the real `inferred-fulmnt-batch-window-collision` record.
- [ ] Inference-engine node exposes the submitted collector implementation.
- [ ] RPG and CL remediation nodes expose submitted source.
- [ ] Residual node shows three IBM i target-only checks.
- [ ] Reuse Proof says **9/9 generated artifacts loaded**.
- [ ] REPORT-GW literal state shows app 60s / proxy 45s / scoped tests passing / `INFERRED / OPEN / LOCAL` mismatch.
- [ ] REPORT-GW remediated state shows app 60s / proxy 75s and no mismatch.
- [ ] IronTerm sessions remain labeled fixture/source-evidence replays rather than live TN5250 state.

If either evidence-driven section fails closed, fix it before recording. Do not record around an evidence-load error.

## 4. Record the video

Use `DEMO.md` as the one-take script.

- [ ] Maximum length: **3 minutes**.
- [ ] At least **90 seconds** visibly demonstrate the working solution.
- [ ] Show the ORDERPRO split decision quickly; do not spend the video touring ERP chrome.
- [ ] Spend the most time in the Review Workspace.
- [ ] Open at least one machine finding and the inference-engine node.
- [ ] Show the REPORT-GW Reuse Proof and its CI-generated machine record.
- [ ] Explain the IBM i validation boundary.
- [ ] Clearly show or state IBM Bob usage; briefly display the Bob section/task screenshot.
- [ ] Do not claim live IBM i execution.
- [ ] Host the finished video at a publicly accessible URL accepted by the submission form.

## 5. Submission form

Use `SUBMISSION_FIELDS.txt` for direct copy/paste and `SUBMISSION.md` as the readable source.

- [ ] Public video URL entered.
- [ ] Problem/Solution statement remains under 500 words.
- [ ] IBM Bob usage statement entered.
- [ ] Public repository URL entered.
- [ ] Team member list is correct.
- [ ] Live GitHub Pages experience is reachable.
- [ ] Submit before **10:00 AM ET, August 30, 2026**.

## 6. AI Submission Advisor

After the first submission, review the confirmation/advisor feedback. If it identifies a meaningful issue, correct it and resubmit all required deliverables before the deadline. The most recent submission becomes the official one.

Prefer the first real submission early enough to leave one clean revision cycle rather than using the deadline as the first end-to-end test.
