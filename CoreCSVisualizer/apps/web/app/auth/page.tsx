'use client';

import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type User = { id:number; name:string; email:string; token:string };

export default function AuthPage() {
  const [mode,setMode] = useState<'login'|'register'>('login');
  const [name,setName] = useState(''); const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [show,setShow] = useState(false); const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  const submit = async (e:React.FormEvent) => { e.preventDefault(); setBusy(true); setError('');
    try { const res = await fetch(`${API}/auth/${mode==='login'?'login':'register'}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(mode==='login'?{email,password}:{name,email,password})}); const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.message || data.error || 'Unable to authenticate.'); const user:User=data; localStorage.setItem('corecs-user',JSON.stringify(user)); window.location.href='/'; } catch(err) { setError(err instanceof Error?err.message:'Something went wrong.'); } finally { setBusy(false); }
  };
  return <div className="mx-auto grid min-h-[calc(100vh-150px)] max-w-[1200px] items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6">
    <section className="hidden md:block"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={13}/> CoreCS Identity</div><h1 className="text-5xl font-black leading-tight">Your engineering<br/><span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">workspace.</span></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">Save experiments, track learning progress, and return to the labs with your own CoreCS account.</p><div className="mt-8 grid grid-cols-3 gap-3">{[['04','Labs'],['∞','Experiments'],['01','Profile']].map(([n,l])=><div key={l} className="panel p-4"><div className="text-2xl font-black text-cyan-300">{n}</div><div className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">{l}</div></div>)}</div></section>
    <section className="panel mx-auto w-full max-w-md p-6 md:p-8"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><LockKeyhole size={19}/></div><div><div className="text-lg font-black">{mode==='login'?'Welcome back':'Create your account'}</div><div className="text-[10px] text-slate-500">{mode==='login'?'Continue your engineering journey.':'Start your personal CoreCS workspace.'}</div></div></div>
      <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/50 p-1"><button onClick={()=>{setMode('login');setError('')}} className={`rounded-lg py-2 text-xs font-black ${mode==='login'?'bg-white/10 text-white':'text-slate-500'}`}>Sign in</button><button onClick={()=>{setMode('register');setError('')}} className={`rounded-lg py-2 text-xs font-black ${mode==='register'?'bg-white/10 text-white':'text-slate-500'}`}>Register</button></div>
      <form onSubmit={submit} className="mt-6 space-y-3">{mode==='register'&&<label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</span><div className="relative"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15}/><input value={name} onChange={e=>setName(e.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-3 text-sm outline-none focus:border-cyan-300/40" placeholder="Your name"/></div></label>}
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</span><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-3 text-sm outline-none focus:border-cyan-300/40" placeholder="you@example.com"/></div></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-10 text-sm outline-none focus:border-cyan-300/40" placeholder="At least 6 characters"/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></label>
        {error&&<div className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-xs text-rose-300">{error}</div>}
        <button disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 disabled:opacity-50">{busy?'Working…':mode==='login'?'Enter workspace':'Create workspace'} <ArrowRight size={14}/></button>
      </form><Link href="/" className="mt-5 block text-center text-[10px] font-bold text-slate-500 hover:text-cyan-300">Continue without an account</Link>
    </section>
  </div>;
}
