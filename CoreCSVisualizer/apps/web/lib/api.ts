export const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000/api';
export async function api<T>(path:string,options?:RequestInit):Promise<T>{const r=await fetch(`${API}${path}`,{headers:{'Content-Type':'application/json',...(options?.headers||{})},...options});if(!r.ok){const e=await r.json().catch(()=>({error:r.statusText}));throw new Error(e.error||'Request failed')}return r.json()}
