# ChangeProof Evidence Pack

_Generated: 2026-08-28T16:40:16.620Z_


---

## 1. Change Request

# Change Request: CHG-0042

## Title
Extend expedited order cutoff for Preferred customers

## ID
CHG-0042

## Date
2024-11-15

## Requestor
Sandra Kovacs, Director of Customer Experience, Acme Distribution Inc.

## Affected System
ORDERPRO — Order Processing and Inventory Allocation System (IBM i)

## Description
Preferred customers (customer classification `CUSCLS = 'P'`) are currently
subject to the same 4:00 PM expedited order submission cutoff as Standard
customers. This change requests that Preferred customers be permitted to
submit expedited orders until 6:00 PM local time.

Standard customers retain the existing 4:00 PM cutoff for expedited orders.
No change is required to the standard (non-expedited) order cutoff for any
customer class.

## Business Justification
Preferred customers represent the top 20% of revenue. Extending the expedited
cutoff by two hours brings ORDERPRO into alignment with competitor SLA offerings
and addresses escalated complaints from three key accounts (C-0021, C-0034,
C-0041).

## Acceptance Criteria
1. A Preferred customer (`CUSCLS = 'P'`) submitting an expedited order at or
   before 6:00 PM receives order confirmation.
2. A Preferred customer submitting an expedited order after 6:00 PM is rejected
   with the standard cutoff-exceeded message.
3. A Standard customer (`CUSCLS = 'S'`) submitting an expedited order after
   4:00 PM continues to be rejected.
4. All existing non-expedited order flows are unaffected.
5. Documentation reflects the updated cutoff policy.

## Keywords

Keywords: cutoff, preferred, expedited, 1600, 1800, CUSCLS, ORDTYP, P, E, batch, fulfillment, schedule, SCDTIME

---

## 2. Executive Summary

**Total findings:** 65

| evidenceBasis | count |
|---|---|
| OBSERVED_SOURCE | 43 |
| INFERRED | 1 |
| EXECUTED_LOCAL | 21 |

| status | count |
|---|---|
| OPEN | 48 |
| TARGET_VALIDATION_REQUIRED | 3 |
| RESOLVED | 14 |

| validationTarget | count |
|---|---|
| IBM_I | 26 |
| LOCAL | 39 |

---

## 3. Blast Radius

_65 total findings — showing primary representative per artifact. Full set in `traceability.json`._

| Artifact | Symbol | evidenceBasis | status | validationTarget |
|---|---|---|---|---|
| `orderpro/clle/FULMNT.clle` | SCDTIME(180000) | [INFERRED] | [OPEN] | [IBM_I] |
| `orderpro/rpgle/ORDPRC.rpgle` | comment | [OBSERVED_SOURCE] | [OPEN] | [IBM_I] |
| `orderpro/clle/FULMNT.clle` | ORDERPRO/ORDPRC | [OBSERVED_SOURCE] | [OPEN] | [IBM_I] |
| `orderpro/dds/CUSMAS.dds` | CUSCLS | [OBSERVED_SOURCE] | [OPEN] | [LOCAL] |
| `orderpro/dds/ORDHED.dds` | ORDTYP | [OBSERVED_SOURCE] | [OPEN] | [LOCAL] |
| `orderpro/sql/db2/CUSMAS.sql` | CUSCLS | [OBSERVED_SOURCE] | [OPEN] | [IBM_I] |
| `orderpro/sql/db2/ORDHED.sql` | ORDTYP | [OBSERVED_SOURCE] | [OPEN] | [IBM_I] |
| `orderpro/docs/operations-guide.md` | allocates inventory, and triggers end-of-day batch fulfillment processing. | [OBSERVED_SOURCE] | [OPEN] | [LOCAL] |
| `api/src/routes/orders.js` | cutoffHour | [OBSERVED_SOURCE] | [OPEN] | [LOCAL] |
| `api/src/adapters/mock-adapter.js` | cutoff | [OBSERVED_SOURCE] | [OPEN] | [LOCAL] |
| `orderpro/sql/sqlite/orderpro.db` | CUSCLS=P | [EXECUTED_LOCAL] | [OPEN] | [LOCAL] |
| `orderpro/sql/sqlite/orderpro.db` | CUSCLS=S | [EXECUTED_LOCAL] | [OPEN] | [LOCAL] |

---

## 4. Dependency Analysis

Artifact call graph inferred from static analysis:

