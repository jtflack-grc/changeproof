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
