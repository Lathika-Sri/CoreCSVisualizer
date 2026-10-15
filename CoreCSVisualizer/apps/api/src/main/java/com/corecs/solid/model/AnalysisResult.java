package com.corecs.solid.model; import java.util.*; public record AnalysisResult(List<ClassInfo> classes,List<Issue> issues,List<DependencyEdge> dependencies,int totalClasses,int totalMethods) {}
