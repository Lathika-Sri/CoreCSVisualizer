'use client';

import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2, ChevronRight, Clock3, Code2, Cpu, Database, FlaskConical, Gauge, GraduationCap, Network, Play, Sparkles, Terminal, Trophy, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

const modules = [
  { href:'/cpu-scheduling', icon:Cpu, eyebrow:'OPERATING SYSTEMS', title:'CPU Scheduling Lab', description:'Simulate FCFS, SJF, SRTF, Priority and Round Robin while watching queues, Gantt timelines and performance metrics evolve.', stat:'5 algorithms', accent:'cyan' },
  { href:'/minidb', icon:Database, eyebrow:'DATABASE INTERNALS', title:'MiniDB Engine', description:'Trace SQL from tokenization to storage pages, filtering and indexes. Understand what a database is doing beneath the query.', stat:'Query pipeline', accent:'violet' },
  { href:'/solid-analyzer', icon:BrainCircuit, eyebrow:'SOFTWARE DESIGN', title:'SOLID Analyzer', description:'Inspect Java AST structure, detect design smells and explore refactoring strategies around SRP, OCP, LSP, ISP and DIP.', stat:'5 principles', accent:'emerald' },
  { href:'/data-structures', icon:FlaskConical, eyebrow:'DSA LAB', title:'Data Structures Lab', description:'Step through stacks, queues, linked lists and graphs with live state, operations, complexity and interview notes.', stat:'Interactive', accent:'amber' },
];

const loop = ['Learn','Configure','Execute','Visualize','Analyze','Explain'];

export default function Home() {
  const [focus, setFocus] = useState('All');
  const visible = useMemo(() => focus === 'All' ? modules : modules.filter(m => m.eyebrow.includes(focus)), [focus]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 md:py-12">
      <section className="hero-glow relative overflow-hidden rounded-[28px] border border-cyan-300/10 bg-gradient-to-br from-[#0d1b31] via-[#091426] to-[#080c17] p-6 md:p-10 lg:p-14">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={13}/> Engineering mode</div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.045em] text-white md:text-6xl lg:text-7xl">Understand Computer Science <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">by seeing it in action.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">CoreCS is an interactive engineering lab for students who want to move beyond definitions. Configure a system, execute it, inspect its internal state, compare the result and explain why it happened.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/learn" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"><Play size={15}/> Start a lab</Link>
              <Link href="/cpu-scheduling" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-bold text-slate-200 hover:border-cyan-300/30"><Terminal size={15}/> Run an experiment</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-500"><span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400"/> Java 25 backend</span><span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400"/> Next.js + TypeScript</span><span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400"/> PostgreSQL persistence</span></div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-[#050a13]/70 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2 text-xs font-bold"><Gauge size={14} className="text-cyan-300"/> Live workspace</div><div className="font-code text-[9px] text-slate-500">CORECS_ENGINE</div></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['05','Labs','cyan'],['12','Concepts','violet'],['24','Experiments','emerald'],['∞','Why?','amber']
              ].map(([v,l,c]) => <div key={l} className="rounded-2xl border border-white/8 bg-white/[.025] p-4"><div className={`text-2xl font-black ${c==='cyan'?'text-cyan-300':c==='violet'?'text-violet-300':c==='emerald'?'text-emerald-300':'text-amber-300'}`}>{v}</div><div className="mt-1 text-[10px] uppercase tracking-[.15em] text-slate-500">{l}</div></div>)}
            </div>
            <div className="mt-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.025] p-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">Current experiment</span><span className="text-[10px] text-emerald-300">RUNNING</span></div>
              <div className="mt-3 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><Cpu size={17}/></div><div><div className="text-sm font-bold">SRTF workload #024</div><div className="text-[10px] text-slate-500">Queue → CPU → Gantt → Metrics</div></div></div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"/></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-4">
        {([['04','interactive labs',FlaskConical],['05','CS principles',Network],['06','learning stages',GraduationCap],['∞','experiments to run',Zap]] as [string,string,LucideIcon][]).map(([v,l,Icon]) => <div key={l} className="panel flex items-center gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.04] text-cyan-300"><Icon size={18}/></div><div><div className="text-lg font-black">{v}</div><div className="text-[10px] uppercase tracking-[.16em] text-slate-500">{l}</div></div></div>)}
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300">Engineering workbench</div><h2 className="mt-2 text-3xl font-black tracking-tight">Choose your lab</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">Every module follows the same loop: configure → execute → inspect → explain.</p></div><div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-950/50 p-1">{['All','OPERATING','DATABASE','SOFTWARE','DSA'].map(x => <button key={x} onClick={()=>setFocus(x)} className={`rounded-lg px-3 py-2 text-[10px] font-black ${focus===x?'bg-white/10 text-white':'text-slate-500 hover:text-slate-300'}`}>{x}</button>)}</div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visible.map(({href,icon:Icon,eyebrow,title,description,stat,accent},i) => <Link key={href} href={href} className="group panel relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25"><div className={`absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl ${accent==='cyan'?'bg-cyan-400/10':accent==='violet'?'bg-violet-400/10':accent==='emerald'?'bg-emerald-400/10':'bg-amber-400/10'}`}/><div className="relative"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.035] text-cyan-300"><Icon size={21}/></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{stat}</span></div><div className="mt-6 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">{eyebrow}</div><h3 className="mt-2 text-2xl font-black tracking-tight">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p><div className="mt-6 flex items-center gap-2 text-xs font-black text-cyan-300">Open lab <ArrowRight size={14} className="transition group-hover:translate-x-1"/></div></div></Link>)}
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="panel p-6 md:p-7"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-violet-300"><Network size={14}/> The CoreCS learning loop</div><h2 className="mt-3 text-2xl font-black">Don't just read the answer. See why it happens.</h2><div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-6">{loop.map((x,i)=><div key={x} className="relative rounded-xl border border-white/8 bg-white/[.02] p-3 text-center"><div className="text-[9px] font-black text-cyan-300">0{i+1}</div><div className="mt-1 text-[11px] font-bold">{x}</div>{i<loop.length-1&&<ChevronRight className="absolute -right-3 top-1/2 hidden text-slate-700 md:block" size={13}/>}</div>)}</div></div>
        <div className="panel p-6 md:p-7"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-300"><Trophy size={14}/> Portfolio mode</div><h2 className="mt-3 text-2xl font-black">Build something you can explain in an interview.</h2><p className="mt-3 text-sm leading-6 text-slate-400">The platform is designed to showcase algorithms, backend architecture, database internals, code analysis and frontend visualization in one coherent product.</p><div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-slate-300"><div className="rounded-xl bg-white/[.03] p-3"><Code2 size={14} className="mb-2 text-cyan-300"/>Clean architecture</div><div className="rounded-xl bg-white/[.03] p-3"><Clock3 size={14} className="mb-2 text-violet-300"/>Step-by-step execution</div></div></div>
      </section>
    </div>
  );
}
