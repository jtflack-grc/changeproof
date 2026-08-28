# ORDERPRO Operations Guide

**Version:** 2.4  
**Last Updated:** 2024-11-15  
**Author:** R. Castellano, Systems Operations  
**Change:** CHG-0042 — Preferred customer expedited order cutoff extended to 18:00

---

## 1. System Overview

ORDERPRO is the core order-processing and inventory-allocation system running
on IBM i. It handles inbound customer orders, validates business rules,
allocates inventory, and triggers end-of-day batch fulfillment processing.

The system exposes a REST API facade (Node.js/Express) that translates HTTP
requests into IBM i program calls via the ORDERPRO adapter layer.

---

## 2. Order Types

| Code | Description |
|------|-------------|
| `E`  | Expedited — priority fulfilment, subject to cutoff window |
| `S`  | Standard — normal processing, no intraday cutoff |

---

## 3. Customer Classes

Customers are classified at account setup and stored in the `CUSCLS` field
of the Customer Master (`CUSMAS`).

| Code | Description |
|------|-------------|
| `S`  | Standard — default class for all new accounts |
| `P`  | Preferred — top-tier accounts with extended service levels |

Customer class determines the applicable expedited order cutoff time.
See **Section 4 — Cutoff Policy** for details.

---

## 4. Cutoff Policy

Expedited orders must be submitted by the applicable cutoff time. Orders
received after the cutoff will be rejected with error code `ORD-4001`.

Standard orders have no intraday submission cutoff.

| Customer Class | Expedited Cutoff | Notes |
|----------------|-----------------|-------|
| Standard (`S`) | 4:00 PM         | Unchanged |
| Preferred (`P`)| **6:00 PM**     | Extended per CHG-0042, effective 2024-11-15 |

> **CHG-0042:** Preferred customers (`CUSCLS = 'P'`) may now submit expedited
> orders until 6:00 PM local time. This change was approved by the Director of
> Customer Experience and applies to the IBM i ORDPRC program, the API facade,
> and the batch fulfillment schedule.

---

## 5. Batch Processing

The end-of-day fulfillment batch job (`FULMNT`) runs automatically at
**18:15 (6:15 PM)** each business day.

> **CHG-0042:** The batch schedule was moved from 18:00 to 18:15 to ensure
> all Preferred customer expedited orders (accepted up to 18:00) are captured
> in the queue before the batch run begins.

The batch job reads all open expedited orders from `ORDHED` and calls the
`ORDPRC` program to perform inventory allocation and status updates.

**Job name:** `FULMNT`  
**Job description:** `ORDERPRO/ORDJBD`  
**Schedule time:** `SCDTIME(181500)` — 18:15 daily  

---

## 6. Inventory Allocation

The `ALCINV` procedure within `ORDPRC` manages inventory allocation:

1. Checks `QTYAVL` (quantity available) in `INVMAS` against the order quantity.
2. If sufficient stock exists, decrements `QTYAVL` and increments `QTYALC`.
3. If stock is insufficient, the order is placed in Backorder status.

Inventory figures are updated in real time as orders are processed.

---

## 7. Error Handling

| Error Code | Meaning | Action |
|-----------|---------|--------|
| `ORD-4001` | Cutoff time exceeded | Reject order, notify customer |
| `ORD-4002` | Insufficient inventory | Create backorder, notify warehouse |
| `ORD-4003` | Invalid customer number | Reject order |
| `ORD-4004` | Invalid item number | Reject order line |

---

## 8. Support Contact

**Primary:** ORDERPRO Operations — ext. 4492  
**After-hours:** On-call via PagerDuty — ORDERPRO rotation  
**Application owner:** Marcus Webb, Supply Chain Systems
