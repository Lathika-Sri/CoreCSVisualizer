package com.corecs.cpu.model;
import java.util.List;
public record SimulationResult(List<GanttSegment> timeline,List<ProcessMetric> processMetrics,double averageWaitingTime,double averageTurnaroundTime,double cpuUtilization,double throughput,int contextSwitches) {}
