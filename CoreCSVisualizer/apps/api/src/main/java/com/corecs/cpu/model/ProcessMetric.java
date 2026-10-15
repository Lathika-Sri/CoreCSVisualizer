package com.corecs.cpu.model;
public record ProcessMetric(String processId,int completionTime,int turnaroundTime,int waitingTime,int responseTime) {}
