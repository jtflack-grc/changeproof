# ChangeProof Evidence Pack

_Generated: 2026-08-28T16:40:18.360Z_


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

**Total findings:** 83

| evidenceBasis | count |
|---|---|
| OBSERVED_SOURCE | 62 |
| EXECUTED_LOCAL | 21 |

| status | count |
|---|---|
| TARGET_VALIDATION_REQUIRED | 37 |
| RESOLVED | 46 |

| validationTarget | count |
|---|---|
| IBM_I | 37 |
| LOCAL | 46 |

---

## 3. Blast Radius

_83 total findings — showing primary representative per artifact. Full set in `traceability.json`._

| Artifact | Symbol | evidenceBasis | status | validationTarget |
|---|---|---|---|---|
| `orderpro/rpgle/ORDPRC.rpgle` | comment | [OBSERVED_SOURCE] | [TARGET_VALIDATION_REQUIRED] | [IBM_I] |
| `orderpro/clle/FULMNT.clle` | ORDERPRO/FULMNT | [OBSERVED_SOURCE] | [TARGET_VALIDATION_REQUIRED] | [IBM_I] |
| `orderpro/dds/CUSMAS.dds` | CUSCLS | [OBSERVED_SOURCE] | [RESOLVED] | [LOCAL] |
| `orderpro/dds/ORDHED.dds` | ORDTYP | [OBSERVED_SOURCE] | [RESOLVED] | [LOCAL] |
| `orderpro/sql/db2/CUSMAS.sql` | CUSCLS | [OBSERVED_SOURCE] | [TARGET_VALIDATION_REQUIRED] | [IBM_I] |
| `orderpro/sql/db2/ORDHED.sql` | ORDTYP | [OBSERVED_SOURCE] | [TARGET_VALIDATION_REQUIRED] | [IBM_I] |
| `orderpro/docs/operations-guide.md` | 0042 | [OBSERVED_SOURCE] | [RESOLVED] | [LOCAL] |
| `api/src/routes/orders.js` | cutoffHour | [OBSERVED_SOURCE] | [RESOLVED] | [LOCAL] |
| `api/src/adapters/mock-adapter.js` | cutoff | [OBSERVED_SOURCE] | [RESOLVED] | [LOCAL] |
| `orderpro/sql/sqlite/orderpro.db` | CUSCLS=P | [EXECUTED_LOCAL] | [RESOLVED] | [LOCAL] |
| `orderpro/sql/sqlite/orderpro.db` | CUSCLS=S | [EXECUTED_LOCAL] | [RESOLVED] | [LOCAL] |

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
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:5`
- **comment** — comment 'comment' = Cutoff per CHG-0042 (supersedes spec ORD-001 dated 2019-03-15) — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:7`
- **comment** — comment 'comment' = Prototype: Check Order Cutoff — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:13`
- **comment** — comment 'comment' = Procedure: CHKORDCTF - Check Order Cutoff Time — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:27`
- **comment** — comment 'comment' = Returns *OFF if the cutoff time has passed. — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:29`
- **comment** — comment 'comment' = Cutoff rules (CHG-0042): — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:31`
- **comment** — comment 'comment' = Preferred customers (CUSCLS = 'P'): expedited cutoff = 18:00:00 — keywords: cutoff, preferred, expedited, CUSCLS, P
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:32`
- **comment** — comment 'comment' = Standard customers  (CUSCLS = 'S'): expedited cutoff = 16:00:00 — keywords: cutoff, expedited, CUSCLS
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:33`
- **comment** — comment 'comment' = Standard orders: no intraday cutoff restriction. — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:34`
- **comment** — comment 'comment' = Only expedited orders are subject to the cutoff window — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:46`
- **e** — condition literal 'e' = 'e' — keywords: E
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:47`
- **comment** — comment 'comment' = CHG-0042: Preferred customers have extended cutoff of 18:00:00 — keywords: cutoff, preferred
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:48`
- **p** — condition literal 'p' = 'p' — keywords: P
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:49`
- **comment** — comment 'comment' = Preferred customer cutoff: 18:00:00 — keywords: cutoff, preferred
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:50`
- **comment** — comment 'comment' = Standard customer cutoff: 16:00:00 — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:52`
- **comment** — comment 'comment' = Cutoff exceeded - order rejected — keywords: cutoff
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/rpgle/ORDPRC.rpgle:58`

