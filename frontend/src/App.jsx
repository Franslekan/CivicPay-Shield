import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "https://civicpay-shield.onrender.com";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_TXN = [
  { id:"TXN-001", receipt_id:"RCT-001", levy_type:"Transport Levy", amount:1000, payer_name:"John Doe",   status:"paid",    created_at:"2026-03-18T10:30:00Z" },
  { id:"TXN-002", receipt_id:"RCT-002", levy_type:"Market Fee",     amount:500,  payer_name:"Jane Smith", status:"paid",    created_at:"2026-03-17T08:15:00Z" },
  { id:"TXN-003", receipt_id:"RCT-003", levy_type:"Transport Levy", amount:300,  payer_name:"John Doe",   status:"paid",    created_at:"2026-03-16T14:20:00Z" },
  { id:"TXN-004", receipt_id:"RCT-004", levy_type:"Signage Fee",    amount:2500, payer_name:"Amaka Obi",  status:"pending", created_at:"2026-03-15T09:00:00Z" },
  { id:"TXN-005", receipt_id:"RCT-005", levy_type:"Dev. Levy",      amount:2000, payer_name:"Emeka N.",   status:"paid",    created_at:"2026-03-14T11:30:00Z" },
];
const MOCK_STATS = { total_volume:6300, transaction_count:5, pending_count:1, verified_count:4 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
const fmtDate = d => new Date(d).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"});
async function apiFetch(path, opts={}, token=null){
  const headers={"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})};
  const res = await fetch(`${API_BASE}${path}`,{...opts,headers});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.detail||data.message||`Error ${res.status}`);
  return data;
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ to, prefix="", suffix="" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0; const end = typeof to === "number" ? to : parseInt(to)||0;
    if(end === 0){ setVal(0); return; }
    const dur = 1200; const step = dur/60;
    const inc = end/60;
    const t = setInterval(()=>{ start += inc; if(start >= end){ setVal(end); clearInterval(t); } else setVal(Math.floor(start)); }, step);
    return ()=>clearInterval(t);
  },[to]);
  return <span>{prefix}{typeof to === "string" && isNaN(parseInt(to)) ? to : val.toLocaleString()}{suffix}</span>;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;width:100%;margin:0;padding:0;}
.screen{position:relative;min-height:100%;width:100%;}
/* ── Keyframes ── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideR   { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideL   { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn    { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.96)} }
@keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes floatA   { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 25%{transform:translate(30px,-45px) rotate(18deg) scale(1.04)} 50%{transform:translate(-20px,-70px) rotate(-8deg) scale(.97)} 75%{transform:translate(-40px,20px) rotate(12deg) scale(1.02)} }
@keyframes floatB   { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 30%{transform:translate(-35px,50px) rotate(-22deg) scale(1.06)} 60%{transform:translate(50px,30px) rotate(14deg) scale(.94)} }
@keyframes floatC   { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 40%{transform:translate(25px,55px) rotate(30deg) scale(1.08)} 80%{transform:translate(-30px,15px) rotate(-15deg) scale(.95)} }
@keyframes floatD   { 0%,100%{transform:translate(0,0) rotate(0deg) scale(1)} 33%{transform:translate(-25px,-40px) rotate(-20deg) scale(1.05)} 66%{transform:translate(40px,-20px) rotate(10deg) scale(.96)} }
@keyframes floatE   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,35px) scale(1.07)} }
@keyframes sb1 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 20%{transform:translate(60px,-40px) rotate(72deg) scale(1.08)} 40%{transform:translate(-30px,-80px) rotate(144deg) scale(.94)} 60%{transform:translate(-70px,20px) rotate(216deg) scale(1.06)} 80%{transform:translate(40px,60px) rotate(288deg) scale(.97)} 100%{transform:translate(0,0) rotate(360deg) scale(1)} }
@keyframes sb2 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 25%{transform:translate(-50px,60px) rotate(-90deg) scale(1.1)} 50%{transform:translate(80px,40px) rotate(-180deg) scale(.92)} 75%{transform:translate(30px,-60px) rotate(-270deg) scale(1.05)} 100%{transform:translate(0,0) rotate(-360deg) scale(1)} }
@keyframes sb3 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 33%{transform:translate(50px,80px) rotate(120deg) scale(1.12)} 66%{transform:translate(-60px,30px) rotate(240deg) scale(.9)} 100%{transform:translate(0,0) rotate(360deg) scale(1)} }
@keyframes sb4 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 30%{transform:translate(-40px,-50px) rotate(-108deg) scale(1.07)} 60%{transform:translate(70px,-30px) rotate(-216deg) scale(.95)} 100%{transform:translate(0,0) rotate(-360deg) scale(1)} }
@keyframes sb5 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 40%{transform:translate(30px,70px) rotate(144deg) scale(1.09)} 80%{transform:translate(-50px,20px) rotate(288deg) scale(.93)} 100%{transform:translate(0,0) rotate(360deg) scale(1)} }
@keyframes dotPulse { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
@keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,200,83,.3)} 50%{box-shadow:0 0 40px rgba(0,200,83,.6),0 0 60px rgba(0,200,83,.2)} }
@keyframes scanLine { 0%{top:0} 100%{top:100%} }

/* ── Staggered reveals ── */
.s0{opacity:0;animation:slideUp .5s cubic-bezier(.23,1,.32,1) .05s forwards}
.s1{opacity:0;animation:slideUp .5s cubic-bezier(.23,1,.32,1) .12s forwards}
.s2{opacity:0;animation:slideUp .5s cubic-bezier(.23,1,.32,1) .20s forwards}
.s3{opacity:0;animation:slideUp .5s cubic-bezier(.23,1,.32,1) .28s forwards}
.s4{opacity:0;animation:slideUp .5s cubic-bezier(.23,1,.32,1) .36s forwards}
.sR{opacity:0;animation:slideR .45s cubic-bezier(.23,1,.32,1) .1s forwards}
.sL{opacity:0;animation:slideL .45s cubic-bezier(.23,1,.32,1) .1s forwards}
.pop{opacity:0;animation:popIn .4s cubic-bezier(.23,1,.32,1) forwards}

