-- =============================================================
-- ORDERPRO / INVMAS  -  Inventory Master
-- Db2 for i DDL  --  STATIC ANALYSIS TARGET ONLY
-- Not executed locally. For code archaeology and impact analysis.
-- =============================================================
CREATE TABLE ORDERPRO/INVMAS (
    ITMNUM  CHAR(7)          NOT NULL DEFAULT '',
    ITMDSC  CHAR(30)         NOT NULL DEFAULT '',
    QTYOH   DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    QTYALC  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    QTYAVL  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    ITMSTS  CHAR(1)          NOT NULL DEFAULT 'A',
    CONSTRAINT INVMAS_PK PRIMARY KEY (ITMNUM)
) ;

LABEL ON TABLE ORDERPRO/INVMAS
    IS 'Inventory Master' ;

LABEL ON COLUMN ORDERPRO/INVMAS
( ITMNUM TEXT IS 'Item Number' ,
  ITMDSC TEXT IS 'Item Description' ,
  QTYOH  TEXT IS 'Quantity On Hand' ,
  QTYALC TEXT IS 'Quantity Allocated' ,
  QTYAVL TEXT IS 'Quantity Available' ,
  ITMSTS TEXT IS 'Item Status A=Active D=Discontinued' ) ;