### orderpro/clle/FULMNT.clle

- **comment** — comment 'comment' = FULMNT - Fulfillment Batch Job — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:2`
- **comment** — comment 'comment' = Processes open expedited orders at end of business day. — keywords: expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:5`
- **comment** — comment 'comment' = CHG-0042: Batch rescheduled to 18:15 to avoid collision with — keywords: batch
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:8`
- **comment** — comment 'comment' = the new 18:00 Preferred customer expedited order cutoff. — keywords: cutoff, preferred, expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:9`
- **comment** — comment 'comment' = the batch run executes. — keywords: batch
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:11`
- **comment** — comment 'comment' = Read all order header records and process open expedited orders — keywords: expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:31`
- **comment** — comment 'comment' = Process only Open Expedited orders — keywords: expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:35`
- **ORDERPRO/ORDPRC** — call 'ORDERPRO/ORDPRC' — keywords: ORDTYP
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:39`
- **comment** — comment 'comment' = Job submission — schedule next run — keywords: schedule
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:66`
- **comment** — comment 'comment' = CHG-0042: moved from 18:00 to 18:15 to ensure all Preferred — keywords: preferred
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:67`
- **comment** — comment 'comment' = customer expedited orders (cutoff 18:00) are captured before — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:68`
- **comment** — comment 'comment' = the batch run executes. — keywords: batch
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:69`
- **ORDERPRO/FULMNT** — call 'ORDERPRO/FULMNT' — keywords: cutoff, preferred, SCDTIME
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/clle/FULMNT.clle:73`

### orderpro/dds/CUSMAS.dds

- **CUSCLS** — field 'CUSCLS' = Customer Class S=Standard P=Preferred — keywords: preferred, CUSCLS
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/dds/CUSMAS.dds:6`

### orderpro/dds/ORDHED.dds

- **ORDTYP** — field 'ORDTYP' = Order Type E=Expedited S=Standard — keywords: expedited, ORDTYP
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/dds/ORDHED.dds:7`

### orderpro/sql/db2/CUSMAS.sql

- **CUSCLS** — column 'CUSCLS' = CHAR — keywords: CUSCLS
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/sql/db2/CUSMAS.sql:11`
- **CUSCLS** — column 'CUSCLS' = TEXT — keywords: preferred, CUSCLS
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/sql/db2/CUSMAS.sql:24`
- **comment** — comment 'comment' = CUSCLS label updated per CHG-0042: P=Preferred replaces legacy B=Business designation. — keywords: preferred, CUSCLS
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/sql/db2/CUSMAS.sql:28`

### orderpro/sql/db2/ORDHED.sql