```
FULMNT.clle  -->  ORDPRC.rpgle  (CALL PGM)
orders.js    -->  mock-adapter  -->  ORDPRC fixture
orders.js    -->  CUSMAS        (customer class lookup)
```

---

## 5. Static Analysis Findings

### orderpro/rpgle/ORDPRC.rpgle

- **comment** — comment 'comment' = Handles order cutoff validation and inventory allocation. — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:5`
- **comment** — comment 'comment' = Cutoff per spec ORD-001 dated 2019-03-15 — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:7`
- **comment** — comment 'comment' = Prototype: Check Order Cutoff — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:12`
- **comment** — comment 'comment' = Procedure: CHKORDCTF - Check Order Cutoff Time — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:26`
- **comment** — comment 'comment' = Returns *OFF if the cutoff time has passed. — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:28`
- **comment** — comment 'comment' = Expedited cutoff = 16:00:00 for all customer classes. — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:30`
- **comment** — comment 'comment' = Only expedited orders are subject to the cutoff window — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:42`
- **e** — condition literal 'e' = 'e' — keywords: E
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:43`
- **comment** — comment 'comment' = Cutoff exceeded - order rejected — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:49`

### orderpro/clle/FULMNT.clle

- **comment** — comment 'comment' = FULMNT - Fulfillment Batch Job — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:2`
- **comment** — comment 'comment' = Processes open expedited orders at end of business day. — keywords: expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:5`
- **comment** — comment 'comment' = Scheduled after the 4PM expedited-order cutoff. — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:8`
- **comment** — comment 'comment' = Read all order header records and process open expedited orders — keywords: expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:26`
- **comment** — comment 'comment' = Process only Open Expedited orders — keywords: expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:30`
- **ORDERPRO/ORDPRC** — call 'ORDERPRO/ORDPRC' — keywords: ORDTYP
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:34`
- **comment** — comment 'comment' = Job submission — schedule next run — keywords: schedule
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:61`
- **comment** — comment 'comment' = Scheduled after 4PM cutoff - all expedited orders validated. — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:62`
- **ORDERPRO/FULMNT** — call 'ORDERPRO/FULMNT' — keywords: SCDTIME
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:66`
- **SCDTIME(180000)** — Batch job FULMNT is scheduled at 180000 (18:00:00), which equals the new Preferred customer expedited cutoff introduced by CHG-0042. Orders submitted at or near 18:00 may not be captured before the batch run executes. Remediation: move SCDTIME to 181500 (18:15).
  - [INFERRED] [OPEN] [IBM_I]
  - `orderpro/clle/FULMNT.clle:66`

### orderpro/dds/CUSMAS.dds

- **CUSCLS** — field 'CUSCLS' = Customer Class S=Standard B=Business — keywords: CUSCLS
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/dds/CUSMAS.dds:6`

### orderpro/dds/ORDHED.dds

- **ORDTYP** — field 'ORDTYP' = Order Type E=Expedited S=Standard — keywords: expedited, ORDTYP
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/dds/ORDHED.dds:7`

### orderpro/sql/db2/CUSMAS.sql

- **CUSCLS** — column 'CUSCLS' = CHAR — keywords: CUSCLS
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/sql/db2/CUSMAS.sql:11`
- **CUSCLS** — column 'CUSCLS' = TEXT — keywords: CUSCLS
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/sql/db2/CUSMAS.sql:24`

### orderpro/sql/db2/ORDHED.sql

