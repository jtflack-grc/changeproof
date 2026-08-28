# ORDERPRO interactive scenario

This directory contains the browser-visible ORDERPRO work center used by the ChangeProof GitHub Pages experience.

It is a **synthetic scenario replay**, not a separate production application and not a live IBM i connection. Customer, inventory, and historical-order content is derived from the repository's synthetic SQLite seed fixtures.

The UI intentionally exposes three lifecycle states:

1. **Current production** — pre-CHG-0042 behavior: expedited orders use the existing 16:00 cutoff; FULMNT is scheduled for 18:00.
2. **Requested CHG-0042** — a scenario replay of the ticket implemented literally: Preferred customers receive the requested 18:00 cutoff while FULMNT remains at 18:00. This state demonstrates why satisfying the stated acceptance criterion does not by itself prove the change is safe to ship.
3. **ChangeProof remediation** — the final behavioral intent: Preferred cutoff 18:00, Standard cutoff 16:00, FULMNT moved to 18:15, with IBM i runtime validation still explicitly required.

The repository itself remains intentionally in the **final post-change source state**. Preserved baseline and post-change evidence are under `evidence-pack/`.

The work center is implemented as static HTML/CSS/JavaScript so it can run directly on GitHub Pages. It does not claim RPG compilation, CL execution, Db2 for i execution, or live TN5250 activity.
