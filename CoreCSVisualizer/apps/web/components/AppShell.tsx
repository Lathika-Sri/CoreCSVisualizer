'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, BarChart3, BrainCircuit, Cpu, Database, FlaskConical, GraduationCap, Layers3, LogIn, LogOut, Moon, Sparkles, Sun, UserRound } from 'lucide-react';

const nav = [
  { href: '/', label: 'Command Center', icon: Layers3 },
  { href: '/cpu-scheduling', label: 'CPU Lab', icon: Cpu },
  { href: '/minidb', label: 'MiniDB', icon: Database },
  { href: '/solid-analyzer', label: 'SOLID', icon: BrainCircuit },
  { href: '/data-structures', label: 'DSA Lab', icon: FlaskConical },
  { href: '/experiments', label: 'Benchmarks', icon: BarChart3 },
  { href: '/learn', label: 'Learning', icon: GraduationCap },
];

type User = { id:number; name:string; email:string; token:string };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('corecs-theme') as 'dark'|'light'|null) || 'dark';
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
    const raw = localStorage.getItem('corecs-user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem('corecs-user'); } }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('corecs-theme', next); document.documentElement.dataset.theme = next;
  };

  const logout = async () => {
    const raw = localStorage.getItem('corecs-user');
    if (raw) {
      try { const u = JSON.parse(raw); await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`, { method:'POST', headers:{ Authorization:`Bearer ${u.token}` } }); } catch {}
    }
    localStorage.removeItem('corecs-user'); setUser(null); setMenu(false); window.location.href = '/auth';
  };

  return <div className="min-h-screen">
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#050b15]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,.12)]"><Sparkles size={19}/></div>
          <div><div className="font-black tracking-tight">CoreCS<span className="text-cyan-300">.</span></div><div className="hidden text-[9px] uppercase tracking-[.2em] text-slate-500 sm:block">Interactive Engineering Lab</div></div>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 xl:flex">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-white/[.05] hover:text-white"><Icon size={14}/>{label}</Link>)}</nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          <button onClick={toggleTheme} title="Toggle theme" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-300/30 hover:text-cyan-200">{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button>
          {user ? <div className="relative"><button onClick={()=>setMenu(v=>!v)} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-2 text-xs font-bold"><span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-300/15 text-cyan-300"><UserRound size={13}/></span><span className="hidden max-w-24 truncate sm:block">{user.name}</span></button>{menu&&<div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-700 bg-[#0a1322] p-2 shadow-2xl"><div className="px-3 py-2"><div className="text-xs font-bold">{user.name}</div><div className="truncate text-[10px] text-slate-500">{user.email}</div></div><Link href="/" onClick={()=>setMenu(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/[.05]"><Activity size={13}/> My dashboard</Link><button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-300 hover:bg-rose-400/10"><LogOut size={13}/> Sign out</button></div>}</div> : <Link href="/auth" className="flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950"><LogIn size={14}/> Sign in</Link>}
        </div>
      </div>
      <div className="overflow-x-auto border-t border-slate-800/40 xl:hidden"><nav className="mx-auto flex max-w-[1500px] gap-1 px-4 py-2 md:px-6">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:bg-white/[.05] hover:text-white"><Icon size={13}/>{label}</Link>)}</nav></div>
    </header>
    <main>{children}</main>
    <footer className="mx-auto flex max-w-[1500px] flex-col gap-3 border-t border-slate-800/60 px-5 py-10 text-xs text-slate-500 md:flex-row md:items-center md:justify-between"><div><span className="font-bold text-slate-300">CoreCS</span> · Interactive Computer Science Engineering Lab</div><div className="flex items-center gap-2"><Activity size={13}/> Learn → Experiment → Visualize → Explain</div></footer>
  </div>;
}