- **ORDTYP** — column 'ORDTYP' = CHAR — keywords: ORDTYP
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/sql/db2/ORDHED.sql:11`
- **ORDTYP** — column 'ORDTYP' = TEXT — keywords: expedited, ORDTYP
  - [OBSERVED_SOURCE] [TARGET_VALIDATION_REQUIRED] [IBM_I]
  - `orderpro/sql/db2/ORDHED.sql:27`

### orderpro/docs/operations-guide.md

- **0042** — time expression '0042' = 0042 — keywords: cutoff, preferred, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:6`
- **allocates inventory, and triggers end-of-day batch fulfillment processing.** — sentence 'allocates inventory, and triggers end-of-day batch fulfillment processing.' = allocates inventory, and triggers end-of-day batch fulfillment processing. — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:14`
- **`E`  | Expedited — priority fulfilment, subject to cutoff window |** — list item '`E`  | Expedited — priority fulfilment, subject to cutoff window |' = | `E`  | Expedited — priority fulfilment, subject to cutoff window | — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:25`
- **`S`  | Standard — normal processing, no intraday cutoff |** — list item '`S`  | Standard — normal processing, no intraday cutoff |' = | `S`  | Standard — normal processing, no intraday cutoff | — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:26`
- **Customers are classified at account setup and stored in the `CUSCLS` field** — sentence 'Customers are classified at account setup and stored in the `CUSCLS` field' = Customers are classified at account setup and stored in the `CUSCLS` field — keywords: CUSCLS
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:32`
- **`P`  | Preferred — top-tier accounts with extended service levels |** — list item '`P`  | Preferred — top-tier accounts with extended service levels |' = | `P`  | Preferred — top-tier accounts with extended service levels | — keywords: preferred
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:38`
- **Customer class determines the applicable expedited order cutoff time.** — sentence 'Customer class determines the applicable expedited order cutoff time.' = Customer class determines the applicable expedited order cutoff time. — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:40`
- **See **Section 4 — Cutoff Policy** for details.** — sentence 'See **Section 4 — Cutoff Policy** for details.' = See **Section 4 — Cutoff Policy** for details. — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:41`
- **4. Cutoff Policy** — heading '4. Cutoff Policy' = ## — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:45`
- **Expedited orders must be submitted by the applicable cutoff time. Orders** — sentence 'Expedited orders must be submitted by the applicable cutoff time. Orders' = Expedited orders must be submitted by the applicable cutoff time. Orders — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:47`
- **4001** — time expression '4001' = 4001 — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:48`
- **Standard orders have no intraday submission cutoff.** — sentence 'Standard orders have no intraday submission cutoff.' = Standard orders have no intraday submission cutoff. — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:50`
- **Customer Class | Expedited Cutoff | Notes |** — list item 'Customer Class | Expedited Cutoff | Notes |' = | Customer Class | Expedited Cutoff | Notes | — keywords: cutoff, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:52`
- **6:00 PM** — time expression '6:00 PM' = 6:00 PM — keywords: preferred
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:55`
- **0042** — time expression '0042' = 0042 — keywords: preferred, expedited, CUSCLS, P
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:57`
- **> and the batch fulfillment schedule.** — sentence '> and the batch fulfillment schedule.' = > and the batch fulfillment schedule. — keywords: batch, fulfillment, schedule
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:60`
- **5. Batch Processing** — heading '5. Batch Processing' = ## — keywords: batch
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:64`
- **The end-of-day fulfillment batch job (`FULMNT`) runs automatically at** — sentence 'The end-of-day fulfillment batch job (`FULMNT`) runs automatically at' = The end-of-day fulfillment batch job (`FULMNT`) runs automatically at — keywords: batch, fulfillment
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:66`
- **0042** — time expression '0042' = 0042 — keywords: batch, schedule
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:69`
- **18:00** — time expression '18:00' = 18:00 — keywords: preferred, expedited
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:70`
- **> in the queue before the batch run begins.** — sentence '> in the queue before the batch run begins.' = > in the queue before the batch run begins. — keywords: batch
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:71`
- **The batch job reads all open expedited orders from `ORDHED` and calls the** — sentence 'The batch job reads all open expedited orders from `ORDHED` and calls the' = The batch job reads all open expedited orders from `ORDHED` and calls the — keywords: expedited, batch
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:73`
- **18:15 ** — time expression '18:15 ' = 18:15  — keywords: schedule, SCDTIME
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:78`
- **4001** — time expression '4001' = 4001 — keywords: cutoff
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `orderpro/docs/operations-guide.md:98`

### api/src/routes/orders.js

- **cutoffHour** — function 'cutoffHour' — keywords: CUSCLS, P
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `api/src/routes/orders.js:34`

