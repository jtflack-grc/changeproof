-- =============================================================
-- ORDERPRO / ORDLIN  -  Order Lines
-- Db2 for i DDL  --  STATIC ANALYSIS TARGET ONLY
-- Not executed locally. For code archaeology and impact analysis.
-- =============================================================
CREATE TABLE ORDERPRO/ORDLIN (
    ORDNUM  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    LINNUM  DECIMAL(3, 0)    NOT NULL DEFAULT 0,
    ITMNUM  CHAR(7)          NOT NULL DEFAULT '',
    LINQTY  DECIMAL(5, 0)    NOT NULL DEFAULT 0,
    LINPRC  DECIMAL(9, 2)    NOT NULL DEFAULT 0,
    LINAMT  DECIMAL(9, 2)    NOT NULL DEFAULT 0,
    CONSTRAINT ORDLIN_PK PRIMARY KEY (ORDNUM, LINNUM),
    CONSTRAINT ORDLIN_ORD FOREIGN KEY (ORDNUM)
        REFERENCES ORDERPRO/ORDHED (ORDNUM)
) ;

LABEL ON TABLE ORDERPRO/ORDLIN
    IS 'Order Lines' ;

LABEL ON COLUMN ORDERPRO/ORDLIN
( ORDNUM TEXT IS 'Order Number' ,
  LINNUM TEXT IS 'Line Number' ,
  ITMNUM TEXT IS 'Item Number' ,
  LINQTY TEXT IS 'Line Quantity' ,
  LINPRC TEXT IS 'Line Unit Price' ,
  LINAMT TEXT IS 'Line Amount' ) ;
