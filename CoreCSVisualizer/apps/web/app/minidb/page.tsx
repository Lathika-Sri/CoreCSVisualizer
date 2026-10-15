'use client';

import { useState } from 'react';
import { Database, Play, Search, Server, Table2, Workflow, Zap } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';
import { api } from '@/lib/api';

const samples = [
  'CREATE TABLE students ( id INT PRIMARY KEY, name STRING, age INT );',
  'INSERT INTO students VALUES (1, Lathika, 21);',
  'INSERT INTO students VALUES (2, Arun, 22);',
  'SELECT * FROM students;',
  'SELECT name FROM students WHERE age > 20;',
  'UPDATE students SET age = 23 WHERE id = 2;',
  'DELETE FROM students WHERE id = 1;',
];

type Result = {
  message: string;
  columns: string[];
  rows: string[][];
  pages: { pageNumber: number; records: string[][] }[];
  tokens: string[];
  steps: { name: string; detail: string }[];
  indexUsed: boolean;
};

export default function MiniDb() {
  const [sql, setSql] = useState(samples[3]);
  const [r, setR] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);

  const run = async () => {
    try {
      setError('');
      setActiveStage(0);
      const result = await api<Result>('/db/query', { method: 'POST', body: JSON.stringify({ sql }) });
      setR(result);
      setActiveStage(6);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const loadDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      for (const statement of samples.slice(0, 4)) {
        const result = await api<Result>('/db/query', { method: 'POST', body: JSON.stringify({ sql: statement }) });
        setR(result);
      }
      setSql(samples[3]);
      setActiveStage(6);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDemoLoading(false);
    }
  };

  const stages = [
    ['SQL', 'Your command'],
    ['Tokenize', 'Split into tokens'],
    ['Parse', 'Build query structure'],
    ['Plan', 'Choose execution path'],
    ['Storage', 'Read/write pages'],
    ['Filter', 'Apply WHERE'],
    ['Result', 'Return rows'],
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <SectionTitle eyebrow="Database Internals" title="MiniDB — See SQL Become Data">
        A deliberately small database engine where every layer is visible: SQL → tokens → parser → execution → pages → result.
      </SectionTitle>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="panel p-5"><Database className="text-cyan-300" size={21} /><div className="mt-4 text-xs text-slate-500">ENGINE</div><div className="mt-1 text-xl font-bold">MiniDB</div><p className="mt-2 text-xs text-slate-500">Educational in-memory storage engine</p></div>
        <div className="panel p-5"><Table2 className="text-violet-300" size={21} /><div className="mt-4 text-xs text-slate-500">STORAGE</div><div className="mt-1 text-xl font-bold">Fixed pages</div><p className="mt-2 text-xs text-slate-500">Four records per visual page</p></div>
        <div className="panel p-5"><Zap className="text-emerald-300" size={21} /><div className="mt-4 text-xs text-slate-500">INDEX</div><div className="mt-1 text-xl font-bold">Hash index</div><p className="mt-2 text-xs text-slate-500">Used when an ID lookup can use it</p></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <div><div className="flex items-center gap-2 font-semibold"><TerminalIcon /> Query Console</div><p className="mt-1 text-xs text-slate-500">Try an example or write your own supported SQL.</p></div>
            <div className="flex gap-2"><button onClick={loadDemo} disabled={demoLoading} className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 disabled:opacity-50">{demoLoading ? 'Loading…' : 'Load demo data'}</button><button onClick={run} className="flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950"><Play size={14} fill="currentColor" /> Execute</button></div>
          </div>
          <div className="p-5">
            <textarea value={sql} onChange={(e) => setSql(e.target.value)} className="code h-48 w-full resize-y rounded-2xl border border-cyan-500/10 bg-[#030712] p-5 text-sm leading-7 outline-none focus:border-cyan-400/50" />
            <div className="mt-4 flex flex-wrap gap-2">{samples.map((s, i) => <button key={i} onClick={() => setSql(s)} className={`rounded-full border px-3 py-1.5 text-xs transition ${sql === s ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-slate-700 text-slate-400 hover:border-cyan-400/30'}`}>Example {i + 1}</button>)}</div>
            {error && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Execution pipeline</div><div className="mt-1 font-semibold">Watch your query travel through MiniDB</div></div><Workflow className="text-slate-600" size={25} /></div>
              <div className="grid gap-2 md:grid-cols-7">
                {stages.map(([name, detail], i) => <button key={name} onClick={() => setActiveStage(i)} className={`group rounded-xl border p-3 text-left transition ${activeStage === i ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'}`}><div className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${activeStage === i ? 'bg-cyan-300 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{i + 1}</div><div className="mt-3 text-xs font-semibold">{name}</div><div className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</div></button>)}
              </div>
            </div>

            {r && <div className="mt-6">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Zap size={17} /></div><div><div className="font-semibold text-emerald-200">{r.message}</div><div className="mt-1 text-xs text-slate-500">{r.indexUsed ? 'Hash index was used for this execution.' : 'Sequential storage path was used.'}</div></div></div>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[0.03]"><tr className="text-left text-slate-500">{r.columns.map((c) => <th className="p-3" key={c}>{c}</th>)}</tr></thead><tbody>{r.rows.length ? r.rows.map((row, i) => <tr className="border-t border-slate-800" key={i}>{row.map((x, j) => <td className="p-3" key={j}>{x}</td>)}</tr>) : <tr><td className="p-5 text-slate-500" colSpan={Math.max(1, r.columns.length)}>No rows returned.</td></tr>}</tbody></table></div>
            </div>}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="panel p-5">
            <div className="flex items-center gap-2 font-semibold"><Server size={17} className="text-cyan-300" /> Layer inspector</div>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="text-xs text-cyan-300">Stage {activeStage + 1} · {stages[activeStage][0]}</div><div className="mt-2 text-sm text-slate-300">{stages[activeStage][1]}</div>{r?.steps[activeStage] && <p className="mt-3 text-xs leading-5 text-slate-500">{r.steps[activeStage].detail}</p>}</div>
          </div>

          {r && <>
            <div className="panel p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Tokens</h2><Search size={16} className="text-slate-600" /></div><div className="mt-4 flex max-h-40 flex-wrap gap-2 overflow-auto">{r.tokens.map((token, i) => <span key={`${token}-${i}`} className="code rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-cyan-200">{token}</span>)}</div></div>
            <div className="panel p-5"><div className="flex items-center gap-2 font-semibold"><Table2 size={16} className="text-violet-300" /> Physical pages</div><div className="mt-4 space-y-3">{r.pages.map((p) => <div key={p.pageNumber} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div className="text-xs font-semibold text-violet-300">PAGE {p.pageNumber}</div>{p.records.length ? p.records.map((row, i) => <div className="code mt-2 rounded-lg bg-slate-900 p-2 text-[11px] text-slate-300" key={i}>{JSON.stringify(row)}</div>) : <div className="mt-2 text-xs text-slate-600">Empty page</div>}</div>)}</div></div>
          </>}
        </aside>
      </div>
    </div>
  );
}

function TerminalIcon() {
  return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />;
}