### api/src/adapters/mock-adapter.js

- **cutoff** — function 'cutoff' — keywords: cutoff, CUSCLS, P
  - [OBSERVED_SOURCE] [RESOLVED] [LOCAL]
  - `api/src/adapters/mock-adapter.js:89`


---

## 6. Test Results

**16 passing · 0 failing · 3 skipped/pending**

| Test | Status | evidenceBasis |
|---|---|---|
| POST /orders accepts a valid standard order well before cutoff | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders rejects a request with missing required fields | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders rejects an expedited order submitted after cutoff (hour=17) | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders accepts an expedited order submitted before cutoff (hour=15) | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders accepts Preferred customer expedited order at 17:00 (CHG-0042) | [RESOLVED] | [EXECUTED_LOCAL] |
| POST /orders rejects Preferred customer expedited order at 19:00 (after 18:00 cutoff) | [RESOLVED] | [EXECUTED_LOCAL] |
| GET /orders/:id returns 404 for an unknown order | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Standard customer expedited order at 15:00 is accepted | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Standard customer expedited order at 17:00 is rejected | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Preferred customer expedited order at 17:00 should be accepted (CHG-0042) | [RESOLVED] | [EXECUTED_LOCAL] |
| Cutoff regression — CHG-0042 Preferred customer expedited order at 19:00 is rejected | [RESOLVED] | [EXECUTED_LOCAL] |
| Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042 | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule | [TARGET_VALIDATION_REQUIRED] | [EXECUTED_LOCAL] |
| GET /customers/:id returns customer data for a known Preferred customer | [RESOLVED] | [EXECUTED_LOCAL] |
| GET /customers/:id returns 404 for an unknown customer | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Order for in-stock item is accepted | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Customer lookup returns correct class for Preferred customer | [RESOLVED] | [EXECUTED_LOCAL] |
| Inventory allocation regression Inactive customer data is present in surrogate | [RESOLVED] | [EXECUTED_LOCAL] |

---

## 7. Test Gaps

_No test gaps identified._


---

## 8. Documentation Gaps

- [OBSERVED_SOURCE] **0042** — time expression '0042' = 0042 — keywords: cutoff, preferred, expedited
  - `orderpro/docs/operations-guide.md:6`
- [OBSERVED_SOURCE] **allocates inventory, and triggers end-of-day batch fulfillment processing.** — sentence 'allocates inventory, and triggers end-of-day batch fulfillment processing.' = allocates inventory, and triggers end-of-day batch fulfillment processing. — keywords: batch, fulfillment
  - `orderpro/docs/operations-guide.md:14`
- [OBSERVED_SOURCE] **`E`  | Expedited — priority fulfilment, subject to cutoff window |** — list item '`E`  | Expedited — priority fulfilment, subject to cutoff window |' = | `E`  | Expedited — priority fulfilment, subject to cutoff window | — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:25`
- [OBSERVED_SOURCE] **`S`  | Standard — normal processing, no intraday cutoff |** — list item '`S`  | Standard — normal processing, no intraday cutoff |' = | `S`  | Standard — normal processing, no intraday cutoff | — keywords: cutoff
  - `orderpro/docs/operations-guide.md:26`
- [OBSERVED_SOURCE] **Customers are classified at account setup and stored in the `CUSCLS` field** — sentence 'Customers are classified at account setup and stored in the `CUSCLS` field' = Customers are classified at account setup and stored in the `CUSCLS` field — keywords: CUSCLS
  - `orderpro/docs/operations-guide.md:32`
- [OBSERVED_SOURCE] **`P`  | Preferred — top-tier accounts with extended service levels |** — list item '`P`  | Preferred — top-tier accounts with extended service levels |' = | `P`  | Preferred — top-tier accounts with extended service levels | — keywords: preferred
  - `orderpro/docs/operations-guide.md:38`
- [OBSERVED_SOURCE] **Customer class determines the applicable expedited order cutoff time.** — sentence 'Customer class determines the applicable expedited order cutoff time.' = Customer class determines the applicable expedited order cutoff time. — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:40`
- [OBSERVED_SOURCE] **See **Section 4 — Cutoff Policy** for details.** — sentence 'See **Section 4 — Cutoff Policy** for details.' = See **Section 4 — Cutoff Policy** for details. — keywords: cutoff
  - `orderpro/docs/operations-guide.md:41`