/* ── Base ── */
.app{font-family:'Plus Jakarta Sans',-apple-system,sans-serif;-webkit-font-smoothing:antialiased;position:fixed;inset:0;overflow-y:auto;overflow-x:hidden;background:#050F0A;color:white;}
.screen{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;}
.screen-enter{animation:slideR .4s cubic-bezier(.23,1,.32,1) forwards}
.screen-exit {animation:slideL .35s cubic-bezier(.55,0,1,.45) forwards;pointer-events:none}

/* ── Nav ── */
.nav{position:sticky;top:0;z-index:100;height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:rgba(5,15,10,.8);backdrop-filter:blur(24px);border-bottom:1px solid rgba(0,200,83,.1);}
.nav-brand{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:800;color:white;letter-spacing:-.02em;}
.nav-icon{width:32px;height:32px;background:rgba(0,200,83,.15);border:1px solid rgba(0,200,83,.3);border-radius:9px;display:flex;align-items:center;justify-content:center;animation:glow 3s ease-in-out infinite;}
.nav-avatar{width:36px;height:36px;background:rgba(0,200,83,.15);border:1.5px solid rgba(0,200,83,.35);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#00E676;cursor:pointer;transition:all .2s;}
.nav-avatar:hover{background:rgba(0,200,83,.25);transform:scale(1.05);}
.nav-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.45);font-family:inherit;padding:8px;border-radius:7px;display:flex;align-items:center;gap:5px;font-size:13px;transition:all .15s;}
.nav-btn:hover{color:#00E676;background:rgba(0,200,83,.08);}

/* ── Cards ── */
.card{background:rgba(255,255,255,.03);border:1px solid rgba(0,200,83,.1);border-radius:16px;overflow:hidden;transition:border-color .2s,box-shadow .2s;}
.card:hover{border-color:rgba(0,200,83,.2);box-shadow:0 0 0 1px rgba(0,200,83,.06),0 20px 40px rgba(0,0,0,.3);}
.card-hd{padding:18px 22px 15px;border-bottom:1px solid rgba(0,200,83,.08);}
.card-title{font-size:15px;font-weight:700;color:white;letter-spacing:-.01em;}
.card-sub{font-size:12.5px;color:rgba(255,255,255,.38);margin-top:3px;}

/* ── Inputs ── */
.inp{width:100%;padding:11px 14px;border:1px solid rgba(0,200,83,.18);border-radius:8px;font-size:13.5px;color:white;background:rgba(255,255,255,.04);outline:none;font-family:inherit;transition:all .2s;appearance:none;}
.inp:focus{border-color:#00C853;box-shadow:0 0 0 3px rgba(0,200,83,.15);background:rgba(0,200,83,.05);}
.inp::placeholder{color:rgba(255,255,255,.22);}
.inp option{background:#0a2a18;color:white;}
.lbl{display:block;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:all .18s;font-family:inherit;letter-spacing:-.01em;position:relative;overflow:hidden;}
.btn::after{content:'';position:absolute;inset:0;background:white;opacity:0;transition:opacity .15s;}
.btn:active::after{opacity:.08;}
.btn-green{background:#00C853;color:#03120A;box-shadow:0 4px 20px rgba(0,200,83,.35);}
.btn-green:hover{background:#00E676;transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,200,83,.45);}
.btn-green:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-ghost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.1);}
.btn-ghost:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.18);}
.btn-outline{background:transparent;color:#00E676;border:1.5px solid rgba(0,200,83,.35);}
.btn-outline:hover{background:rgba(0,200,83,.08);border-color:#00C853;}
.btn-red{background:#DF1B41;color:white;box-shadow:0 4px 16px rgba(223,27,65,.3);}
.btn-red:hover{background:#C01436;transform:translateY(-1px);}
.btn-red:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.btn-sm{padding:7px 15px;font-size:13px;}
.btn-lg{width:100%;padding:13px;}
.btn-back{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);font-family:inherit;display:flex;align-items:center;gap:6px;font-size:13px;transition:color .15s;padding:0;}
.btn-back:hover{color:#00E676;}

/* ── Badges ── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.03em;}
.b-ok{background:rgba(0,200,83,.14);color:#00E676;border:1px solid rgba(0,200,83,.22);}
.b-warn{background:rgba(255,179,0,.12);color:#FFB300;border:1px solid rgba(255,179,0,.2);}
.b-err{background:rgba(223,27,65,.12);color:#FF4D6D;border:1px solid rgba(223,27,65,.2);}
.b-active{background:rgba(0,200,83,.12);color:#00C853;}

/* ── Table ── */
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:rgba(0,200,83,.55);padding:12px 18px;border-bottom:1px solid rgba(0,200,83,.08);}
.tbl td{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.03);font-size:13.5px;color:rgba(255,255,255,.8);transition:background .15s;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tbody tr{cursor:pointer;}
.tbl tbody tr:hover td{background:rgba(0,200,83,.05);}

/* ── Stat card ── */
.stat{background:rgba(255,255,255,.03);border:1px solid rgba(0,200,83,.1);border-radius:14px;padding:20px;position:relative;overflow:hidden;transition:all .25s;cursor:default;}
.stat::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 20%, rgba(0,200,83,.06) 0%, transparent 70%);pointer-events:none;}
.stat:hover{border-color:rgba(0,200,83,.25);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,200,83,.1);}

/* ── Quick action ── */
.qa{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 12px;border-radius:14px;cursor:pointer;transition:all .22s;border:1px solid rgba(0,200,83,.1);background:rgba(255,255,255,.025);font-family:inherit;}
.qa:hover{background:rgba(0,200,83,.1);border-color:rgba(0,200,83,.3);transform:translateY(-4px);box-shadow:0 12px 28px rgba(0,200,83,.15);}
.qa:active{transform:translateY(-1px);}
.qa-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.qa:hover .qa-icon{transform:scale(1.12);}

/* ── Pay method ── */
.pmeth{border:1.5px solid rgba(0,200,83,.15);border-radius:10px;padding:12px 16px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.025);}
.pmeth.on{border-color:#00C853;background:rgba(0,200,83,.1);box-shadow:0 0 0 3px rgba(0,200,83,.1);}
.pmeth:hover:not(.on){border-color:rgba(0,200,83,.3);}

/* ── QR frame ── */
.qr-frame{border:2px dashed rgba(0,200,83,.22);border-radius:14px;background:rgba(0,200,83,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:26px 20px;position:relative;overflow:hidden;}
.qr-scan{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00C853,transparent);animation:scanLine 2s ease-in-out infinite;}

/* ── Spinner / loader ── */
.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.2);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;}
.spin-green{border-color:rgba(0,200,83,.2);border-top-color:#00C853;}
.dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#00C853;margin:0 2px;animation:dotPulse 1.4s ease-in-out infinite;}
.dots span:nth-child(2){animation-delay:.2s;}
.dots span:nth-child(3){animation-delay:.4s;}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(0,200,83,.2);border-radius:4px}

/* ── Login specific ── */
.login-root{position:fixed;inset:0;background:#050F0A;display:flex;align-items:center;justify-content:center;overflow-y:auto;overflow-x:hidden;padding:20px;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;}
.login-root::before{content:'';position:fixed;inset:0;background:#050F0A;z-index:-1;}
.login-card{background:rgba(5,15,10,.65);backdrop-filter:blur(36px);-webkit-backdrop-filter:blur(36px);border-radius:20px;padding:26px 28px 22px;box-shadow:0 0 0 1px rgba(0,200,83,.18),0 32px 80px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.06);width:100%;max-width:390px;}
.login-inp{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.1);border-radius:8px;font-size:13.5px;color:white;background:rgba(255,255,255,.06);outline:none;font-family:inherit;transition:all .2s;}
.login-inp:focus{border-color:#00C853;box-shadow:0 0 0 3px rgba(0,200,83,.18);background:rgba(0,200,83,.06);}
.login-inp::placeholder{color:rgba(255,255,255,.25);}
.login-lbl{display:block;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.55);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;}
.login-btn{width:100%;padding:12px;border:none;border-radius:8px;background:#00C853;color:#03120A;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .18s;letter-spacing:-.01em;box-shadow:0 4px 22px rgba(0,200,83,.38);}
.login-btn:hover{background:#00E676;transform:translateY(-1px);box-shadow:0 8px 32px rgba(0,200,83,.48);}
.login-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.login-ghost{width:100%;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .18s;margin-top:8px;}
.login-ghost:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.2);}
.login-ghost:disabled{opacity:.6;cursor:not-allowed;}

/* ── Hero gradient card ── */
.hero{border-radius:18px;padding:26px 28px 24px;position:relative;overflow:hidden;background:linear-gradient(135deg,#071a0e 0%,#0c2e1a 45%,#051208 100%);border:1px solid rgba(0,200,83,.2);}
.hero::before{content:'';position:absolute;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(0,200,83,.22) 0%,transparent 70%);top:-100px;right:-60px;pointer-events:none;}
.hero::after{content:'';position:absolute;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(29,233,182,.14) 0%,transparent 70%);bottom:-80px;left:20px;pointer-events:none;}

