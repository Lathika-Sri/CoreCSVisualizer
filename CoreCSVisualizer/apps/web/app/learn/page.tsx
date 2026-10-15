'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Code2, Cpu, Database, GitBranch, Lightbulb, PlayCircle, Terminal } from 'lucide-react';

const topics = [
  { id: 'fcfs', group: 'CPU', title: 'FCFS', subtitle: 'First Come, First Served', icon: Cpu, summary: 'Processes execute in arrival order. It is simple, predictable and non-preemptive.', code: `for (Process p : readyQueue) {\n    run(p);\n}`, steps: ['Processes enter the ready queue by arrival time.', 'The first available process gets the CPU.', 'It runs until its burst completes.', 'The scheduler moves to the next process.', 'Waiting time accumulates while processes sit in the queue.'], complexity: 'Scheduling: O(n log n) for sorting by arrival time.', interview: 'FCFS can create the convoy effect when a long process blocks many short processes.' },
  { id: 'sjf', group: 'CPU', title: 'SJF', subtitle: 'Shortest Job First', icon: Cpu, summary: 'Among available processes, choose the one with the smallest burst time.', code: `Process next = available.stream()\n    .min(byBurstTime)\n    .orElseThrow();\nrun(next);`, steps: ['Find processes that have already arrived.', 'Compare their burst times.', 'Choose the shortest available job.', 'Run it to completion in the non-preemptive version.', 'Repeat until every process finishes.'], complexity: 'Selection can be O(n) per decision; the implementation also sorts candidate data.', interview: 'SJF minimizes average waiting time when burst lengths are known accurately, but long jobs may wait.' },
  { id: 'srtf', group: 'CPU', title: 'SRTF', subtitle: 'Shortest Remaining Time First', icon: Cpu, summary: 'At each decision point, the process with the smallest remaining burst gets the CPU.', code: `if (candidate.remaining < current.remaining) {\n    preempt(current);\n    run(candidate);\n}`, steps: ['Track remaining burst time for every process.', 'When a process arrives, compare remaining times.', 'Preempt the current process when another has less remaining work.', 'Continue until all remaining times reach zero.', 'Record each execution segment for the Gantt chart.'], complexity: 'The simulation repeatedly evaluates ready processes across time.', interview: 'SRTF is the preemptive counterpart of SJF and can increase context switches.' },
  { id: 'priority', group: 'CPU', title: 'Priority', subtitle: 'Priority Scheduling', icon: Cpu, summary: 'The Version 1 scheduler treats a lower numeric priority value as higher priority.', code: `readyQueue.sort(\n    comparing(Process::priority)\n);\nrun(readyQueue.removeFirst());`, steps: ['Collect processes that have arrived.', 'Compare their priority values.', 'Choose the highest-priority process.', 'Run according to the selected policy.', 'Repeat until the workload is complete.'], complexity: 'Depends on ready-queue ordering and number of scheduling decisions.', interview: 'Priority scheduling can starve lower-priority work; aging is a common mitigation.' },
  { id: 'rr', group: 'CPU', title: 'Round Robin', subtitle: 'Time-sliced scheduling', icon: Cpu, summary: 'Each ready process receives a fixed time quantum before moving to the back of the queue.', code: `Process p = queue.poll();\nrunForQuantum(p, q);\nif (p.remaining > 0) {\n    queue.offer(p);\n}`, steps: ['Put arrived processes into a FIFO ready queue.', 'Take the process at the front.', 'Run it for at most the quantum.', 'If work remains, move it to the back.', 'Repeat until all processes complete.'], complexity: 'Simulation work grows with the number of time slices.', interview: 'A very small quantum increases context switches; a very large quantum approaches FCFS behavior.' },
  { id: 'minidb', group: 'MiniDB', title: 'SQL → Storage', subtitle: 'How MiniDB executes a query', icon: Database, summary: 'MiniDB separates tokenization, parsing, execution and a visual page-based storage layer.', code: `SQL\n ↓\nTokenizer\n ↓\nParser\n ↓\nExecutor\n ↓\nPages / Hash Index\n ↓\nResult`, steps: ['Tokenize the SQL string.', 'Parse tokens into a structured query.', 'Choose the supported execution path.', 'Read or modify in-memory table records.', 'Represent records inside fixed-size visual pages.', 'Return rows plus execution details to the UI.'], complexity: 'Depends on the operation; SELECT can scan records or use the educational hash-index path.', interview: 'The PostgreSQL database in this project is for application persistence; MiniDB is a separate educational engine.' },
  { id: 'solid', group: 'SOLID', title: 'SOLID in practice', subtitle: 'Design principles as code-review signals', icon: Code2, summary: 'The analyzer uses JavaParser AST information and reports potential design signals rather than absolute violations.', code: `Source Code\n   ↓\nJavaParser AST\n   ↓\nSRP / OCP / LSP / ISP / DIP\n   ↓\nPotential Issues\n   ↓\nRefactoring Ideas`, steps: ['Parse Java source into an AST.', 'Extract classes, methods, interfaces and dependencies.', 'Run each SOLID rule over those facts.', 'Show the evidence and explanation.', 'Use the suggestion as a starting point for refactoring.', 'Review the result in the context of the actual design.'], complexity: 'AST parsing plus rule-specific scans over the extracted class model.', interview: 'A static analyzer can identify signals, but design quality still depends on context and intent.' },
];

