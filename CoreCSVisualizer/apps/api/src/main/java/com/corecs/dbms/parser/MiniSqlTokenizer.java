package com.corecs.dbms.parser;
import java.util.*;import java.util.regex.*;
public class MiniSqlTokenizer { public List<String> tokenize(String sql){if(sql==null||sql.isBlank())throw new IllegalArgumentException("SQL query is empty");var m=Pattern.compile("'([^']*)'|([(),=*<>])|([A-Za-z_][A-Za-z0-9_]*)|([0-9]+)|(;)").matcher(sql);List<String> out=new ArrayList<>();while(m.find()){out.add(m.group(1)!=null?m.group(1):m.group());}return out;} }
