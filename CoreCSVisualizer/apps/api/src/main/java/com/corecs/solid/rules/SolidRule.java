package com.corecs.solid.rules;import com.corecs.solid.model.*;import java.util.List;public interface SolidRule{List<Issue> analyze(List<ClassInfo> classes);}
