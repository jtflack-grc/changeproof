**free
ctl-opt option(*srcstmt : *nodebugio) dftactgrp(*no) actgrp('ORDERPRO');

// -------------------------------------------------------------------------
// ORDPRC - Core Order Processing Program
// ORDERPRO application - IBM i RPGLE
//
// Validates cutoff windows and allocates inventory for incoming orders.
// -------------------------------------------------------------------------

dcl-s CUSNUM packed(7:0);
dcl-s CUSCLS char(1);
dcl-s ORDTYP char(1);
dcl-s ORDTIM packed(6:0);
dcl-s ITMNUM char(7);
dcl-s LINQTY packed(5:0);
dcl-s RESULT char(1) inz('0');

dcl-pr CHKORDCTF char(1);
  inOrdTyp char(1) const;
  inCusCls char(1) const;
  inOrdTim packed(6:0) const;
end-pr;

dcl-pr ALCINV char(1);
  inItmNum char(7) const;
  inQty packed(5:0) const;
end-pr;

// Main processing flow
// In production these values arrive from entry parameters / database state.
RESULT = CHKORDCTF(ORDTYP : CUSCLS : ORDTIM);

if RESULT = '1';
  RESULT = ALCINV(ITMNUM : LINQTY);
endif;

*inlr = *on;
return;

// -------------------------------------------------------------------------
// CHKORDCTF - Validate expedited order cutoff window
//
// CHG-0042: Preferred customers have an extended expedited cutoff of 18:00.
// Standard customers retain the existing 16:00 cutoff.
// -------------------------------------------------------------------------
dcl-proc CHKORDCTF;
  dcl-pi *n char(1);
    inOrdTyp char(1) const;
    inCusCls char(1) const;
    inOrdTim packed(6:0) const;
  end-pi;

  dcl-s cutoff packed(6:0) inz(160000);

  // Non-expedited orders are not subject to this intraday cutoff.
  if inOrdTyp <> 'E';
    return '1';
  endif;

  if inCusCls = 'P';
    cutoff = 180000;
  else;
    cutoff = 160000;
  endif;

  if inOrdTim <= cutoff;
    return '1';
  endif;

  return '0';
end-proc;

// -------------------------------------------------------------------------
// ALCINV - Allocate inventory
// -------------------------------------------------------------------------
dcl-proc ALCINV;
  dcl-pi *n char(1);
    inItmNum char(7) const;
    inQty packed(5:0) const;
  end-pi;

  // Simplified brownfield example: real program would CHAIN INVMAS and
  // update QTYAVL/QTYALC under commitment control.
  if inQty <= 0;
    return '0';
  endif;

  return '1';
end-proc;
