'use client';

import { BarChart3, CheckCircle2, Clock3, Cpu, Gauge, Info, Play, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

type Process = { name: string; arrival: number; burst: number; priority: number };
const base: Process[] = [
  { name:'P1', arrival:0, burst:8, priority:2 },
  { name:'P2', arrival:1, burst:4, priority:1 },
  { name:'P3', arrival:2, burst:2, priority:3 },
  { name:'P4', arrival:3, burst:5, priority:2 },
];

function fcfs(ps: Process[]) {
  let t=0, wait=0, turn=0;
  for(const p of [...ps].sort((a,b)=>a.arrival-b.arrival)){ t=Math.max(t,p.arrival); wait+=t-p.arrival; t+=p.burst; turn+=t-p.arrival; }
  return {wait:wait/ps.length, turn:turn/ps.length};
}
function sjf(ps: Process[]) {
  let t=0, wait=0, turn=0, done=0; const left=new Set(ps.map(p=>p.name));
  while(done<ps.length){ const avail=ps.filter(p=>left.has(p.name)&&p.arrival<=t).sort((a,b)=>a.burst-b.burst||a.arrival-b.arrival); if(!avail.length){t=Math.min(...ps.filter(p=>left.has(p.name)).map(p=>p.arrival));continue;} const p=avail[0]; wait+=t-p.arrival; t+=p.burst; turn+=t-p.arrival; left.delete(p.name); done++; }
  return {wait:wait/ps.length, turn:turn/ps.length};
}
function srtf(ps: Process[]) {
  const rem=new Map(ps.map(p=>[p.name,p.burst])); let t=0, finished=0; const completion=new Map<string,number>();
  while(finished<ps.length){ const available=ps.filter(p=>(rem.get(p.name)||0)>0&&p.arrival<=t).sort((a,b)=>(rem.get(a.name)!-rem.get(b.name)!)||a.arrival-b.arrival); if(!available.length){t++;continue;} const p=available[0]; rem.set(p.name, rem.get(p.name)!-1); t++; if(rem.get(p.name)===0){completion.set(p.name,t);finished++;} }
  let wait=0,turn=0; for(const p of ps){const c=completion.get(p.name)!;turn+=c-p.arrival;wait+=c-p.arrival-p.burst;} return {wait:wait/ps.length,turn:turn/ps.length};
}
function rr(ps: Process[], quantum=2) {
  const q: Process[]=[]; const rem=new Map(ps.map(p=>[p.name,p.burst])); let t=0, i=0; const sorted=[...ps].sort((a,b)=>a.arrival-b.arrival); const completion=new Map<string,number>();
  while(completion.size<ps.length){ while(i<sorted.length&&sorted[i].arrival<=t) q.push(sorted[i++]); if(!q.length){t=sorted[i].arrival;continue;} const p=q.shift()!; const run=Math.min(quantum,rem.get(p.name)!); rem.set(p.name,rem.get(p.name)!-run); t+=run; while(i<sorted.length&&sorted[i].arrival<=t) q.push(sorted[i++]); if(rem.get(p.name)!>0) q.push(p); else completion.set(p.name,t); }
  let wait=0,turn=0; for(const p of ps){const c=completion.get(p.name)!;turn+=c-p.arrival;wait+=c-p.arrival-p.burst;} return {wait:wait/ps.length,turn:turn/ps.length};
}

export default function Experiments() {
  const [quantum,setQuantum]=useState(2); const [running,setRunning]=useState(false);
  const results=useMemo(()=>{const raw=[['FCFS',fcfs(base)],['SJF',sjf(base)],['SRTF',srtf(base)],['Round Robin',rr(base,quantum)]] as const; return raw.map(([name,r])=>({...r,name,score:Math.max(0,100-r.wait*4-r.turn*1.2)}));},[quantum]);
  const best=[...results].sort((a,b)=>a.wait-b.wait)[0];
  const run=()=>{setRunning(true);window.setTimeout(()=>setRunning(false),650)};
  return <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-violet-300">EXPERIMENT STUDIO / BENCHMARKS</div><h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Compare the system, <span className="text-violet-300">not just the answer.</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Run the same workload through multiple CPU scheduling strategies and see how waiting time and turnaround time change.</p></div><button onClick={()=>setQuantum(2)} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-xs font-bold"><RotateCcw size={14}/> Reset workload</button></div>

    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4"><div className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-white/8 p-5"><div><div className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">WORKLOAD</div><h2 className="mt-1 text-lg font-black">Interactive benchmark input</h2></div><div className="flex items-center gap-2 text-[10px] text-emerald-300"><CheckCircle2 size={13}/> deterministic sample</div></div><div className="overflow-x-auto p-5"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr className="border-b border-white/8 text-[9px] uppercase tracking-widest text-slate-500"><th className="pb-3">Process</th><th className="pb-3">Arrival</th><th className="pb-3">Burst</th><th className="pb-3">Priority</th></tr></thead><tbody>{base.map(p=><tr key={p.name} className="border-b border-white/5"><td className="py-3 font-black text-cyan-200">{p.name}</td><td className="py-3 font-code text-slate-300">{p.arrival}</td><td className="py-3 font-code text-slate-300">{p.burst}</td><td className="py-3 font-code text-slate-300">{p.priority}</td></tr>)}</tbody></table></div></div>
      <div className="panel p-5"><div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-widest text-slate-500">ROUND ROBIN</div><div className="mt-1 text-sm font-black">Time quantum</div></div><div className="rounded-lg bg-violet-300/10 px-3 py-2 font-code text-sm text-violet-200">{quantum}</div></div><input type="range" min="1" max="5" value={quantum} onChange={e=>setQuantum(Number(e.target.value))} className="mt-5 w-full accent-violet-300"/><div className="mt-2 flex justify-between text-[9px] text-slate-600"><span>1</span><span>5</span></div></div></section>

      <aside className="panel h-fit p-5"><div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-300">RUN CONTROL</div><button onClick={run} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950">{running?<Zap size={14}/>:<Play size={14}/>} {running?'Running benchmark…':'Run benchmark'}</button><div className="mt-5 space-y-3 border-t border-white/8 pt-4"><div className="flex items-center justify-between text-xs"><span className="text-slate-500">Best waiting time</span><span className="font-black text-emerald-300">{best.name}</span></div><div className="flex items-center justify-between text-xs"><span className="text-slate-500">Average wait</span><span className="font-code text-white">{best.wait.toFixed(2)}</span></div><div className="flex items-center justify-between text-xs"><span className="text-slate-500">Workload size</span><span className="font-code text-white">4 processes</span></div></div></aside>
    </div>

    <section className="mt-4 panel overflow-hidden"><div className="border-b border-white/8 p-5"><div className="flex items-center gap-2"><BarChart3 size={17} className="text-violet-300"/><div><div className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">RESULTS</div><h2 className="mt-1 text-lg font-black">Algorithm comparison</h2></div></div></div><div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">{results.map((r,i)=><div key={r.name} className={`rounded-2xl border p-4 ${r.name===best.name?'border-emerald-400/25 bg-emerald-400/[.035]':'border-white/8 bg-white/[.02]'}`}><div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.05] text-cyan-300"><Cpu size={16}/></div>{r.name===best.name&&<Trophy size={15} className="text-emerald-300"/>}</div><div className="mt-4 text-sm font-black">{r.name}</div><div className="mt-4 space-y-2"><Metric label="Avg waiting" value={r.wait.toFixed(2)}/><Metric label="Avg turnaround" value={r.turn.toFixed(2)}/></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-cyan-300" style={{width:`${Math.min(100,Math.max(8,r.score))}%`}}/></div></div>)}</div></section>

    <section className="mt-4 grid gap-4 md:grid-cols-3"><Insight icon={<Gauge size={16}/>} title="What to notice" text={`For this workload, ${best.name} produces the lowest average waiting time. Change the quantum and observe Round Robin move.`}/><Insight icon={<Info size={16}/>} title="Why this matters" text="Benchmarks turn an algorithm implementation into evidence. In an interview, explain the workload and the metric before claiming one algorithm is better."/><Insight icon={<Clock3 size={16}/>} title="Next experiment" text="Add 100, 1,000 and 10,000 process workloads, then chart how context switches and waiting time scale."/></section>
  </div>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between text-[10px]"><span className="text-slate-500">{label}</span><span className="font-code text-slate-200">{value}</span></div>}
function Insight({icon,title,text}:{icon:ReactNode;title:string;text:string}){return <div className="panel p-5"><div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300/10 text-violet-300">{icon}</div><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>}