/* ── Amount chip ── */
.chip{padding:6px 13px;border-radius:7px;border:1.5px solid rgba(0,200,83,.2);background:rgba(255,255,255,.03);color:rgba(255,255,255,.6);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;}
.chip.on{border-color:#00C853;background:rgba(0,200,83,.15);color:#00E676;}
.chip:hover:not(.on){border-color:rgba(0,200,83,.35);color:#00C853;}

/* ── Verify result ── */
.ver-valid{background:linear-gradient(135deg,rgba(0,200,83,.18),rgba(0,200,83,.08));border:1px solid rgba(0,200,83,.3);border-radius:14px;overflow:hidden;}
.ver-invalid{background:linear-gradient(135deg,rgba(223,27,65,.16),rgba(223,27,65,.06));border:1px solid rgba(223,27,65,.3);border-radius:14px;overflow:hidden;}

/* ── Progress bar ── */
.progress-track{height:4px;background:rgba(0,200,83,.12);border-radius:4px;overflow:hidden;}
.progress-bar{height:100%;background:linear-gradient(90deg,#00C853,#00E676);border-radius:4px;transition:width 1.2s cubic-bezier(.23,1,.32,1);}

/* ── Success animation ── */
.success-circle{width:72px;height:72px;border-radius:50%;background:rgba(0,200,83,.14);border:2px solid rgba(0,200,83,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:glow 2s ease-in-out infinite,popIn .5s cubic-bezier(.23,1,.32,1) forwards;}

/* ── Receipt row ── */
.receipt-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(0,200,83,.06);}
.receipt-row:last-child{border-bottom:none;}
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const I = {
  Shield: ({size=22,c="#00C853"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.25 3.84 10.14 9 11.33C17.16 22.14 21 17.25 21 12V7L12 2Z" fill={c} opacity=".2"/>
      <path d="M12 2L3 7v5c0 5.25 3.84 10.14 9 11.33C17.16 22.14 21 17.25 21 12V7L12 2Z" stroke={c} strokeWidth="1.6"/>
      <path d="M9 12.5l2 2 4-4" stroke={c==="white"?c:"#00E676"} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Back:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Out:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Pay:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Card:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Bank:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 12 4 21 9"/><line x1="12" y1="4" x2="12" y2="20"/><rect x="3" y="9" width="4" height="11"/><rect x="10" y="9" width="4" height="11"/><rect x="17" y="9" width="4" height="11"/><line x1="1" y1="20" x2="23" y2="20"/></svg>,
  Receipt:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  Hist:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.46"/><polyline points="12 7 12 12 15 15"/></svg>,
  QR:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="19" y="19" width="2" height="2"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  BigCheck: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ─── LOGIN BLOBS ──────────────────────────────────────────────────────────────
function LoginBlobs() {
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      {/* Blur blobs */}
      <div style={{position:"absolute",top:"-18%",left:"-14%",width:700,height:640,background:"#00C853",opacity:.55,filter:"blur(118px)",borderRadius:"63% 37% 54% 46% / 55% 48% 52% 45%",animation:"sb1 30s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"-22%",right:"-10%",width:580,height:530,background:"#00BFA5",opacity:.40,filter:"blur(108px)",borderRadius:"42% 58% 67% 33% / 47% 60% 40% 53%",animation:"sb2 36s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"20%",right:"-16%",width:510,height:470,background:"#76FF03",opacity:.28,filter:"blur(130px)",borderRadius:"71% 29% 44% 56% / 61% 35% 65% 39%",animation:"sb3 24s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",bottom:"-16%",right:"2%",width:490,height:450,background:"#1DE9B6",opacity:.32,filter:"blur(102px)",borderRadius:"55% 45% 38% 62% / 49% 67% 33% 51%",animation:"sb4 28s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",bottom:"-20%",left:"3%",width:560,height:500,background:"#00695C",opacity:.50,filter:"blur(112px)",borderRadius:"38% 62% 57% 43% / 44% 52% 48% 56%",animation:"sb5 22s ease-in-out infinite",willChange:"transform"}}/>
      {/* 3D shapes */}
      <div style={{position:"absolute",top:"-55px",left:"-35px",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle at 34% 28%,rgba(0,230,100,.96) 0%,rgba(0,200,83,.85) 40%,rgba(0,130,55,.70) 100%)",boxShadow:"0 28px 72px rgba(0,200,83,.40),inset 0 -8px 20px rgba(0,80,30,.45),inset 0 8px 16px rgba(160,255,200,.50)",animation:"floatA 20s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"-28px",left:"-6px",width:76,height:56,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(255,255,255,.52) 0%,transparent 70%)",animation:"floatA 20s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"5%",right:"-28px",width:195,height:115,borderRadius:"58px",background:"radial-gradient(ellipse at 40% 30%,rgba(100,255,220,.95) 0%,rgba(0,191,165,.88) 45%,rgba(0,120,105,.75) 100%)",boxShadow:"0 18px 55px rgba(0,191,165,.38),inset 0 -6px 14px rgba(0,80,70,.38),inset 0 6px 12px rgba(160,255,236,.48)",transform:"rotate(-18deg)",animation:"floatB 17s ease-in-out infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"37%",right:"-18px",width:175,height:175,borderRadius:"50%",background:"radial-gradient(circle at 38% 32%,rgba(200,255,80,.95) 0%,rgba(118,255,3,.85) 45%,rgba(70,160,0,.72) 100%)",boxShadow:"0 22px 56px rgba(118,255,3,.30),inset 0 -6px 16px rgba(40,100,0,.40),inset 0 6px 14px rgba(220,255,160,.50)",animation:"floatC 23s ease-in-out 2s infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",bottom:"7%",left:"-28px",width:215,height:135,borderRadius:"26px",background:"radial-gradient(ellipse at 38% 30%,rgba(80,220,170,.95) 0%,rgba(0,150,100,.88) 45%,rgba(0,100,70,.75) 100%)",boxShadow:"0 22px 56px rgba(0,150,100,.30),inset 0 -6px 14px rgba(0,60,40,.38),inset 0 6px 12px rgba(140,255,210,.48)",transform:"rotate(13deg)",animation:"floatD 19s ease-in-out 1s infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",bottom:"11%",right:"7%",width:125,height:125,borderRadius:"50%",background:"radial-gradient(circle at 38% 32%,rgba(140,255,235,.95) 0%,rgba(29,233,182,.88) 45%,rgba(0,150,120,.76) 100%)",boxShadow:"0 18px 48px rgba(29,233,182,.30),inset 0 -5px 12px rgba(0,90,70,.38),inset 0 5px 10px rgba(180,255,240,.50)",animation:"floatE 15s ease-in-out 3s infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"21%",left:"5%",width:86,height:86,borderRadius:"50%",background:"radial-gradient(circle at 38% 32%,rgba(180,255,100,.90) 0%,rgba(118,255,3,.80) 55%,rgba(60,160,0,.70) 100%)",boxShadow:"0 12px 36px rgba(118,255,3,.28)",animation:"floatB 25s ease-in-out 4s infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",top:"15%",right:"13%",width:155,height:58,borderRadius:"29px",background:"linear-gradient(105deg,rgba(0,230,180,.88) 0%,rgba(0,191,165,.84) 50%,rgba(0,150,120,.78) 100%)",boxShadow:"0 12px 36px rgba(0,191,165,.28)",transform:"rotate(-28deg)",animation:"floatA 26s ease-in-out 6s infinite",willChange:"transform"}}/>
      <div style={{position:"absolute",bottom:"27%",left:"13%",width:96,height:48,borderRadius:"24px",background:"radial-gradient(ellipse at 40% 30%,rgba(220,255,160,.90) 0%,rgba(180,230,80,.82) 55%,rgba(120,170,30,.72) 100%)",transform:"rotate(20deg)",animation:"floatC 21s ease-in-out 5s infinite",willChange:"transform"}}/>
      {/* Grain */}
      <div style={{position:"absolute",inset:0,opacity:.38,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E\")",backgroundRepeat:"repeat",backgroundSize:"160px 160px",mixBlendMode:"screen"}}/>
    </div>
  );
}

// ─── INNER BG ─────────────────────────────────────────────────────────────────
function InnerBg() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden",background:"#050F0A"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,200,83,.08) 0%,transparent 70%)",top:"-200px",left:"-100px"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(29,233,182,.06) 0%,transparent 70%)",bottom:"-150px",right:"-80px"}}/>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(118,255,3,.04) 0%,transparent 70%)",top:"40%",right:"20%"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(0,200,83,.055) 1px,transparent 1px)",backgroundSize:"40px 40px",opacity:.8}}/>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({user, onLogout, onBack, title}) {
  return (
    <header className="nav">
      <div className="nav-brand">
        {onBack && (
          <button className="btn-back" onClick={onBack} style={{marginRight:8}}>
            <I.Back/> <span style={{fontSize:12}}>Back</span>
          </button>
        )}
        <div className="nav-icon"><I.Shield size={16}/></div>
        <span>{title||"CivicPay Shield"}</span>
      </div>
      {user && (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right",display:"flex",flexDirection:"column"}}>
            <span style={{fontSize:13,fontWeight:700,color:"white"}}>{user.name||"User"}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,.38)",textTransform:"capitalize"}}>{user.role}</span>
          </div>
          <div className="nav-avatar">{(user.name||"U")[0].toUpperCase()}</div>
          <button className="nav-btn" onClick={onLogout} title="Sign out"><I.Out/></button>
        </div>
      )}
    </header>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [reg, setReg] = useState({name:"",email:"",phone:"",password:"",role:"citizen",secret_code:""});
  const [regLoading, setRegLoading] = useState(false);
  const [regOk, setRegOk] = useState(false);
  const [regErr, setRegErr] = useState("");

  const login = async (role) => {
    if(!id.trim()||!pw.trim()){setErr("Please fill in all fields.");return;}
    setLoading(true);setErr("");
    try {
      const d = await apiFetch("/api/auth/login",{method:"POST",body:JSON.stringify({identifier:id.trim(),password:pw,role})});
      onLogin({token:d.access_token,user:{...d.user,role},role});
    } catch {
      onLogin({token:"demo",user:{name:id.includes("@")?id.split("@")[0]:id,email:id,role},role});
    } finally {setLoading(false);}
  };

  const register = async () => {
    if(!reg.name||!reg.email||!reg.password){setRegErr("Name, email and password are required.");return;}
    if(reg.role==="collector"&&!reg.secret_code.trim()){setRegErr("Secret passcode is required for Collector accounts.");return;}
    setRegLoading(true);setRegErr("");
    try {
      await apiFetch("/api/auth/register",{method:"POST",body:JSON.stringify({
        name:reg.name, email:reg.email, phone:reg.phone,
        password:reg.password, role:reg.role,
        ...(reg.role==="collector"?{secret_code:reg.secret_code}:{})
      })});
    } catch {}
    setRegOk(true);
    setTimeout(()=>{setShowReg(false);setRegOk(false);setId(reg.email);},2000);
    setRegLoading(false);
  };

  return (
    <div className="login-root">
      <LoginBlobs/>

      {/* Wrapper — centres both login and registration */}
      <div style={{
        position:"relative", zIndex:1, width:"100%", maxWidth:390,
        margin:"auto",
        display:"flex", flexDirection:"column", alignItems:"center",
        padding: showReg ? "16px 0" : "0",
      }}>

        {/* Badge — hidden during registration to save space */}
        {!showReg && (
          <div className="s0" style={{textAlign:"center",marginBottom:14,width:"100%"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,200,83,.1)",border:"1px solid rgba(0,200,83,.22)",borderRadius:100,padding:"5px 14px"}}>
              <I.Shield size={10}/>
              <span style={{fontSize:10.5,color:"#00E676",letterSpacing:".07em",textTransform:"uppercase",fontWeight:700,opacity:.9}}>Enyata × Interswitch Buildathon 2026</span>
            </span>
          </div>
        )}

        <div className="login-card s1" style={{width:"100%"}}>

          {/* Logo — compact in reg mode */}
          <div style={{textAlign:"center",marginBottom: showReg ? 14 : 20}}>
            <div style={{
              width: showReg ? 40 : 50,
              height: showReg ? 40 : 50,
              background:"rgba(0,200,83,.13)",border:"1px solid rgba(0,200,83,.3)",
              borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto", marginBottom: showReg ? 8 : 11,
              animation:"glow 3s ease-in-out infinite",
              transition:"all .3s",
            }}>
              <I.Shield size={showReg ? 18 : 22}/>
            </div>
            <h1 style={{fontSize: showReg ? 18 : 21,fontWeight:800,color:"white",letterSpacing:"-.03em",marginBottom:2}}>
              {showReg ? "Create Account" : "CivicPay Shield"}
            </h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.38)"}}>
              {showReg ? "Join the digital levy platform" : "Secure Government Payment Portal"}
            </p>
          </div>

          {!showReg ? (
            /* ── LOGIN FORM ── */
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {err && <div style={{background:"rgba(223,27,65,.1)",border:"1px solid rgba(223,27,65,.2)",borderRadius:8,padding:"9px 12px",color:"#FF4D6D",fontSize:12.5,display:"flex",gap:6,alignItems:"center",animation:"popIn .3s forwards"}}><I.Alert/>{err}</div>}
              <div>
                <label className="login-lbl">Email or Phone</label>
                <input className="login-inp" type="text" placeholder="citizen@example.com" value={id} onChange={e=>setId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login("citizen")}/>
              </div>
              <div>
                <label className="login-lbl">Password</label>
                <input className="login-inp" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login("citizen")}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
                <button className="login-btn" onClick={()=>login("citizen")} disabled={loading}>
                  {loading?<span className="spin"/>:"Login as Citizen"}
                </button>
                <button className="login-ghost" onClick={()=>login("collector")} disabled={loading}>
                  Login as Collector
                </button>
              </div>
              <div style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,.35)",marginTop:4}}>
                New? <button onClick={()=>setShowReg(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#00E676",fontWeight:700,fontFamily:"inherit",fontSize:13}}>Create account →</button>
              </div>
            </div>
          ) : (
            /* ── REGISTRATION FORM ── */
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {regOk && (
                <div style={{background:"rgba(0,200,83,.12)",border:"1px solid rgba(0,200,83,.25)",borderRadius:8,padding:"8px 12px",color:"#00E676",fontSize:12.5,animation:"popIn .3s forwards"}}>
                  ✓ Account created! Redirecting…
                </div>
              )}
              {regErr && (
                <div style={{background:"rgba(223,27,65,.1)",border:"1px solid rgba(223,27,65,.2)",borderRadius:8,padding:"8px 12px",color:"#FF4D6D",fontSize:12.5}}>
                  {regErr}
                </div>
              )}

              {/* Two-column layout for name + phone */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                <div>
                  <label className="login-lbl">Full Name</label>
                  <input className="login-inp" type="text" placeholder="John Doe" value={reg.name} onChange={e=>setReg(r=>({...r,name:e.target.value}))} style={{padding:"9px 12px"}}/>
                </div>
                <div>
                  <label className="login-lbl">Phone</label>
                  <input className="login-inp" type="tel" placeholder="+234 800..." value={reg.phone} onChange={e=>setReg(r=>({...r,phone:e.target.value}))} style={{padding:"9px 12px"}}/>
                </div>
              </div>

              <div>
                <label className="login-lbl">Email</label>
                <input className="login-inp" type="email" placeholder="you@example.com" value={reg.email} onChange={e=>setReg(r=>({...r,email:e.target.value}))} style={{padding:"9px 12px"}}/>
              </div>

              <div>
                <label className="login-lbl">Password</label>
                <input className="login-inp" type="password" placeholder="••••••••" value={reg.password} onChange={e=>setReg(r=>({...r,password:e.target.value}))} style={{padding:"9px 12px"}}/>
              </div>

              {/* Role as pill toggle */}
              <div>
                <label className="login-lbl">Account Role</label>
                <div style={{display:"flex",gap:8}}>
                  {["citizen","collector"].map(r=>(
                    <button key={r} onClick={()=>setReg(d=>({...d,role:r,secret_code:""}))}
                      style={{
                        flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${reg.role===r?"#00C853":"rgba(255,255,255,.1)"}`,
                        background:reg.role===r?"rgba(0,200,83,.15)":"rgba(255,255,255,.04)",
                        color:reg.role===r?"#00E676":"rgba(255,255,255,.5)",
                        fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",
                        transition:"all .18s",textTransform:"capitalize",
                      }}>
                      {r==="citizen"?"👤 Citizen":"🔍 Collector"}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP Secret Passcode — only shown for Collector */}
              {reg.role==="collector" && (
                <div style={{animation:"popIn .3s cubic-bezier(.23,1,.32,1) forwards"}}>
                  <label className="login-lbl" style={{color:"#FFB300"}}>
                    🔐 VIP Security Passcode
                  </label>
                  <input
                    className="login-inp"
                    type="password"
                    placeholder="Enter collector passcode"
                    value={reg.secret_code}
                    onChange={e=>setReg(r=>({...r,secret_code:e.target.value}))}
                    style={{padding:"9px 12px",borderColor:"rgba(255,179,0,.3)",background:"rgba(255,179,0,.05)"}}
                  />
                  <p style={{fontSize:11,color:"rgba(255,179,0,.6)",marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                    ⚠ Collector accounts require authorisation from your supervisor
                  </p>
                </div>
              )}

              <button className="login-btn" style={{marginTop:4}} onClick={register} disabled={regLoading}>
                {regLoading?<span className="spin"/>:"Create Account →"}
              </button>

              <button onClick={()=>setShowReg(false)}
                style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.35)",fontFamily:"inherit",fontSize:13,textAlign:"center",padding:"4px"}}>
                ← Back to login
              </button>
            </div>
          )}

          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <I.Shield size={10} c="rgba(0,200,83,.4)"/>
            <span style={{fontSize:11,color:"rgba(255,255,255,.2)",letterSpacing:".03em"}}>256-bit TLS · Powered by Interswitch</span>
          </div>
        </div>

        {!showReg && (
          <p className="s2" style={{textAlign:"center",marginTop:10,fontSize:11,color:"rgba(255,255,255,.15)"}}>© 2026 CivicPay Shield · Enyata x Interswitch</p>
        )}
      </div>
    </div>
  );
}

// ─── CITIZEN DASHBOARD ────────────────────────────────────────────────────────
function CitizenDashboard({session, onLogout, onPay}) {
  const {token,user} = session;
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const fetchData = useCallback(()=>{
    setLoading(true);
    apiFetch("/api/payments/history",{},token)
      .then(d=>{
        const list = d.transactions || d || [];
        setTxns(Array.isArray(list)?list:[]);
        if(d.balance!=null) setBalance(d.balance);
        else setBalance(list.filter(t=>t.status==="paid"||t.status==="completed").reduce((s,t)=>s+t.amount,0));
      })
      .catch(()=>{ setTxns(MOCK_TXN); setBalance(MOCK_TXN.filter(t=>t.status==="paid").reduce((s,t)=>s+t.amount,0)); })
      .finally(()=>setLoading(false));
  },[token]);

  useEffect(()=>{ fetchData(); },[fetchData]);

  const paid = txns.filter(t=>t.status==="paid"||t.status==="completed");
  const total = paid.reduce((s,t)=>s+t.amount,0);

  return (
    <div className="app screen screen-enter" style={{position:"relative"}}>
      <style>{CSS}</style>
      <InnerBg/>
      <div style={{position:"relative",zIndex:1}}>
        <Nav user={user} onLogout={onLogout}/>
        <main style={{maxWidth:900,margin:"0 auto",padding:"24px 20px 60px"}}>

          {/* Hero */}
          <div className="hero s0" style={{marginBottom:18}}>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:"rgba(0,200,83,.65)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:8}}>Account Balance</p>
                  <div style={{fontSize:38,fontWeight:800,color:"white",letterSpacing:"-.04em",lineHeight:1}}>
                    {balance===null ? <span className="dots"><span/><span/><span/></span> : <>₦<Counter to={balance}/></>}
                  </div>
                  <p style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:8}}>Welcome back, <span style={{color:"#00E676",fontWeight:700}}>{user?.name||"there"}</span> 👋</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                  <span className="badge b-active">✓ Active</span>
                  <button className="btn btn-green btn-sm" onClick={onPay} style={{marginTop:4}}>+ Pay Levy</button>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap"}}>
                {[["Total Paid",fmt(total)],["Transactions",txns.length],["This Month",fmt(paid.slice(0,2).reduce((s,t)=>s+t.amount,0))]].map(([l,v],i)=>(
                  <div key={i} style={{background:"rgba(0,200,83,.08)",borderRadius:10,padding:"10px 16px",border:"1px solid rgba(0,200,83,.15)",transition:"all .2s",cursor:"default"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,200,83,.14)";e.currentTarget.style.transform="translateY(-2px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,200,83,.08)";e.currentTarget.style.transform="translateY(0)"}}>
                    <div style={{fontSize:9.5,color:"rgba(255,255,255,.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:800,color:"white",marginTop:3}}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Progress */}
              <div style={{marginTop:18}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Monthly levy target</span>
                  <span style={{fontSize:11,color:"#00E676",fontWeight:700}}>73%</span>
                </div>
                <div className="progress-track"><div className="progress-bar" style={{width:"73%"}}/></div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="s1" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
            {[
              {icon:<I.Pay/>,label:"Pay Levy",sub:"Make a payment",action:onPay,c:"#00C853"},
              {icon:<I.Receipt/>,label:"Receipts",sub:"View history",action:()=>{},c:"#1DE9B6"},
              {icon:<I.Hist/>,label:"History",sub:"All transactions",action:()=>{},c:"#76FF03"},
            ].map((a,i)=>(
              <button key={i} className="qa" onClick={a.action}>
                <div className="qa-icon" style={{background:`${a.c}18`,color:a.c}}>{a.icon}</div>
                <span style={{fontSize:13,fontWeight:700,color:"white"}}>{a.label}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{a.sub}</span>
              </button>
            ))}
          </div>

          {/* Transactions */}
          <div className="card s2">
            <div className="card-hd" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div className="card-title">Recent Transactions</div>
                <div className="card-sub">{txns.length} payments on record</div>
              </div>
              <button className="btn btn-green btn-sm" onClick={onPay}>+ Pay Levy</button>
            </div>
            {loading ? (
              <div style={{padding:40,textAlign:"center"}}><div className="dots"><span/><span/><span/></div></div>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table className="tbl">
                  <thead><tr>{["Receipt","Levy Type","Amount","Date","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {txns.map((t,i)=>(
                      <tr key={t.id} onClick={()=>setActiveRow(activeRow===i?null:i)}
                        style={{animation:`slideUp .4s cubic-bezier(.23,1,.32,1) ${i*.06}s both`}}>
                        <td><span style={{fontFamily:"monospace",fontSize:12,color:"rgba(0,200,83,.6)"}}>{t.receipt_id}</span></td>
                        <td><span style={{fontWeight:600,color:"rgba(255,255,255,.85)"}}>{t.levy_type}</span></td>
                        <td><span style={{fontWeight:800,color:"#00E676"}}>{fmt(t.amount)}</span></td>
                        <td><span style={{color:"rgba(255,255,255,.38)",fontSize:12.5}}>{fmtDate(t.created_at)}</span></td>
                        <td>
                          <span className={`badge ${t.status==="paid"||t.status==="completed"?"b-ok":t.status==="pending"?"b-warn":"b-err"}`}>
                            {t.status==="paid"?"✓ paid":t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── PAY LEVY ─────────────────────────────────────────────────────────────────
function PayLevyScreen({session, onBack}) {
  const {token,user} = session;
  const [form, setForm] = useState({levy_type:"Transport Levy",amount:"",payer_name:user?.name||"",vehicle_number:""});
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [otpErr, setOtpErr] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const upd = (k,v)=>setForm(p=>({...p,[k]:v}));
  const LEVIES = ["Transport Levy","Market Fee","Signage Fee","Waste Management Fee","Development Levy"];
  const AMOUNTS = {"Transport Levy":[300,500,1000],"Market Fee":[200,500,1000],"Signage Fee":[1000,2500,5000],"Waste Management Fee":[500,1000],"Development Levy":[2000,5000]};

  const handleOtpKey = (i,e) => {
    const val = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[i]=val; setOtp(next);
    if(val && i<5) otpRefs[i+1].current?.focus();
    if(e.key==="Backspace"&&!val&&i>0) otpRefs[i-1].current?.focus();
  };

  const initPay = ()=>{
    if(!form.amount||isNaN(+form.amount)||+form.amount<=0){setErr("Enter a valid amount.");return;}
    if(!form.payer_name.trim()){setErr("Payer name is required.");return;}
    setErr(""); setOtp(["","","","","",""]); setOtpErr(""); setShowOtp(true);
  };

  const confirmPay = async()=>{
    const code = otp.join("");
    if(code.length<6){setOtpErr("Enter the full 6-digit OTP.");return;}
    setOtpLoading(true); setOtpErr("");
    try {
      const d = await apiFetch("/api/payments/initialize",{method:"POST",body:JSON.stringify({
        ...form, amount:+form.amount, payment_method:method, otp:code
      })},token);
      setShowOtp(false); setSuccess(d);
    } catch {
      // Demo: any 6-digit code works
      setShowOtp(false);
      setSuccess({receipt_id:`RCT-${Date.now().toString().slice(-5)}`,amount:+form.amount,levy_type:form.levy_type,status:"paid"});
    } finally{setOtpLoading(false);}
  };

  if(success) return (
    <div className="app screen screen-enter">
      <style>{CSS}</style>
      <InnerBg/>
      <div style={{position:"relative",zIndex:1}}>
        <Nav user={user} onLogout={onBack} onBack={onBack} title="Payment Receipt"/>
        <main style={{maxWidth:500,margin:"40px auto",padding:"0 16px"}}>
          <div className="card pop" style={{padding:"40px 30px",textAlign:"center"}}>
            <div className="success-circle"><I.BigCheck/></div>
            <h2 style={{fontSize:22,fontWeight:800,color:"white",marginBottom:6}}>Payment Successful!</h2>
            <p style={{fontSize:13.5,color:"rgba(255,255,255,.4)",marginBottom:26}}>Your levy has been recorded and a receipt generated.</p>
            <div style={{background:"rgba(0,200,83,.05)",borderRadius:12,padding:"16px",textAlign:"left",marginBottom:24,border:"1px solid rgba(0,200,83,.12)"}}>
              {[["Receipt ID",success.receipt_id],["Levy Type",success.levy_type||form.levy_type],["Amount",fmt(success.amount||form.amount)],["Status","✓ paid"]].map(([k,v])=>(
                <div key={k} className="receipt-row">
                  <span style={{color:"rgba(255,255,255,.45)",fontSize:13,fontWeight:500}}>{k}</span>
                  <span style={{fontWeight:700,color:k==="Status"?"#00E676":"white",fontFamily:k==="Receipt ID"?"monospace":"inherit",fontSize:13.5}}>{String(v)}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-outline" style={{flex:1}} onClick={onBack}>← Dashboard</button>
              <button className="btn btn-green" style={{flex:1}} onClick={()=>{setSuccess(null);setForm(p=>({...p,amount:""}));}}>New Payment</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="app screen screen-enter">
      <style>{CSS}</style>
      <InnerBg/>
      <div style={{position:"relative",zIndex:1}}>
        <Nav user={user} onLogout={onBack} onBack={onBack} title="Pay Levy"/>
        <main style={{maxWidth:560,margin:"24px auto",padding:"0 16px 48px"}}>
          <div className="card s0">
            <div className="card-hd">
              <div className="card-title">Make a Levy Payment</div>
              <div className="card-sub">All payments are secured and receipted via Interswitch</div>
            </div>
            <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
              {err && <div style={{background:"rgba(223,27,65,.1)",border:"1px solid rgba(223,27,65,.2)",borderRadius:8,padding:"10px 14px",color:"#FF4D6D",fontSize:13,display:"flex",gap:7,alignItems:"center",animation:"popIn .3s forwards"}}><I.Alert/>{err}</div>}

              <div className="s1">
                <label className="lbl">Levy Type</label>
                <select className="inp" value={form.levy_type} onChange={e=>upd("levy_type",e.target.value)}>
                  {LEVIES.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="s2">
                <label className="lbl">Amount (₦)</label>
                <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
                  {(AMOUNTS[form.levy_type]||[]).map((a,i)=>(
                    <button key={a} className={`chip${form.amount===String(a)?" on":""}`}
                      style={{animation:`popIn .3s cubic-bezier(.23,1,.32,1) ${i*.08}s both`}}
                      onClick={()=>upd("amount",String(a))}>{fmt(a)}</button>
                  ))}
                </div>
                <input className="inp" type="number" placeholder="Or enter custom amount" value={form.amount} onChange={e=>upd("amount",e.target.value)}/>
              </div>

              <div className="s3">
                <label className="lbl">Payer Name</label>
                <input className="inp" placeholder="Full name" value={form.payer_name} onChange={e=>upd("payer_name",e.target.value)}/>
              </div>

              <div className="s3">
                <label className="lbl">Vehicle Number <span style={{color:"rgba(255,255,255,.3)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></label>
                <input className="inp" placeholder="e.g. LGS-123-XY" value={form.vehicle_number} onChange={e=>upd("vehicle_number",e.target.value)}/>
              </div>

              <div className="s4">
                <label className="lbl">Payment Method</label>
                <div style={{display:"flex",gap:9}}>
                  {[{id:"card",label:"Debit Card",icon:<I.Card/>},{id:"bank_transfer",label:"Bank Transfer",icon:<I.Bank/>}].map(m=>(
                    <div key={m.id} className={`pmeth${method===m.id?" on":""}`} style={{flex:1}} onClick={()=>setMethod(m.id)}>
                      <div style={{color:method===m.id?"#00C853":"rgba(255,255,255,.4)"}}>{m.icon}</div>
                      <div style={{fontSize:13,fontWeight:600,color:method===m.id?"#00E676":"rgba(255,255,255,.7)"}}>{m.label}</div>
                      {method===m.id&&<span style={{marginLeft:"auto",color:"#00C853",fontWeight:800,fontSize:16}}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {form.amount && (
                <div style={{background:"rgba(0,200,83,.07)",borderRadius:10,padding:"14px 18px",border:"1px solid rgba(0,200,83,.18)",display:"flex",justifyContent:"space-between",alignItems:"baseline",animation:"popIn .3s forwards"}}>
                  <span style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>Payment total</span>
                  <span style={{fontWeight:800,fontSize:22,color:"#00E676",letterSpacing:"-.03em"}}>{fmt(+form.amount||0)}</span>
                </div>
              )}

              <button className="btn btn-green btn-lg" onClick={initPay} disabled={loading||!form.amount||!form.payer_name}>
                {loading?<><span className="spin"/>Processing…</>:<>Pay {form.amount?fmt(+form.amount):"Now"} →</>}
              </button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:14}}>
            <I.Shield size={10} c="rgba(0,200,83,.4)"/>
            <span style={{fontSize:11.5,color:"rgba(255,255,255,.22)"}}>Secured by Interswitch · 256-bit encryption</span>
          </div>
        </main>
      </div>

      {/* ── OTP MODAL ── */}
      {showOtp && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s forwards"}}>
          <div style={{background:"rgba(5,15,10,.95)",border:"1px solid rgba(0,200,83,.25)",borderRadius:20,padding:"36px 32px",maxWidth:380,width:"100%",boxShadow:"0 0 0 1px rgba(0,200,83,.1),0 32px 80px rgba(0,0,0,.8)",animation:"popIn .3s cubic-bezier(.23,1,.32,1) forwards"}}>
            {/* Icon */}
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:56,height:56,background:"rgba(0,200,83,.13)",border:"1px solid rgba(0,200,83,.3)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,animation:"glow 2s ease-in-out infinite"}}>🔐</div>
              <h2 style={{fontSize:19,fontWeight:800,color:"white",marginBottom:5}}>Authorise Payment</h2>
              <p style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>Enter the 6-digit OTP sent to your registered number</p>
            </div>

            {/* Amount reminder */}
            <div style={{background:"rgba(0,200,83,.07)",borderRadius:10,padding:"12px 16px",textAlign:"center",marginBottom:22,border:"1px solid rgba(0,200,83,.14)"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>Authorising payment of</p>
              <p style={{fontSize:22,fontWeight:800,color:"#00E676",letterSpacing:"-.02em"}}>{fmt(+form.amount)}</p>
            </div>

            {/* 6 OTP boxes */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:10}}>
              {otp.map((v,i)=>(
                <input key={i} ref={otpRefs[i]}
                  type="text" inputMode="numeric" maxLength={1}
                  value={v}
                  onChange={e=>handleOtpKey(i,e)}
                  onKeyDown={e=>handleOtpKey(i,e)}
                  style={{
                    width:44,height:52,textAlign:"center",fontSize:22,fontWeight:800,
                    border:`2px solid ${v?"#00C853":"rgba(0,200,83,.2)"}`,
                    borderRadius:10,background:v?"rgba(0,200,83,.12)":"rgba(255,255,255,.04)",
                    color:"white",outline:"none",fontFamily:"monospace",
                    transition:"all .15s",caretColor:"#00E676",
                  }}
                />
              ))}
            </div>

            {otpErr && <p style={{textAlign:"center",color:"#FF4D6D",fontSize:12.5,marginBottom:10,animation:"popIn .2s forwards"}}>{otpErr}</p>}

            <p style={{textAlign:"center",fontSize:11.5,color:"rgba(255,255,255,.3)",marginBottom:18}}>
              Demo OTP: enter any 6 digits
            </p>

            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowOtp(false)}>Cancel</button>
              <button className="btn btn-green" style={{flex:1}} onClick={confirmPay} disabled={otpLoading||otp.join("").length<6}>
                {otpLoading?<span className="spin"/>:"Confirm →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COLLECTOR DASHBOARD ──────────────────────────────────────────────────────
function CollectorDashboard({session, onLogout}) {
  const {token,user} = session;
  const [receiptId, setReceiptId] = useState("");
  const [verResult, setVerResult] = useState(null);
  const [verLoading, setVerLoading] = useState(false);
  const [verErr, setVerErr] = useState("");
  const [txns, setTxns] = useState(MOCK_TXN);
  const [stats, setStats] = useState(MOCK_STATS);
  const [txnLoading, setTxnLoading] = useState(true);
  const [flagging, setFlagging] = useState(false);
  const [approving, setApproving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  // Cash payment modal
  const [showCash, setShowCash] = useState(false);
  const [cash, setCash] = useState({citizen_name:"",levy_type:"Transport Levy",amount:"",phone:""});
  const [cashLoading, setCashLoading] = useState(false);
  const [cashOk, setCashOk] = useState(null);

  useEffect(()=>{
    apiFetch("/api/admin/transactions",{},token)
      .then(d=>{setTxns(d.transactions||d);if(d.stats)setStats(d.stats);})
      .catch(()=>{})
      .finally(()=>setTxnLoading(false));
  },[token]);

  const verify = async()=>{
    if(!receiptId.trim()){setVerErr("Enter a Receipt ID.");return;}
    setVerLoading(true);setVerErr("");setVerResult(null);setActionMsg("");
    try {
      const d = await apiFetch(`/api/payments/verify/${receiptId.trim()}`,{},token);
      setVerResult(d);
    } catch {
      const m = MOCK_TXN.find(t=>t.receipt_id===receiptId.trim()||t.id===receiptId.trim());
      if(m) setVerResult({...m,is_valid:m.status==="paid"});
      else setVerErr("Receipt not found. Try RCT-001 to RCT-005.");
    } finally{setVerLoading(false);}
  };

  const action = async(act)=>{
    const setL = act==="approve"?setApproving:setFlagging;
    setL(true);setActionMsg("");
    try{await apiFetch(`/api/admin/transactions/${verResult.id}/${act}`,{method:"POST"},token);}catch{}
    setActionMsg(act==="approve"?"Transaction approved!":"Transaction flagged for review.");
    setVerResult(p=>({...p,status:act==="approve"?"paid":"flagged",is_valid:act==="approve"}));
    setL(false);
  };

  const logCash = async()=>{
    if(!cash.citizen_name.trim()||!cash.amount){return;}
    setCashLoading(true);
    try {
      await apiFetch("/api/payments/initialize",{method:"POST",body:JSON.stringify({
        payer_name:cash.citizen_name, levy_type:cash.levy_type,
        amount:+cash.amount, payment_method:"cash",
        phone:cash.phone, collected_by:user?.name||"Collector",
      })},token);
    } catch {}
    const receipt = `RCT-${Date.now().toString().slice(-5)}`;
    setCashOk({...cash,amount:+cash.amount,receipt});
    // Add to local txn list
    setTxns(p=>[{id:receipt,receipt_id:receipt,levy_type:cash.levy_type,amount:+cash.amount,payer_name:cash.citizen_name,status:"paid",created_at:new Date().toISOString()},...p]);
    setStats(p=>({...p,total_volume:p.total_volume+(+cash.amount),transaction_count:p.transaction_count+1,verified_count:p.verified_count+1}));
    setCashLoading(false);
  };

  const STAT_COLORS = ["#00C853","#1DE9B6","#76FF03","#FFB300"];

  return (
    <div className="app screen screen-enter">
      <style>{CSS}</style>
      <InnerBg/>
      <div style={{position:"relative",zIndex:1}}>
        <Nav user={user} onLogout={onLogout}/>
        <main style={{maxWidth:960,margin:"0 auto",padding:"24px 20px 60px"}}>

          <div className="s0" style={{marginBottom:20,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:800,color:"white",letterSpacing:"-.03em"}}>Collector Dashboard</h1>
              <p style={{fontSize:13.5,color:"rgba(255,255,255,.38)",marginTop:4}}>Verify payments and manage levy collections in real time</p>
            </div>
            {/* ─── Log Cash Payment CTA ─── */}
            <button className="btn btn-green" onClick={()=>{setShowCash(true);setCashOk(null);setCash({citizen_name:"",levy_type:"Transport Levy",amount:"",phone:""});}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",fontSize:14,boxShadow:"0 4px 20px rgba(0,200,83,.35)"}}>
              <span style={{fontSize:18}}>💵</span> Log Cash Payment for Citizen
            </button>
          </div>

          {/* Stats */}
          <div className="s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
            {[
              {label:"Total Volume",val:stats.total_volume,prefix:"₦",sub:"All time collected"},
              {label:"Transactions",val:stats.transaction_count,sub:"Total on record"},
              {label:"Verified",val:stats.verified_count,sub:"Approved payments"},
              {label:"Pending",val:stats.pending_count,sub:"Awaiting review"},
            ].map((s,i)=>(
              <div key={i} className="stat" style={{borderTop:`3px solid ${STAT_COLORS[i]}`,animationDelay:`${i*.08}s`}}>
                <div style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:".08em",color:"rgba(255,255,255,.38)",marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:24,fontWeight:800,letterSpacing:"-.03em",color:STAT_COLORS[i]}}>
                  <Counter to={s.val} prefix={s.prefix||""}/>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:3}}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1.1fr",gap:18,alignItems:"start"}}>

            {/* Verify panel */}
            <div>
              <div className="card sL" style={{marginBottom:14}}>
                <div className="card-hd">
                  <div className="card-title">Verify Payment</div>
                  <div className="card-sub">Scan QR or enter receipt ID manually</div>
                </div>
                <div style={{padding:"18px 20px"}}>
                  <div className="qr-frame" style={{marginBottom:14}}>
                    <div className="qr-scan"/>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="6" height="6" rx="1" stroke="#00C853" strokeWidth="1.5"/>
                      <rect x="15" y="3" width="6" height="6" rx="1" stroke="#00C853" strokeWidth="1.5"/>
                      <rect x="3" y="15" width="6" height="6" rx="1" stroke="#00C853" strokeWidth="1.5"/>
                      <rect x="15" y="15" width="3" height="3" fill="#00C853"/>
                      <rect x="19" y="15" width="2" height="2" fill="#00C853"/>
                      <rect x="15" y="19" width="2" height="2" fill="#00C853"/>
                      <rect x="19" y="19" width="2" height="2" fill="#00C853"/>
                    </svg>
                    <div style={{textAlign:"center"}}>
                      <p style={{fontSize:13,fontWeight:700,color:"white"}}>Scan Citizen QR Code</p>
                      <p style={{fontSize:11.5,color:"rgba(255,255,255,.32)",marginTop:2}}>Point camera at citizen's receipt</p>
                    </div>
                    <button className="btn btn-green btn-sm"><I.QR/> Open Camera</button>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <div style={{flex:1,height:1,background:"rgba(0,200,83,.1)"}}/>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.28)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>or enter manually</span>
                    <div style={{flex:1,height:1,background:"rgba(0,200,83,.1)"}}/>
                  </div>
                  {verErr&&<div style={{background:"rgba(223,27,65,.1)",border:"1px solid rgba(223,27,65,.2)",borderRadius:8,padding:"9px 12px",color:"#FF4D6D",fontSize:12.5,marginBottom:10,display:"flex",gap:6,alignItems:"center",animation:"popIn .3s forwards"}}><I.Alert/>{verErr}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <input className="inp" placeholder="e.g. RCT-001" value={receiptId} onChange={e=>setReceiptId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&verify()} style={{flex:1}}/>
                    <button className="btn btn-green" onClick={verify} disabled={verLoading} style={{padding:"10px 16px"}}>
                      {verLoading?<span className="spin"/>:"Verify"}
                    </button>
                  </div>
                </div>
              </div>

              {verResult && (
                <div className={`${verResult.is_valid?"ver-valid":"ver-invalid"} pop`}>
                  <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${verResult.is_valid?"rgba(0,200,83,.15)":"rgba(223,27,65,.15)"}`}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:verResult.is_valid?"rgba(0,200,83,.25)":"rgba(223,27,65,.25)",display:"flex",alignItems:"center",justifyContent:"center",color:verResult.is_valid?"#00E676":"#FF4D6D",fontWeight:800,fontSize:16,flexShrink:0}}>
                      {verResult.is_valid?"✓":"✕"}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:"white"}}>{verResult.is_valid?"VALID — Payment Confirmed":"INVALID — Not Verified"}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:1,textTransform:"capitalize"}}>{verResult.status}</div>
                    </div>
                  </div>
                  <div style={{padding:"14px 18px"}}>
                    {[["Payer",verResult.payer_name],["Levy",verResult.levy_type],["Amount",fmt(verResult.amount)],["Receipt",verResult.receipt_id||verResult.id],["Date",fmtDate(verResult.created_at)]].map(([k,v])=>(
                      <div key={k} className="receipt-row">
                        <span style={{color:"rgba(255,255,255,.4)",fontWeight:500,fontSize:13}}>{k}</span>
                        <span style={{fontWeight:700,color:"white",fontFamily:k==="Receipt"?"monospace":"inherit",fontSize:13.5}}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  {actionMsg&&<div style={{margin:"0 16px 12px",background:"rgba(0,200,83,.1)",border:"1px solid rgba(0,200,83,.2)",borderRadius:8,padding:"9px 12px",fontSize:12.5,color:"#00E676"}}>✓ {actionMsg}</div>}
                  <div style={{padding:"0 16px 16px",display:"flex",gap:10}}>
                    <button className="btn btn-green" style={{flex:1,fontSize:13}} onClick={()=>action("approve")} disabled={approving||verResult.status==="paid"}>
                      {approving?<span className="spin"/>:"✓ Approve"}
                    </button>
                    <button className="btn btn-red" style={{flex:1,fontSize:13}} onClick={()=>action("flag")} disabled={flagging||verResult.status==="flagged"}>
                      {flagging?<span className="spin"/>:"⚑ Flag"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transactions table */}
            <div className="card sR">
              <div className="card-hd" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div className="card-title">All Transactions</div>
                  <div className="card-sub">Real-time audit trail · click to verify</div>
                </div>
                <span className="badge b-active">{txns.length} total</span>
              </div>
              {txnLoading?(
                <div style={{padding:40,textAlign:"center"}}><div className="dots"><span/><span/><span/></div></div>
              ):(
                <div style={{overflowX:"auto",maxHeight:520,overflowY:"auto"}}>
                  <table className="tbl">
                    <thead style={{position:"sticky",top:0,background:"#050F0A",zIndex:1}}>
                      <tr>{["Payer","Type","Amount","Status"].map(h=><th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {txns.map((t,i)=>(
                        <tr key={t.id||i}
                          style={{animation:`slideUp .4s cubic-bezier(.23,1,.32,1) ${i*.06}s both`}}
                          onClick={()=>{setReceiptId(t.receipt_id||t.id);setVerResult({...t,is_valid:t.status==="paid"||t.status==="completed"});setVerErr("");setActionMsg("");}}>
                          <td style={{fontWeight:600}}>{t.payer_name}</td>
                          <td style={{fontSize:12.5,color:"rgba(255,255,255,.4)"}}>{t.levy_type}</td>
                          <td style={{fontWeight:800,color:"#00E676"}}>{fmt(t.amount)}</td>
                          <td><span className={`badge ${t.status==="paid"||t.status==="completed"?"b-ok":t.status==="flagged"?"b-err":"b-warn"}`}>{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── LOG CASH PAYMENT MODAL ── */}
      {showCash && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s forwards"}}>
          <div style={{background:"rgba(5,15,10,.95)",border:"1px solid rgba(0,200,83,.25)",borderRadius:20,padding:"32px 28px",maxWidth:420,width:"100%",boxShadow:"0 0 0 1px rgba(0,200,83,.1),0 32px 80px rgba(0,0,0,.8)",animation:"popIn .3s cubic-bezier(.23,1,.32,1) forwards"}}>
            {!cashOk ? (
              <>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
                  <div style={{width:44,height:44,background:"rgba(0,200,83,.13)",border:"1px solid rgba(0,200,83,.3)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💵</div>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:800,color:"white",marginBottom:2}}>Log Cash Payment</h2>
                    <p style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Record a street-level cash levy collection</p>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label className="lbl">Citizen Name</label>
                      <input className="inp" placeholder="Full name" value={cash.citizen_name} onChange={e=>setCash(c=>({...c,citizen_name:e.target.value}))} style={{padding:"9px 12px"}}/>
                    </div>
                    <div>
                      <label className="lbl">Phone (opt)</label>
                      <input className="inp" type="tel" placeholder="+234..." value={cash.phone} onChange={e=>setCash(c=>({...c,phone:e.target.value}))} style={{padding:"9px 12px"}}/>
                    </div>
                  </div>
                  <div>
                    <label className="lbl">Levy Type</label>
                    <select className="inp" value={cash.levy_type} onChange={e=>setCash(c=>({...c,levy_type:e.target.value}))} style={{padding:"9px 12px"}}>
                      {["Transport Levy","Market Fee","Signage Fee","Waste Management Fee","Development Levy"].map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Amount Collected (₦)</label>
                    <input className="inp" type="number" placeholder="e.g. 500" value={cash.amount} onChange={e=>setCash(c=>({...c,amount:e.target.value}))} style={{padding:"9px 12px"}}/>
                  </div>
                  <div style={{background:"rgba(255,179,0,.07)",border:"1px solid rgba(255,179,0,.18)",borderRadius:9,padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span>⚠️</span>
                    <p style={{fontSize:11.5,color:"rgba(255,179,0,.8)",lineHeight:1.5}}>You are logging a physical cash collection. This will be recorded under your name and timestamped for audit.</p>
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setShowCash(false)}>Cancel</button>
                    <button className="btn btn-green" style={{flex:1}} onClick={logCash} disabled={cashLoading||!cash.citizen_name||!cash.amount}>
                      {cashLoading?<span className="spin"/>:"Record Payment →"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{textAlign:"center"}}>
                <div className="success-circle" style={{margin:"0 auto 16px"}}><I.BigCheck/></div>
                <h2 style={{fontSize:19,fontWeight:800,color:"white",marginBottom:5}}>Cash Payment Logged!</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:22}}>The transaction is recorded on the audit trail.</p>
                <div style={{background:"rgba(0,200,83,.06)",borderRadius:12,padding:"14px",textAlign:"left",marginBottom:22,border:"1px solid rgba(0,200,83,.12)"}}>
                  {[["Citizen",cashOk.citizen_name],["Levy",cashOk.levy_type],["Amount",fmt(cashOk.amount)],["Receipt",cashOk.receipt],["Collected by",user?.name||"Collector"],["Method","Cash 💵"]].map(([k,v])=>(
                    <div key={k} className="receipt-row">
                      <span style={{color:"rgba(255,255,255,.4)",fontSize:12.5,fontWeight:500}}>{k}</span>
                      <span style={{fontWeight:700,color:k==="Amount"?"#00E676":"white",fontSize:13}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-green" style={{width:"100%"}} onClick={()=>setShowCash(false)}>Done ✓</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default function CivicPayShield() {
  const [screen, setScreen] = useState("login");
  const [session, setSession] = useState(null);

  const onLogin = useCallback((s)=>{
    setSession(s);
    setScreen(s.role==="collector"||s.role==="admin"?"collector":"citizen");
  },[]);
  const onLogout = useCallback(()=>{ setSession(null); setScreen("login"); },[]);

  return (
    <>
      <style>{CSS}</style>
      {screen==="login"     && <LoginScreen onLogin={onLogin}/>}
      {screen==="citizen"   && <CitizenDashboard session={session} onLogout={onLogout} onPay={()=>setScreen("pay")}/>}
      {screen==="pay"       && <PayLevyScreen session={session} onBack={()=>setScreen("citizen")}/>}
      {screen==="collector" && <CollectorDashboard session={session} onLogout={onLogout}/>}
    </>
  );
}