- **ORDTYP** — column 'ORDTYP' = CHAR — keywords: ORDTYP
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/sql/db2/ORDHED.sql:11`
- **ORDTYP** — column 'ORDTYP' = TEXT — keywords: expedited, ORDTYP
  - [OBSERVED_SOURCE] [OPEN] [IBM_I]
  - `orderpro/sql/db2/ORDHED.sql:27`

### orderpro/docs/operations-guide.md

- **allocates inventory, and triggers end-of-day batch fulfillment processing.** — sentence 'allocates inventory, and triggers end-of-day batch fulfillment processing.' = allocates inventory, and triggers end-of-day batch fulfillment processing. — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:14`
- **`E`  | Expedited — priority fulfilment, subject to cutoff window |** — list item '`E`  | Expedited — priority fulfilment, subject to cutoff window |' = | `E`  | Expedited — priority fulfilment, subject to cutoff window | — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:25`
- **`S`  | Standard — normal processing, no intraday cutoff |** — list item '`S`  | Standard — normal processing, no intraday cutoff |' = | `S`  | Standard — normal processing, no intraday cutoff | — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:26`
- **Customers are classified at account setup and stored in the `CUSCLS` field** — sentence 'Customers are classified at account setup and stored in the `CUSCLS` field' = Customers are classified at account setup and stored in the `CUSCLS` field — keywords: CUSCLS
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:32`
- **Customer class does not alter the documented expedited order cutoff time.** — sentence 'Customer class does not alter the documented expedited order cutoff time.' = Customer class does not alter the documented expedited order cutoff time. — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:40`
- **4. Cutoff Policy** — heading '4. Cutoff Policy' = ## — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:44`
- **Expedited orders must be submitted by the applicable cutoff time. Orders** — sentence 'Expedited orders must be submitted by the applicable cutoff time. Orders' = Expedited orders must be submitted by the applicable cutoff time. Orders — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:46`
- **4001** — time expression '4001' = 4001 — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:47`
- **Standard orders have no intraday submission cutoff.** — sentence 'Standard orders have no intraday submission cutoff.' = Standard orders have no intraday submission cutoff. — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:49`
- **Customer Class | Expedited Cutoff | Notes |** — list item 'Customer Class | Expedited Cutoff | Notes |' = | Customer Class | Expedited Cutoff | Notes | — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:51`
- **4:00 PM** — time expression '4:00 PM' = 4:00 PM — keywords: cutoff, preferred
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:55`
- **5. Batch Processing** — heading '5. Batch Processing' = ## — keywords: batch
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:59`
- **The end-of-day fulfillment batch job (`FULMNT`) runs automatically at** — sentence 'The end-of-day fulfillment batch job (`FULMNT`) runs automatically at' = The end-of-day fulfillment batch job (`FULMNT`) runs automatically at — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:61`
- **4:00 PM** — time expression '4:00 PM' = 4:00 PM — keywords: cutoff, batch
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:64`
- **The batch job reads all open expedited orders from `ORDHED` and calls the** — sentence 'The batch job reads all open expedited orders from `ORDHED` and calls the' = The batch job reads all open expedited orders from `ORDHED` and calls the — keywords: expedited, batch
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:66`
- **18:00 ** — time expression '18:00 ' = 18:00  — keywords: schedule, SCDTIME
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:71`
- **4001** — time expression '4001' = 4001 — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `orderpro/docs/operations-guide.md:91`

### api/src/routes/orders.js

- **cutoffHour** — numeric literal 'cutoffHour' = 16 — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `api/src/routes/orders.js:29`

### api/src/adapters/mock-adapter.js

- **cutoff** — numeric literal 'cutoff' = 160000 — keywords: cutoff
  - [OBSERVED_SOURCE] [OPEN] [LOCAL]
  - `api/src/adapters/mock-adapter.js:87`


---

## 6. Test Results

**14 passing · 2 failing · 3 skipped/pending**

| Test | Status | evidenceBasis |
|---|---|---|
| Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042 | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| POST /orders accepts a valid standard order well before cutoff | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders rejects a request with missing required fields | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders rejects an expedited order submitted after cutoff (hour=17) | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders accepts an expedited order submitted before cutoff (hour=15) | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders accepts Preferred customer expedited order at 17:00 (CHG-0042) | [OPEN] | [EXECUTED_LOCAL] |
| POST /orders rejects Preferred customer expedited order at 19:00 (after 18:00 cutoff) | [RESOLVED] | [EXECUTED_LOCAL] |
| GET /orders/:id returns 404 for an unknown order | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Standard customer expedited order at 15:00 is accepted | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Standard customer expedited order at 17:00 is rejected | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Preferred customer expedited order at 17:00 should be accepted (CHG-0042) | [OPEN] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Preferred customer expedited order at 19:00 is rejected | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Order for in-stock item is accepted | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Customer lookup returns correct class for Preferred customer | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Inactive customer data is present in surrogate | [RESOLVED] | [EXECUTED_LOCAL] |
| GET /customers/:id returns customer data for a known Preferred customer | [RESOLVED] | [EXECUTED_LOCAL] |
| GET /customers/:id returns 404 for an unknown customer | [RESOLVED] | [EXECUTED_LOCAL] |

---

## 7. Test Gaps

