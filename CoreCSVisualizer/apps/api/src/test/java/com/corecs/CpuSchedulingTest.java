package com.corecs;
import com.corecs.cpu.algorithm.*;import com.corecs.cpu.model.*;import java.util.*;import org.junit.jupiter.api.Test;import static org.junit.jupiter.api.Assertions.*;
class CpuSchedulingTest { List<ProcessSpec> ps=List.of(new ProcessSpec("P1",0,7,2),new ProcessSpec("P2",2,4,1),new ProcessSpec("P3",4,2,3),new ProcessSpec("P4",5,5,2));
 @Test void fcfs(){var r=new FcfsAlgorithm().simulate(ps,2);assertEquals(List.of("P1","P2","P3","P4"),r.timeline().stream().map(GanttSegment::processId).toList());assertEquals(5.0,r.averageWaitingTime());}
 @Test void sjf(){var r=new SjfAlgorithm().simulate(ps,2);assertEquals("P1",r.timeline().getFirst().processId());}
 @Test void srtf(){var r=new SrtfAlgorithm().simulate(ps,2);assertTrue(r.timeline().size()>4);}
 @Test void priority(){var r=new PriorityAlgorithm().simulate(ps,2);assertEquals("P1",r.timeline().getFirst().processId());}
 @Test void rr(){var r=new RoundRobinAlgorithm().simulate(ps,2);assertTrue(r.timeline().size()>4);}
}