export default function Learn() {
  const [group, setGroup] = useState('ALL');
  const [selectedId, setSelectedId] = useState('srtf');
  const selected = topics.find((topic) => topic.id === selectedId) ?? topics[0];
  const filtered = useMemo(() => group === 'ALL' ? topics : topics.filter((topic) => topic.group === group), [group]);
  const Icon = selected.icon;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="panel overflow-hidden p-7 md:p-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300"><BookOpen size={15} /> Interactive learning lab</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Learn the <span className="gradient-text">implementation</span>, not just the definition.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">Pick a topic to see what the implementation is doing, follow the execution steps, inspect interview notes and connect the concept directly to the CoreCS modules.</p>
          </div>
          <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1"><FilterButton active={group === 'ALL'} onClick={() => setGroup('ALL')}>All</FilterButton><FilterButton active={group === 'CPU'} onClick={() => setGroup('CPU')}>CPU</FilterButton><FilterButton active={group === 'MiniDB'} onClick={() => setGroup('MiniDB')}>MiniDB</FilterButton><FilterButton active={group === 'SOLID'} onClick={() => setGroup('SOLID')}>SOLID</FilterButton></div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="panel p-4">
          <div className="mb-3 px-2 text-xs uppercase tracking-[0.18em] text-slate-600">Topics</div>
          <div className="space-y-1">{filtered.map((topic) => { const TopicIcon = topic.icon; return <button key={topic.id} onClick={() => setSelectedId(topic.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selectedId === topic.id ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-400 hover:bg-white/[0.03]'}`}><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selectedId === topic.id ? 'bg-cyan-400/15' : 'bg-slate-900'}`}><TopicIcon size={16} /></div><div><div className="text-sm font-semibold">{topic.title}</div><div className="text-[10px] text-slate-600">{topic.group} · {topic.subtitle}</div></div></button>; })}</div>
        </aside>

        <main className="space-y-5">
          <section className="panel p-7">
            <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Icon size={23} /></div><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">{selected.group}</div><h2 className="mt-1 text-3xl font-bold">{selected.title}</h2><p className="mt-1 text-sm text-slate-500">{selected.subtitle}</p></div></div>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300">{selected.summary}</p>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="panel p-6"><div className="flex items-center gap-2 font-semibold"><PlayCircle size={17} className="text-cyan-300" /> How it works</div><div className="mt-5 space-y-3">{selected.steps.map((step, i) => <div key={step} className="flex gap-3"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">{i + 1}</div><div className="pt-1 text-sm leading-6 text-slate-400">{step}</div></div>)}</div></section>
            <section className="panel overflow-hidden"><div className="flex items-center gap-2 border-b border-white/10 p-6 font-semibold"><Terminal size={17} className="text-violet-300" /> Implementation view</div><pre className="code overflow-auto bg-[#030712] p-6 text-xs leading-6 text-slate-300">{selected.code}</pre></section>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="panel p-6"><div className="flex items-center gap-2 font-semibold"><GitBranch size={17} className="text-blue-300" /> Complexity / architecture</div><p className="mt-4 text-sm leading-6 text-slate-400">{selected.complexity}</p></section>
            <section className="panel p-6"><div className="flex items-center gap-2 font-semibold"><Lightbulb size={17} className="text-yellow-300" /> Interview note</div><p className="mt-4 text-sm leading-6 text-slate-400">{selected.interview}</p></section>
          </div>

          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-300" size={19} /><div><div className="font-semibold text-emerald-200">Connect theory to the working module</div><p className="mt-1 text-sm leading-6 text-slate-500">Open the corresponding module after studying this topic and experiment with it. The learning page explains the idea; the module lets you observe the implementation.</p></div><ArrowRight className="ml-auto hidden text-emerald-300 sm:block" size={18} /></div></section>
        </main>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-cyan-300 text-slate-950' : 'text-slate-500 hover:text-slate-200'}`}>{children}</button>;
}