- **FAILING:** FAILING test — expected behaviour not yet implemented: POST /orders accepts Preferred customer expedited order at 17:00 (CHG-0042)
  - `api/tests/orders.test.js`
- **FAILING:** FAILING test — expected behaviour not yet implemented: Cutoff regression — CHG-0042 Preferred customer expedited order at 17:00 should be accepted (CHG-0042)
  - `tests/regression/cutoff.test.js`

---

## 8. Documentation Gaps

- [OBSERVED_SOURCE] **allocates inventory, and triggers end-of-day batch fulfillment processing.** — sentence 'allocates inventory, and triggers end-of-day batch fulfillment processing.' = allocates inventory, and triggers end-of-day batch fulfillment processing. — keywords: batch, fulfillment
  - `orderpro/docs/operations-guide.md:14`
- [OBSERVED_SOURCE] **`E`  | Expedited — priority fulfilment, subject to cutoff window |** — list item '`E`  | Expedited — priority fulfilment, subject to cutoff window |' = | `E`  | Expedited — priority fulfilment, subject to cutoff window | — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:25`
- [OBSERVED_SOURCE] **`S`  | Standard — normal processing, no intraday cutoff |** — list item '`S`  | Standard — normal processing, no intraday cutoff |' = | `S`  | Standard — normal processing, no intraday cutoff | — keywords: cutoff
  - `orderpro/docs/operations-guide.md:26`
- [OBSERVED_SOURCE] **Customers are classified at account setup and stored in the `CUSCLS` field** — sentence 'Customers are classified at account setup and stored in the `CUSCLS` field' = Customers are classified at account setup and stored in the `CUSCLS` field — keywords: CUSCLS
  - `orderpro/docs/operations-guide.md:32`
- [OBSERVED_SOURCE] **Customer class does not alter the documented expedited order cutoff time.** — sentence 'Customer class does not alter the documented expedited order cutoff time.' = Customer class does not alter the documented expedited order cutoff time. — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:40`
- [OBSERVED_SOURCE] **4. Cutoff Policy** — heading '4. Cutoff Policy' = ## — keywords: cutoff
  - `orderpro/docs/operations-guide.md:44`
- [OBSERVED_SOURCE] **Expedited orders must be submitted by the applicable cutoff time. Orders** — sentence 'Expedited orders must be submitted by the applicable cutoff time. Orders' = Expedited orders must be submitted by the applicable cutoff time. Orders — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:46`
- [OBSERVED_SOURCE] **4001** — time expression '4001' = 4001 — keywords: cutoff
  - `orderpro/docs/operations-guide.md:47`
- [OBSERVED_SOURCE] **Standard orders have no intraday submission cutoff.** — sentence 'Standard orders have no intraday submission cutoff.' = Standard orders have no intraday submission cutoff. — keywords: cutoff
  - `orderpro/docs/operations-guide.md:49`
- [OBSERVED_SOURCE] **Customer Class | Expedited Cutoff | Notes |** — list item 'Customer Class | Expedited Cutoff | Notes |' = | Customer Class | Expedited Cutoff | Notes | — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:51`
- [OBSERVED_SOURCE] **4:00 PM** — time expression '4:00 PM' = 4:00 PM — keywords: cutoff, preferred
  - `orderpro/docs/operations-guide.md:55`
- [OBSERVED_SOURCE] **5. Batch Processing** — heading '5. Batch Processing' = ## — keywords: batch
  - `orderpro/docs/operations-guide.md:59`
- [OBSERVED_SOURCE] **The end-of-day fulfillment batch job (`FULMNT`) runs automatically at** — sentence 'The end-of-day fulfillment batch job (`FULMNT`) runs automatically at' = The end-of-day fulfillment batch job (`FULMNT`) runs automatically at — keywords: batch, fulfillment
  - `orderpro/docs/operations-guide.md:61`
- [OBSERVED_SOURCE] **4:00 PM** — time expression '4:00 PM' = 4:00 PM — keywords: cutoff, batch
  - `orderpro/docs/operations-guide.md:64`
- [OBSERVED_SOURCE] **The batch job reads all open expedited orders from `ORDHED` and calls the** — sentence 'The batch job reads all open expedited orders from `ORDHED` and calls the' = The batch job reads all open expedited orders from `ORDHED` and calls the — keywords: expedited, batch
  - `orderpro/docs/operations-guide.md:66`
