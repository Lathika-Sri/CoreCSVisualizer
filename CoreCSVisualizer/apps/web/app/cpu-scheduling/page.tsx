'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Zap, Activity, Clock3, Gauge } from 'lucide-react';
import { api } from '@/lib/api';
import SectionTitle from '@/components/SectionTitle';

const initial = [
  { id: 'P1', arrivalTime: 0, burstTime: 7, priority: 2 },
  { id: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 4, burstTime: 2, priority: 3 },
  { id: 'P4', arrivalTime: 5, burstTime: 5, priority: 2 },
];

type Proc = typeof initial[number];
type Result = {
  timeline: { processId: string; start: number; end: number }[];
  processMetrics: { processId: string; completionTime: number; turnaroundTime: number; waitingTime: number; responseTime: number }[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number;
  contextSwitches: number;
};

export default function Cpu() {
  const [ps, setPs] = useState<Proc[]>(initial);
  const [alg, setAlg] = useState('SRTF');
  const [q, setQ] = useState(2);
  const [r, setR] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const add = () =>
    setPs((current) => [
      ...current,
      { id: `P${current.length + 1}`, arrivalTime: 0, burstTime: 5, priority: 1 },
    ]);

  const update = (i: number, k: keyof Proc, v: string) =>
    setPs((current) =>
      current.map((p, j) =>
        j === i ? { ...p, [k]: k === 'id' ? v : Number(v) } : p,
      ),
    );

  const run = async () => {
    setLoading(true);
    setError('');
    setPlaying(false);
    try {
      const result = await api<Result>('/cpu/simulate', {
        method: 'POST',
        body: JSON.stringify({ algorithm: alg, processes: ps, timeQuantum: q }),
      });
      setR(result);
      setStep(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setPlaying(false);
    setStep(0);
  };

  const stepForward = () => {
    if (!r) return;
    setPlaying(false);
    setStep((current) => Math.min(r.timeline.length, current + 1));
  };

  useEffect(() => {
    if (!playing || !r) return;

    if (step >= r.timeline.length) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStep((current) => Math.min(r.timeline.length, current + 1));
    }, 650);

    return () => window.clearTimeout(timer);
  }, [playing, step, r]);

  const visible = useMemo(
    () => r?.timeline.slice(0, step) ?? [],
    [r, step],
  );

  const currentSegment = step > 0 && r ? r.timeline[step - 1] : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle eyebrow="Operating Systems" title="CPU Scheduling Visualizer">
        Build a process queue, run a real scheduling algorithm on the backend, then step through every CPU decision.
      </SectionTitle>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="panel flex items-center gap-3 p-4">
          <Zap className="text-cyan-300" size={20} />
          <div><div className="text-xs text-slate-500">Algorithm</div><div className="font-semibold">{alg}</div></div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <Activity className="text-violet-300" size={20} />
          <div><div className="text-xs text-slate-500">Timeline progress</div><div className="font-semibold">{r ? `${step} / ${r.timeline.length}` : 'Not run'}</div></div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <Clock3 className="text-emerald-300" size={20} />
          <div><div className="text-xs text-slate-500">Current CPU slot</div><div className="font-semibold">{currentSegment ? `${currentSegment.processId} · ${currentSegment.start}–${currentSegment.end}` : '—'}</div></div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold">Process queue</h2><p className="mt-1 text-xs text-slate-500">Arrival, burst and priority are sent to the scheduler.</p></div>
            <button onClick={add} className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950">+ Add</button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th>ID</th><th>Arr.</th><th>Burst</th><th>Pri.</th><th /></tr></thead>
              <tbody>
                {ps.map((p, i) => (
                  <tr key={`${p.id}-${i}`} className="border-t border-slate-800">
                    <td><input className="w-14 bg-transparent p-2 outline-none focus:text-cyan-300" value={p.id} onChange={(e) => update(i, 'id', e.target.value)} /></td>
                    <td><input type="number" min="0" className="w-14 bg-transparent p-2 outline-none" value={p.arrivalTime} onChange={(e) => update(i, 'arrivalTime', e.target.value)} /></td>
                    <td><input type="number" min="1" className="w-14 bg-transparent p-2 outline-none" value={p.burstTime} onChange={(e) => update(i, 'burstTime', e.target.value)} /></td>
                    <td><input type="number" min="0" className="w-14 bg-transparent p-2 outline-none" value={p.priority} onChange={(e) => update(i, 'priority', e.target.value)} /></td>
                    <td><button className="text-rose-300" onClick={() => setPs((current) => current.filter((_, j) => j !== i))}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="text-sm">Algorithm
              <select value={alg} onChange={(e) => setAlg(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-3">
                <option>FCFS</option><option>SJF</option><option>SRTF</option><option>PRIORITY</option><option>ROUND_ROBIN</option>
              </select>
            </label>
            <label className="text-sm">Time Quantum
              <input type="number" min="1" value={q} onChange={(e) => setQ(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-3" />
            </label>
            <button onClick={run} disabled={loading} className="rounded-lg bg-violet-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">
              {loading ? 'Simulating…' : 'Run simulation'}
            </button>
            {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
          </div>
        </section>

        <section className="space-y-5">
          <div className="panel overflow-hidden p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">CPU execution timeline</h2>
                <p className="mt-1 text-xs text-slate-500">Use Step to reveal one scheduling decision at a time.</p>
              </div>
              <div className="flex gap-2">
                <button disabled={!r} onClick={() => setPlaying((v) => !v)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-40">
                  {playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pause' : 'Play'}
                </button>
                <button disabled={!r || step >= (r?.timeline.length ?? 0)} onClick={stepForward} className="flex items-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-2 text-sm text-cyan-200 disabled:opacity-40">
                  <SkipForward size={14} /> Step
                </button>
                <button disabled={!r} onClick={restart} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-40">
                  <RotateCcw size={14} /> Restart
                </button>
              </div>
            </div>

            {r ? (
              <div className="mt-6">
                <div className="mb-3 flex justify-between text-xs text-slate-500"><span>0%</span><span>{r.timeline.length ? Math.round((step / r.timeline.length) * 100) : 0}% complete</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300" style={{ width: `${r.timeline.length ? (step / r.timeline.length) * 100 : 0}%` }} /></div>
                <div className="mt-6 flex min-h-[105px] min-w-[600px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
                  {visible.length ? visible.map((s, i) => {
                    const width = Math.max(7, ((s.end - s.start) / Math.max(1, r.timeline.reduce((sum, item) => sum + item.end - item.start, 0))) * 100);
                    return <div key={`${s.processId}-${i}`} style={{ width: `${width}%` }} className={`flex min-w-[64px] flex-col items-center justify-center border-r border-slate-950 px-2 text-sm transition-all ${s.processId === 'IDLE' ? 'bg-slate-700/70' : 'bg-cyan-400/15 hover:bg-cyan-400/25'}`}><span className="font-semibold">{s.processId}</span><span className="mt-1 text-[10px] text-slate-400">{s.start} → {s.end}</span></div>;
                  }) : <div className="flex w-full items-center justify-center text-sm text-slate-600">Press Step or Play to start the CPU.</div>}
                </div>
              </div>
            ) : <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-500">Run a simulation to create the execution timeline.</div>}
          </div>

          {r && <>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Avg WT', r.averageWaitingTime.toFixed(2), Gauge],
                ['Avg TAT', r.averageTurnaroundTime.toFixed(2), Clock3],
                ['CPU', `${r.cpuUtilization.toFixed(1)}%`, Activity],
                ['Switches', String(r.contextSwitches), Zap],
              ].map(([label, value, Icon]) => <div className="panel p-4" key={String(label)}><Icon size={17} className="text-cyan-300" /><div className="mt-3 text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold">{String(value)}</div></div>)}
            </div>
            <div className="panel overflow-x-auto p-5"><h2 className="font-semibold">Process metrics</h2><table className="mt-4 w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Process</th><th>CT</th><th>TAT</th><th>WT</th><th>RT</th></tr></thead><tbody>{r.processMetrics.map((m) => <tr className="border-t border-slate-800" key={m.processId}><td className="py-2 font-medium">{m.processId}</td><td>{m.completionTime}</td><td>{m.turnaroundTime}</td><td>{m.waitingTime}</td><td>{m.responseTime}</td></tr>)}</tbody></table></div>
          </>}
        </section>
      </div>
    </div>
  );
}
