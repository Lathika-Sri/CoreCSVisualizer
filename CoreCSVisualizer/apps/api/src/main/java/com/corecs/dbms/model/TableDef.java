package com.corecs.dbms.model; import java.util.*; public record TableDef(String name,List<ColumnDef> columns,List<List<String>> rows) {}
