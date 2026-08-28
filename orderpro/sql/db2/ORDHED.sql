-- =============================================================
-- ORDERPRO / ORDHED  -  Order Header
-- Db2 for i DDL  --  STATIC ANALYSIS TARGET ONLY
-- Not executed locally. For code archaeology and impact analysis.
-- =============================================================
CREATE TABLE ORDERPRO/ORDHED (
    ORDNUM  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    CUSNUM  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    ORDDAT  DECIMAL(8, 0)    NOT NULL DEFAULT 0,
    ORDTIM  DECIMAL(6, 0)    NOT NULL DEFAULT 0,
    ORDTYP  CHAR(1)          NOT NULL DEFAULT 'S',
    ORDSTS  CHAR(1)          NOT NULL DEFAULT 'O',
    ORDTOT  DECIMAL(9, 2)    NOT NULL DEFAULT 0,
    CONSTRAINT ORDHED_PK PRIMARY KEY (ORDNUM),
    CONSTRAINT ORDHED_CUS FOREIGN KEY (CUSNUM)
        REFERENCES ORDERPRO/CUSMAS (CUSNUM)
) ;

LABEL ON TABLE ORDERPRO/ORDHED
    IS 'Order Header' ;

LABEL ON COLUMN ORDERPRO/ORDHED
( ORDNUM TEXT IS 'Order Number' ,
  CUSNUM TEXT IS 'Customer Number' ,
  ORDDAT TEXT IS 'Order Date YYYYMMDD' ,
  ORDTIM TEXT IS 'Order Time HHMMSS' ,
  ORDTYP TEXT IS 'Order Type E=Expedited S=Standard' ,
  ORDSTS TEXT IS 'Order Status O=Open F=Fulfilled C=Cancelled' ,
  ORDTOT TEXT IS 'Order Total Amount' ) ;
