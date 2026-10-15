'use client';

import { useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Boxes, Code2, GitBranch, Lightbulb, ScanSearch, ShieldCheck } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';
import { api } from '@/lib/api';

const sample = `interface PaymentGateway {
  void pay();
  void refund();
  void audit();
  void reconcile();
  void notify();
}

class StripeGateway implements PaymentGateway {
  public void pay() {}
  public void refund() {}
  public void audit() {}
  public void reconcile() {}
  public void notify() {}
}

class OrderService {
  private StripeGateway gateway = new StripeGateway();
  void createOrder() {}
  void cancelOrder() {}
  void sendEmail() {}
  void saveOrder() {}
  void generateReport() {}
  void validateOrder() {}
}`;

type Result = {
  classes: { name: string; parent: string | null; interfaceType: boolean; methods: string[]; fields: string[]; dependencies: string[]; interfaces: string[]; overriddenMethods: string[] }[];
  issues: { principle: string; severity: string; className: string; title: string; explanation: string; suggestion: string }[];
  dependencies: { from: string; to: string; kind: string }[];
  totalClasses: number;
  totalMethods: number;
};

const principles = [
  ['S', 'Single Responsibility', 'One class should have one clear reason to change.'],
  ['O', 'Open / Closed', 'Extend behavior without repeatedly modifying stable code.'],
  ['L', 'Liskov Substitution', 'Subtypes should remain usable wherever the base type is expected.'],
  ['I', 'Interface Segregation', 'Clients should not depend on methods they do not need.'],
  ['D', 'Dependency Inversion', 'High-level logic should depend on abstractions rather than concrete details.'],
];

export default function Solid() {
  const [code, setCode] = useState(sample);
  const [r, setR] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('S');

  const run = async () => {
    try {
      setError('');
      setR(await api<Result>('/solid/analyze', { method: 'POST', body: JSON.stringify({ code }) }));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const selectedName = principles.find((p) => p[0] === selected)?.[1] ?? 'SOLID';
  const selectedIssues = r?.issues.filter((issue) => issue.principle.startsWith(selected)) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle eyebrow="Software Design" title="SOLID Analyzer">
        Turn Java source into an interactive design review: AST facts, potential issues, refactoring ideas and dependency relationships.
      </SectionTitle>

      <div className="mb-5 grid gap-3 md:grid-cols-5">
        {principles.map(([letter, name, description]) => <button key={letter} onClick={() => setSelected(letter)} className={`rounded-2xl border p-4 text-left transition ${selected === letter ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/[0.025] hover:border-white/20'}`}><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-lg font-black text-cyan-300">{letter}</span><ArrowRight size={14} className="text-slate-600" /></div><div className="mt-4 text-sm font-semibold">{name}</div><div className="mt-1 text-[11px] leading-4 text-slate-500">{description}</div></button>)}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_430px]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-5"><div><div className="flex items-center gap-2 font-semibold"><Code2 size={17} className="text-cyan-300" /> Java AST workspace</div><p className="mt-1 text-xs text-slate-500">Paste Java code. The server parses it; it does not execute your source.</p></div><button onClick={run} className="flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 font-semibold text-slate-950"><ScanSearch size={15} /> Analyze</button></div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} className="code h-[570px] w-full resize-y bg-[#030712] p-5 text-sm leading-6 outline-none" />
          {error && <div className="m-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
        </section>

        <aside className="space-y-5">
          {r ? <>
            <div className="grid grid-cols-3 gap-3"><Stat icon={<Boxes size={16} />} label="Classes" value={r.totalClasses} /><Stat icon={<Code2 size={16} />} label="Methods" value={r.totalMethods} /><Stat icon={<GitBranch size={16} />} label="Links" value={r.dependencies.length} /></div>

            <div className="panel p-5">
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-cyan-300" /><div><div className="text-xs uppercase tracking-[0.18em] text-cyan-300">Principle explorer</div><div className="font-semibold">{selectedName}</div></div></div>
              <div className="mt-5 space-y-3">{selectedIssues.length ? selectedIssues.map((x, i) => <div key={i} className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="flex items-center justify-between"><span className="font-semibold text-amber-200">{x.title}</span><AlertTriangle size={15} className="text-amber-300" /></div><div className="mt-2 text-xs text-slate-500">{x.className} · {x.severity}</div><p className="mt-3 text-sm leading-6 text-slate-400">{x.explanation}</p><div className="mt-3 flex gap-2 text-xs text-cyan-200"><Lightbulb size={14} />{x.suggestion}</div></div>) : <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">No heuristic signal for this principle in the analyzed code.</div>}</div>
            </div>

            <div className="panel p-5"><div className="flex items-center gap-2 font-semibold"><GitBranch size={17} className="text-violet-300" /> Dependency map</div><div className="mt-4 space-y-2">{r.dependencies.length ? r.dependencies.map((d, i) => <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm"><span>{d.from}</span><ArrowRight size={13} className="text-slate-600" /><span className="text-cyan-300">{d.to}</span><span className="ml-auto text-[10px] uppercase text-slate-600">{d.kind}</span></div>) : <div className="text-sm text-slate-500">No internal dependencies detected.</div>}</div></div>
          </> : <div className="panel p-10 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><ScanSearch size={25} /></div><h3 className="mt-5 text-lg font-semibold">Your design review starts here</h3><p className="mt-2 text-sm leading-6 text-slate-500">Analyze the sample to populate the principle explorer, class facts and dependency map.</p></div>}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="panel p-4"><div className="text-cyan-300">{icon}</div><div className="mt-3 text-xs text-slate-500">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>;
}
