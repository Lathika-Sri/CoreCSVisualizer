package com.corecs.cpu.algorithm;
import com.corecs.cpu.model.*; import java.util.*;
public class FcfsAlgorithm implements SchedulingAlgorithm { public SimulationResult simulate(List<ProcessSpec> input,int q){var ps=SchedulingSupport.sorted(input);var out=new ArrayList<GanttSegment>();int t=0;for(var p:ps){if(t<p.arrivalTime()){out.add(new GanttSegment("IDLE",t,p.arrivalTime()));t=p.arrivalTime();}out.add(new GanttSegment(p.id(),t,t+p.burstTime()));t+=p.burstTime();}return SchedulingSupport.finish(ps,out);} }