- [OBSERVED_SOURCE] **18:00 ** — time expression '18:00 ' = 18:00  — keywords: schedule, SCDTIME
  - `orderpro/docs/operations-guide.md:71`
- [OBSERVED_SOURCE] **4001** — time expression '4001' = 4001 — keywords: cutoff
  - `orderpro/docs/operations-guide.md:91`

---

## 9. IBM i Validation Boundary

Conservative implementation options: `idb-connector` (ODBC), `itoolkit`/XMLSERVICE, SSH + CRTBNDRPG, `QSYS2.QCMDEXC` via ODBC.

- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Handles order cutoff validation and inventory allocation. — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Cutoff per spec ORD-001 dated 2019-03-15 — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Prototype: Check Order Cutoff — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Procedure: CHKORDCTF - Check Order Cutoff Time — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Returns *OFF if the cutoff time has passed. — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Expedited cutoff = 16:00:00 for all customer classes. — keywords: cutoff, expedited
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Only expedited orders are subject to the cutoff window — keywords: cutoff, expedited
- `orderpro/rpgle/ORDPRC.rpgle` — **e**: condition literal 'e' = 'e' — keywords: E
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Cutoff exceeded - order rejected — keywords: cutoff
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = FULMNT - Fulfillment Batch Job — keywords: batch, fulfillment
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Processes open expedited orders at end of business day. — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Scheduled after the 4PM expedited-order cutoff. — keywords: cutoff, expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Read all order header records and process open expedited orders — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Process only Open Expedited orders — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **ORDERPRO/ORDPRC**: call 'ORDERPRO/ORDPRC' — keywords: ORDTYP
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Job submission — schedule next run — keywords: schedule
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Scheduled after 4PM cutoff - all expedited orders validated. — keywords: cutoff, expedited
- `orderpro/clle/FULMNT.clle` — **ORDERPRO/FULMNT**: call 'ORDERPRO/FULMNT' — keywords: SCDTIME
- `orderpro/sql/db2/CUSMAS.sql` — **CUSCLS**: column 'CUSCLS' = CHAR — keywords: CUSCLS
- `orderpro/sql/db2/CUSMAS.sql` — **CUSCLS**: column 'CUSCLS' = TEXT — keywords: CUSCLS
- `orderpro/sql/db2/ORDHED.sql` — **ORDTYP**: column 'ORDTYP' = CHAR — keywords: ORDTYP
- `orderpro/sql/db2/ORDHED.sql` — **ORDTYP**: column 'ORDTYP' = TEXT — keywords: expedited, ORDTYP
- `orderpro/clle/FULMNT.clle` — **SCDTIME(180000)**: Batch job FULMNT is scheduled at 180000 (18:00:00), which equals the new Preferred customer expedited cutoff introduced by CHG-0042. Orders submitted at or near 18:00 may not be captured before the batch run executes. Remediation: move SCDTIME to 181500 (18:15).
- `tests/regression/batch.test.js` — **Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042**: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042
- `tests/regression/batch.test.js` — **Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition**: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition
- `tests/regression/batch.test.js` — **Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule**: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule

---

## 10. Rollback Guidance

| Artifact | Rollback Action |
|---|---|
| `orderpro/rpgle/ORDPRC.rpgle` | Revert CHKORDCTF to single 1600 cutoff (remove CUSCLS branch) |
| `orderpro/clle/FULMNT.clle` | Revert SCDTIME to 180000 and restore original comment |
| `api/src/routes/orders.js` | Revert cutoffHour to constant 16 |
| `orderpro/dds/CUSMAS.dds` | Revert CUSCLS field text to original |
| `orderpro/sql/db2/CUSMAS.sql` | Revert LABEL ON COLUMN text |
| `orderpro/docs/operations-guide.md` | Revert Cutoff Policy and Customer Classes sections |

---

## 11. Traceability Matrix

| CHG-0042 Requirement | Finding(s) |
|---|---|
| Preferred customer cutoff = 18:00 | ORDPRC.rpgle CHKORDCTF, orders.js cutoffHour |
| Standard customer cutoff unchanged | orders.js cutoffHour, regression cutoff tests |
| Batch window must not drop 18:00 orders | FULMNT.clle SCDTIME (INFERRED collision) |
| CUSCLS documentation corrected | CUSMAS.dds, Db2 DDL LABEL ON |
| Operations guide updated | operations-guide.md Cutoff Policy section |
| Regression tests added | orders.test.js, cutoff.test.js |

---
