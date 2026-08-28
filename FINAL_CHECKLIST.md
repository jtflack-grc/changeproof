# ChangeProof Final Submission Checklist

## 1. Capture the Required IBM Bob Screenshots

IBM requires the actual Bob IDE **task-session consumption summary screenshots** in the public repository. The Markdown session notes already in `bob_sessions/` do not replace them.

For each relevant Bob task:

1. Open Bob IDE.
2. In the chat interface, select **Tasks**.
3. Select a task related to ChangeProof. Confirm the correct ChangeProof workspace is shown. If the work spans multiple workspaces, use **All**.
4. Select the **task header** to display the task-session consumption summary.
5. Take a screenshot. PNG is preferred for text clarity.
6. Save it in `bob_sessions/` with a clear filename.

Suggested names:

```text
bob_sessions/changeproof_task01_architecture_summary.png
bob_sessions/changeproof_task02_polyglot_build_summary.png
bob_sessions/changeproof_task03_analysis_testing_summary.png
bob_sessions/changeproof_task04_remediation_summary.png
```

Capture the meaningful sessions that actually exist. Do not manufacture or duplicate screenshots just to increase the count.

## 2. Repository Check

Before publishing:

- [ ] Add the real Bob PNG screenshots to `bob_sessions/`.
- [ ] Confirm `node_modules/` is not present or committed.
- [ ] Confirm no `.env`, API keys, passwords, tokens, or IBM Cloud credentials are present.
- [ ] Keep `evidence-pack/baseline/evidence-pack.html` and `.md`.
- [ ] Keep `evidence-pack/baseline/traceability.json`.
- [ ] Keep `evidence-pack/post-change/evidence-pack.html` and `.md`.
- [ ] Keep `evidence-pack/post-change/traceability.json`.
- [ ] Keep the preserved baseline artifacts intact.
- [ ] Leave the working source in the post-CHG-0042 state.
- [ ] Make the GitHub repository publicly accessible before submission.

Recommended final local checks if dependencies are installed:

```bash
npm test
npm run post-change
```

Expected final test state: **16 passed, 0 failed, 3 intentionally skipped IBM i validation-boundary tests.**

Do not run `npm run baseline` against the final working tree unless you first restore the pre-change source.

## 3. Record the Video

- [ ] Maximum length: **3 minutes**.
- [ ] Leave at least **90 seconds** for the solution working on screen.
- [ ] Briefly state the problem.
- [ ] Clearly show IBM Bob usage, ideally one real task-session summary screenshot.
- [ ] Show the preserved baseline Evidence Pack.
- [ ] Highlight the inferred 18:00 batch-window collision.
- [ ] Show the post-change Evidence Pack and zero-failure result.
- [ ] Explain the IBM i validation boundary.
- [ ] Use the timed script in `DEMO.md`.
- [ ] Host the video at a publicly accessible URL supported by the hackathon submission page.

## 4. Submission Form

Use `SUBMISSION.md` as the source for the written fields.

- [ ] Public video URL entered.
- [ ] Problem and Solution statement entered, under 500 words.
- [ ] IBM Bob usage statement entered.
- [ ] Public repository URL entered.
- [ ] Team member list is correct.
- [ ] Submit before **10:00 AM ET, August 30, 2026**.

## 5. Use the AI Submission Advisor

After the first submission, review the confirmation email. IBM’s advisor may flag the video, written statements, Bob usage evidence, or repository completeness.

If a useful issue is identified, correct it and resubmit **all** deliverables before the deadline. The most recent submission is the official one.

Aim to make the first submission early enough to leave time for one revision cycle.
