package com.corecs.cpu.algorithm;
import com.corecs.cpu.model.*; import java.util.List;
public interface SchedulingAlgorithm { SimulationResult simulate(List<ProcessSpec> processes, int quantum); }
