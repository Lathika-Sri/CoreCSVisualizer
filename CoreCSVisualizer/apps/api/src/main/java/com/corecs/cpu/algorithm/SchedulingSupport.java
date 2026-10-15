package com.corecs.cpu.algorithm;
import com.corecs.cpu.model.*; import java.util.*;
public final class SchedulingSupport {
  private SchedulingSupport() {}
  public static SimulationResult finish(List<ProcessSpec> ps,List<GanttSegment> raw) {
    if(ps.isEmpty()) return new SimulationResult(List.of(),List.of(),0,0,0,0,0);
    List<GanttSegment> timeline=new ArrayList<>();
    for(var s:raw) { if(s.end()<=s.start()) continue; if(!timeline.isEmpty() && timeline.getLast().processId().equals(s.processId()) && timeline.getLast().end()==s.start()) { var p=timeline.removeLast(); timeline.add(new GanttSegment(p.processId(),p.start(),s.end())); } else timeline.add(s); }
    Map<String,Integer> first=new HashMap<>(), done=new HashMap<>(); int busy=0, switches=0;
    for(int i=0;i<timeline.size();i++){var s=timeline.get(i); if(!s.processId().equals("IDLE")){busy+=s.end()-s.start();first.putIfAbsent(s.processId(),s.start());done.put(s.processId(),s.end()); if(i>0&&!timeline.get(i-1).processId().equals("IDLE")&&!timeline.get(i-1).processId().equals(s.processId())) switches++;}}
    List<ProcessMetric> metrics=new ArrayList<>(); double wt=0,tat=0; int last=timeline.getLast().end(), min=ps.stream().mapToInt(ProcessSpec::arrivalTime).min().orElse(0);
    for(var p:ps){int c=done.getOrDefault(p.id(),p.arrivalTime()+p.burstTime());int t=c-p.arrivalTime();int w=t-p.burstTime();int r=first.getOrDefault(p.id(),p.arrivalTime())-p.arrivalTime();metrics.add(new ProcessMetric(p.id(),c,t,w,r));wt+=w;tat+=t;}
    double span=Math.max(1,last-min); return new SimulationResult(timeline,metrics,wt/ps.size(),tat/ps.size(),busy*100.0/span,ps.size()*1.0/span,switches);
  }
  public static List<ProcessSpec> sorted(List<ProcessSpec> ps){return ps.stream().sorted(Comparator.comparingInt(ProcessSpec::arrivalTime).thenComparing(ProcessSpec::id)).toList();}
}
