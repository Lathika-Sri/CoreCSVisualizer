package com.corecs.dbms.storage;
import com.corecs.dbms.index.HashIndex;import com.corecs.dbms.model.*;import org.springframework.stereotype.Component;import java.util.*;
@Component public class MiniStorageEngine { private final Map<String,TableDef> tables=new LinkedHashMap<>(); private final HashIndex index=new HashIndex(); private static final int PAGE_SIZE=4;
 public synchronized void create(String name,List<ColumnDef> cols){if(tables.containsKey(name.toLowerCase()))throw new IllegalArgumentException("Table already exists: "+name);tables.put(name.toLowerCase(),new TableDef(name,cols,new ArrayList<>()));}
 public synchronized TableDef get(String name){var t=tables.get(name.toLowerCase());if(t==null)throw new IllegalArgumentException("Table not found: "+name);return t;}
 public synchronized List<PageView> pages(TableDef t){List<PageView> p=new ArrayList<>();for(int i=0;i<t.rows().size();i+=PAGE_SIZE)p.add(new PageView(i/PAGE_SIZE+1,new ArrayList<>(t.rows().subList(i,Math.min(i+PAGE_SIZE,t.rows().size())))));return p;}
 public synchronized void rebuildIndex(TableDef t){int id=t.columns().stream().mapToInt(c->c.name().equalsIgnoreCase("id")?1:0).sum();if(id==1){int foundCol=0;for(int i=0;i<t.columns().size();i++)if(t.columns().get(i).name().equalsIgnoreCase("id"))foundCol=i;final int col=foundCol;index.rebuild(t.name(),t.rows().stream().map(r->r.get(col)).toList());}}
 public HashIndex index(){return index;}
}
