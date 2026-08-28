-- =============================================================
-- ORDERPRO / CUSMAS  -  Customer Master
-- Db2 for i DDL  --  STATIC ANALYSIS TARGET ONLY
-- Not executed locally. For code archaeology and impact analysis.
-- =============================================================
SET OPTION NAMING = *SYS;

CREATE TABLE ORDERPRO/CUSMAS (
    CUSNUM  DECIMAL(7, 0)    NOT NULL DEFAULT 0,
    CUSNAM  CHAR(40)         NOT NULL DEFAULT '',
    CUSADR  CHAR(50)         NOT NULL DEFAULT '',
    CUSCLS  CHAR(1)          NOT NULL DEFAULT 'S',
    CUSCRL  DECIMAL(9, 2)    NOT NULL DEFAULT 0,
    CUSSTT  CHAR(1)          NOT NULL DEFAULT 'A',
    CONSTRAINT CUSMAS_PK PRIMARY KEY (CUSNUM)
) ;

LABEL ON TABLE ORDERPRO/CUSMAS
    IS 'Customer Master' ;

LABEL ON COLUMN ORDERPRO/CUSMAS
( CUSNUM TEXT IS 'Customer Number' ,
  CUSNAM TEXT IS 'Customer Name' ,
  CUSADR TEXT IS 'Customer Address' ,
  CUSCLS TEXT IS 'Customer Class S=Standard P=Preferred' ,
  CUSCRL TEXT IS 'Customer Credit Limit' ,
  CUSSTT TEXT IS 'Customer Status A=Active I=Inactive' ) ;

-- CUSCLS label updated per CHG-0042: P=Preferred replaces legacy B=Business designation.