- [OBSERVED_SOURCE] **4. Cutoff Policy** — heading '4. Cutoff Policy' = ## — keywords: cutoff
  - `orderpro/docs/operations-guide.md:45`
- [OBSERVED_SOURCE] **Expedited orders must be submitted by the applicable cutoff time. Orders** — sentence 'Expedited orders must be submitted by the applicable cutoff time. Orders' = Expedited orders must be submitted by the applicable cutoff time. Orders — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:47`
- [OBSERVED_SOURCE] **4001** — time expression '4001' = 4001 — keywords: cutoff
  - `orderpro/docs/operations-guide.md:48`
- [OBSERVED_SOURCE] **Standard orders have no intraday submission cutoff.** — sentence 'Standard orders have no intraday submission cutoff.' = Standard orders have no intraday submission cutoff. — keywords: cutoff
  - `orderpro/docs/operations-guide.md:50`
- [OBSERVED_SOURCE] **Customer Class | Expedited Cutoff | Notes |** — list item 'Customer Class | Expedited Cutoff | Notes |' = | Customer Class | Expedited Cutoff | Notes | — keywords: cutoff, expedited
  - `orderpro/docs/operations-guide.md:52`
- [OBSERVED_SOURCE] **6:00 PM** — time expression '6:00 PM' = 6:00 PM — keywords: preferred
  - `orderpro/docs/operations-guide.md:55`
- [OBSERVED_SOURCE] **0042** — time expression '0042' = 0042 — keywords: preferred, expedited, CUSCLS, P
  - `orderpro/docs/operations-guide.md:57`
- [OBSERVED_SOURCE] **> and the batch fulfillment schedule.** — sentence '> and the batch fulfillment schedule.' = > and the batch fulfillment schedule. — keywords: batch, fulfillment, schedule
  - `orderpro/docs/operations-guide.md:60`
- [OBSERVED_SOURCE] **5. Batch Processing** — heading '5. Batch Processing' = ## — keywords: batch
  - `orderpro/docs/operations-guide.md:64`
- [OBSERVED_SOURCE] **The end-of-day fulfillment batch job (`FULMNT`) runs automatically at** — sentence 'The end-of-day fulfillment batch job (`FULMNT`) runs automatically at' = The end-of-day fulfillment batch job (`FULMNT`) runs automatically at — keywords: batch, fulfillment
  - `orderpro/docs/operations-guide.md:66`
- [OBSERVED_SOURCE] **0042** — time expression '0042' = 0042 — keywords: batch, schedule
  - `orderpro/docs/operations-guide.md:69`
- [OBSERVED_SOURCE] **18:00** — time expression '18:00' = 18:00 — keywords: preferred, expedited
  - `orderpro/docs/operations-guide.md:70`
- [OBSERVED_SOURCE] **> in the queue before the batch run begins.** — sentence '> in the queue before the batch run begins.' = > in the queue before the batch run begins. — keywords: batch
  - `orderpro/docs/operations-guide.md:71`
- [OBSERVED_SOURCE] **The batch job reads all open expedited orders from `ORDHED` and calls the** — sentence 'The batch job reads all open expedited orders from `ORDHED` and calls the' = The batch job reads all open expedited orders from `ORDHED` and calls the — keywords: expedited, batch
  - `orderpro/docs/operations-guide.md:73`
- [OBSERVED_SOURCE] **18:15 ** — time expression '18:15 ' = 18:15  — keywords: schedule, SCDTIME
  - `orderpro/docs/operations-guide.md:78`
- [OBSERVED_SOURCE] **4001** — time expression '4001' = 4001 — keywords: cutoff
  - `orderpro/docs/operations-guide.md:98`

---

## 9. IBM i Validation Boundary

Conservative implementation options: `idb-connector` (ODBC), `itoolkit`/XMLSERVICE, SSH + CRTBNDRPG, `QSYS2.QCMDEXC` via ODBC.

- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Handles order cutoff validation and inventory allocation. — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Cutoff per CHG-0042 (supersedes spec ORD-001 dated 2019-03-15) — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Prototype: Check Order Cutoff — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Procedure: CHKORDCTF - Check Order Cutoff Time — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Returns *OFF if the cutoff time has passed. — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Cutoff rules (CHG-0042): — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Preferred customers (CUSCLS = 'P'): expedited cutoff = 18:00:00 — keywords: cutoff, preferred, expedited, CUSCLS, P
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Standard customers  (CUSCLS = 'S'): expedited cutoff = 16:00:00 — keywords: cutoff, expedited, CUSCLS
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Standard orders: no intraday cutoff restriction. — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Only expedited orders are subject to the cutoff window — keywords: cutoff, expedited
- `orderpro/rpgle/ORDPRC.rpgle` — **e**: condition literal 'e' = 'e' — keywords: E
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = CHG-0042: Preferred customers have extended cutoff of 18:00:00 — keywords: cutoff, preferred
- `orderpro/rpgle/ORDPRC.rpgle` — **p**: condition literal 'p' = 'p' — keywords: P
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Preferred customer cutoff: 18:00:00 — keywords: cutoff, preferred
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Standard customer cutoff: 16:00:00 — keywords: cutoff
- `orderpro/rpgle/ORDPRC.rpgle` — **comment**: comment 'comment' = Cutoff exceeded - order rejected — keywords: cutoff
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = FULMNT - Fulfillment Batch Job — keywords: batch, fulfillment
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Processes open expedited orders at end of business day. — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = CHG-0042: Batch rescheduled to 18:15 to avoid collision with — keywords: batch
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = the new 18:00 Preferred customer expedited order cutoff. — keywords: cutoff, preferred, expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = the batch run executes. — keywords: batch
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Read all order header records and process open expedited orders — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Process only Open Expedited orders — keywords: expedited
- `orderpro/clle/FULMNT.clle` — **ORDERPRO/ORDPRC**: call 'ORDERPRO/ORDPRC' — keywords: ORDTYP
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = Job submission — schedule next run — keywords: schedule
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = CHG-0042: moved from 18:00 to 18:15 to ensure all Preferred — keywords: preferred
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = customer expedited orders (cutoff 18:00) are captured before — keywords: cutoff, expedited
- `orderpro/clle/FULMNT.clle` — **comment**: comment 'comment' = the batch run executes. — keywords: batch
- `orderpro/clle/FULMNT.clle` — **ORDERPRO/FULMNT**: call 'ORDERPRO/FULMNT' — keywords: cutoff, preferred, SCDTIME
- `orderpro/sql/db2/CUSMAS.sql` — **CUSCLS**: column 'CUSCLS' = CHAR — keywords: CUSCLS
- `orderpro/sql/db2/CUSMAS.sql` — **CUSCLS**: column 'CUSCLS' = TEXT — keywords: preferred, CUSCLS
- `orderpro/sql/db2/CUSMAS.sql` — **comment**: comment 'comment' = CUSCLS label updated per CHG-0042: P=Preferred replaces legacy B=Business designation. — keywords: preferred, CUSCLS
- `orderpro/sql/db2/ORDHED.sql` — **ORDTYP**: column 'ORDTYP' = CHAR — keywords: ORDTYP
- `orderpro/sql/db2/ORDHED.sql` — **ORDTYP**: column 'ORDTYP' = TEXT — keywords: expedited, ORDTYP
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

## 12. Diff Summary (Pre → Post Change)

| Category | Count |
|---|---|
| Resolved | 39 |
| Persisted (still open) | 0 |
| Target validation required | 26 |
| New findings | 23 |

**Resolved:**
- ✅ `orderpro/dds/CUSMAS.dds` — CUSCLS
- ✅ `orderpro/dds/ORDHED.dds` — ORDTYP
- ✅ `orderpro/docs/operations-guide.md` — allocates inventory, and triggers end-of-day batch fulfillment processing.
- ✅ `orderpro/docs/operations-guide.md` — `E`  | Expedited — priority fulfilment, subject to cutoff window |
- ✅ `orderpro/docs/operations-guide.md` — `S`  | Standard — normal processing, no intraday cutoff |
- ✅ `orderpro/docs/operations-guide.md` — Customers are classified at account setup and stored in the `CUSCLS` field
- ✅ `orderpro/docs/operations-guide.md` — Customer class does not alter the documented expedited order cutoff time.
- ✅ `orderpro/docs/operations-guide.md` — 4. Cutoff Policy
- ✅ `orderpro/docs/operations-guide.md` — Expedited orders must be submitted by the applicable cutoff time. Orders
- ✅ `orderpro/docs/operations-guide.md` — 4001
- ✅ `orderpro/docs/operations-guide.md` — Standard orders have no intraday submission cutoff.
- ✅ `orderpro/docs/operations-guide.md` — Customer Class | Expedited Cutoff | Notes |
- ✅ `orderpro/docs/operations-guide.md` — 4:00 PM
- ✅ `orderpro/docs/operations-guide.md` — 5. Batch Processing
- ✅ `orderpro/docs/operations-guide.md` — The end-of-day fulfillment batch job (`FULMNT`) runs automatically at
- ✅ `orderpro/docs/operations-guide.md` — 4:00 PM
- ✅ `orderpro/docs/operations-guide.md` — The batch job reads all open expedited orders from `ORDHED` and calls the
- ✅ `orderpro/docs/operations-guide.md` — 18:00 
- ✅ `orderpro/docs/operations-guide.md` — 4001
- ✅ `api/src/routes/orders.js` — cutoffHour
- ✅ `api/src/adapters/mock-adapter.js` — cutoff
- ✅ `orderpro/sql/sqlite/orderpro.db` — CUSCLS=P
- ✅ `orderpro/sql/sqlite/orderpro.db` — CUSCLS=S
- ✅ `api/tests/orders.test.js` — POST /orders accepts a valid standard order well before cutoff
- ✅ `api/tests/orders.test.js` — POST /orders rejects a request with missing required fields
- ✅ `api/tests/orders.test.js` — POST /orders rejects an expedited order submitted after cutoff (hour=17)
- ✅ `api/tests/orders.test.js` — POST /orders accepts an expedited order submitted before cutoff (hour=15)
- ✅ `api/tests/orders.test.js` — POST /orders accepts Preferred customer expedited order at 17:00 (CHG-0042)
- ✅ `api/tests/orders.test.js` — POST /orders rejects Preferred customer expedited order at 19:00 (after 18:00 cutoff)
- ✅ `api/tests/orders.test.js` — GET /orders/:id returns 404 for an unknown order
- ✅ `tests/regression/cutoff.test.js` — Cutoff regression — CHG-0042 Standard customer expedited order at 15:00 is accepted
- ✅ `tests/regression/cutoff.test.js` — Cutoff regression — CHG-0042 Standard customer expedited order at 17:00 is rejected
- ✅ `tests/regression/cutoff.test.js` — Cutoff regression — CHG-0042 Preferred customer expedited order at 17:00 should be accepted (CHG-0042)
- ✅ `tests/regression/cutoff.test.js` — Cutoff regression — CHG-0042 Preferred customer expedited order at 19:00 is rejected
- ✅ `tests/regression/inventory.test.js` — Inventory allocation regression Order for in-stock item is accepted
- ✅ `tests/regression/inventory.test.js` — Inventory allocation regression Customer lookup returns correct class for Preferred customer
- ✅ `tests/regression/inventory.test.js` — Inventory allocation regression Inactive customer data is present in surrogate
- ✅ `api/tests/customers.test.js` — GET /customers/:id returns customer data for a known Preferred customer
- ✅ `api/tests/customers.test.js` — GET /customers/:id returns 404 for an unknown customer

**Target validation required (IBM_I):**
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Handles order cutoff validation and inventory allocation. — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Cutoff per CHG-0042 (supersedes spec ORD-001 dated 2019-03-15) — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Prototype: Check Order Cutoff — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Procedure: CHKORDCTF - Check Order Cutoff Time — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Returns *OFF if the cutoff time has passed. — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Cutoff rules (CHG-0042): — keywords: cutoff
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Preferred customers (CUSCLS = 'P'): expedited cutoff = 18:00:00 — keywords: cutoff, preferred, expedited, CUSCLS, P
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — e: condition literal 'e' = 'e' — keywords: E
- 🟠 `orderpro/rpgle/ORDPRC.rpgle` — comment: comment 'comment' = Standard customers  (CUSCLS = 'S'): expedited cutoff = 16:00:00 — keywords: cutoff, expedited, CUSCLS
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = FULMNT - Fulfillment Batch Job — keywords: batch, fulfillment
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = Processes open expedited orders at end of business day. — keywords: expedited
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = CHG-0042: Batch rescheduled to 18:15 to avoid collision with — keywords: batch
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = the batch run executes. — keywords: batch
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = the new 18:00 Preferred customer expedited order cutoff. — keywords: cutoff, preferred, expedited
- 🟠 `orderpro/clle/FULMNT.clle` — ORDERPRO/ORDPRC: call 'ORDERPRO/ORDPRC' — keywords: ORDTYP
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = Read all order header records and process open expedited orders — keywords: expedited
- 🟠 `orderpro/clle/FULMNT.clle` — comment: comment 'comment' = Process only Open Expedited orders — keywords: expedited
- 🟠 `orderpro/clle/FULMNT.clle` — ORDERPRO/FULMNT: call 'ORDERPRO/FULMNT' — keywords: cutoff, preferred, SCDTIME
- 🟠 `orderpro/sql/db2/CUSMAS.sql` — CUSCLS: column 'CUSCLS' = CHAR — keywords: CUSCLS
- 🟠 `orderpro/sql/db2/CUSMAS.sql` — CUSCLS: column 'CUSCLS' = TEXT — keywords: preferred, CUSCLS
- 🟠 `orderpro/sql/db2/ORDHED.sql` — ORDTYP: column 'ORDTYP' = CHAR — keywords: ORDTYP
- 🟠 `orderpro/sql/db2/ORDHED.sql` — ORDTYP: column 'ORDTYP' = TEXT — keywords: expedited, ORDTYP
- 🟠 `orderpro/clle/FULMNT.clle` — SCDTIME(180000): Batch job FULMNT is scheduled at 180000 (18:00:00), which equals the new Preferred customer expedited cutoff introduced by CHG-0042. Orders submitted at or near 18:00 may not be captured before the batch run executes. Remediation: move SCDTIME to 181500 (18:15).
- 🟠 `tests/regression/batch.test.js` — Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary FULMNT completes within batch window after CHG-0042
- 🟠 `tests/regression/batch.test.js` — Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary ORDPRC compiles cleanly after CUSCLS branch addition
- 🟠 `tests/regression/batch.test.js` — Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule: SKIPPED (IBM_I boundary): Batch fulfillment — IBM_I validation boundary SCDTIME(181500) takes effect in production job schedule
