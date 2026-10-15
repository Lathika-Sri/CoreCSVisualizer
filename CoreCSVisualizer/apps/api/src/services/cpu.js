const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function simulate(input) {
  const algorithm = String(input.algorithm || '').toUpperCase();
  const processes = input.processes;
  if (!['FCFS', 'SJF', 'SRTF', 'PRIORITY', 'ROUND_ROBIN'].includes(algorithm)) throw new Error('Unsupported algorithm. Use FCFS, SJF, SRTF, PRIORITY or ROUND_ROBIN');
  if (!Array.isArray(processes) || !processes.length) throw new Error('Add at least one process.');
  const ids = new Set();
  const ps = processes.map((p, index) => {
    const id = String(p.id || '').trim(); const arrival = Number(p.arrivalTime); const burst = Number(p.burstTime); const priority = Number(p.priority ?? 0);
    if (!id || ids.has(id)) throw new Error('Process IDs must be non-empty and unique.'); ids.add(id);
    if (!Number.isInteger(arrival) || arrival < 0 || !Number.isInteger(burst) || burst <= 0 || !Number.isInteger(priority) || priority < 0) throw new Error('Arrival must be >= 0, burst > 0, priority >= 0');
    return { id, arrival, burst, priority, index, remaining: burst, first: null, completion: null };
  });
  const quantum = Number(input.timeQuantum ?? 1);
  if (algorithm === 'ROUND_ROBIN' && (!Number.isInteger(quantum) || quantum <= 0)) throw new Error('Time quantum must be a positive integer.');
  const timeline = []; let t = 0; let finished = 0; let last = null; const ready = [];
  const addSegment = (p, start, end) => {
    const processId = p?.id || 'IDLE'; const previous = timeline.at(-1);
    if (previous?.processId === processId && previous.end === start) previous.end = end;
    else timeline.push({ processId, start, end });
  };
  const tie = (a, b) => a.arrival - b.arrival || a.index - b.index;
  if (algorithm === 'FCFS' || algorithm === 'ROUND_ROBIN') {
    const arrivals = [...ps].sort(tie); let i = 0;
    while (finished < ps.length) {
      while (i < arrivals.length && arrivals[i].arrival <= t) ready.push(arrivals[i++]);
      if (!ready.length) { const next = arrivals[i].arrival; addSegment(null, t, next); t = next; continue; }
      const p = ready.shift(); p.first ??= t; const start = t; const duration = algorithm === 'ROUND_ROBIN' ? Math.min(quantum, p.remaining) : p.remaining;
      t += duration; p.remaining -= duration; addSegment(p, start, t);
      while (i < arrivals.length && arrivals[i].arrival <= t) ready.push(arrivals[i++]);
      if (p.remaining) ready.push(p); else { p.completion = t; finished++; }
    }
  } else {
    while (finished < ps.length) {
      const available = ps.filter((p) => p.remaining > 0 && p.arrival <= t);
      if (!available.length) { const next = Math.min(...ps.filter((p) => p.remaining > 0).map((p) => p.arrival)); addSegment(null, t, next); t = next; last = null; continue; }
      available.sort((a, b) => algorithm === 'SJF' ? a.burst - b.burst || tie(a, b) : algorithm === 'PRIORITY' ? a.priority - b.priority || tie(a, b) : a.remaining - b.remaining || tie(a, b));
      const p = available[0]; p.first ??= t; const start = t;
      const duration = algorithm === 'SRTF' ? 1 : p.remaining;
      t += duration; p.remaining -= duration; addSegment(p, start, t);
      if (!p.remaining) { p.completion = t; finished++; }
    }
  }
  const processMetrics = ps.map((p) => ({ processId: p.id, completionTime: p.completion, turnaroundTime: p.completion - p.arrival, waitingTime: p.completion - p.arrival - p.burst, responseTime: p.first - p.arrival }));
  const averageWaitingTime = processMetrics.reduce((s, p) => s + p.waitingTime, 0) / ps.length;
  const averageTurnaroundTime = processMetrics.reduce((s, p) => s + p.turnaroundTime, 0) / ps.length;
  const total = timeline.at(-1)?.end || 0; const busy = timeline.reduce((s, x) => s + (x.processId === 'IDLE' ? 0 : x.end - x.start), 0);
  let contextSwitches = 0;
  for (let i = 1; i < timeline.length; i++) if (timeline[i - 1].processId !== 'IDLE' && timeline[i].processId !== 'IDLE' && timeline[i - 1].processId !== timeline[i].processId) contextSwitches++;
  return { timeline, processMetrics, averageWaitingTime: round(averageWaitingTime), averageTurnaroundTime: round(averageTurnaroundTime), cpuUtilization: total ? round(busy * 100 / total) : 0, throughput: total ? round(ps.length / total) : 0, contextSwitches };
}
