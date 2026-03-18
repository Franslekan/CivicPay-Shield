


























import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const apiFetch = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await res.json();
  
  if (!res.ok) {
    if (res.status === 401) throw new Error("Your session has expired. Please log in again.");
    if (res.status === 403) throw new Error("You don't have permission to perform this action.");
    if (res.status === 422) throw new Error("Please check your input and try again.");
    throw new Error(data.detail || "An error occurred. Please try again.");
  }
  
  return data;
};

const LEVY_TYPES = ["Transport Levy", "Market Fee", "Shop Permit", "Sanitation Levy", "Building Permit", "Other"];
const fmt = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

// Mock data for connected platforms
const CONNECTED_ACCOUNTS = [
  { id: 1, name: "Vital Flow", country: "Canada", balance: 8348, volume: 71562.98, currency: "CAD", status: "active" },
  { id: 2, name: "Daybreak Yoga", country: "United States", balance: 1502, volume: 7880, currency: "USD", status: "active" },
  { id: 3, name: "Sacred Space", country: "UK", balance: 1247, volume: 24569.09, currency: "GBP", status: "active" },
  { id: 4, name: "Jackson Hot Yoga", country: "Australia", balance: 3660, volume: 12643.30, currency: "AUD", status: "active" },
  { id: 5, name: "Harmony Flow", country: "United States", balance: 30930, volume: 294669.65, currency: "USD", status: "active" },
  { id: 6, name: "Balance at Brunch", country: "Canada", balance: 335, volume: 3650.36, currency: "CAD", status: "active" },
  { id: 7, name: "Breathline Studio", country: "United States", balance: 2245, volume: 8608, currency: "USD", status: "active" },
  { id: 8, name: "Quiet Fire Yoga", country: "UK", balance: 388, volume: 1568.87, currency: "GBP", status: "inactive" },
  { id: 9, name: "Zenith Zen", country: "Australia", balance: 660, volume: 1643.30, currency: "AUD", status: "active" },
  { id: 10, name: "M.E. Yoga", country: "Canada", balance: 4424, volume: 6709.60, currency: "CAD", status: "active" },
];

// Product catalog for marketplaces
const PRODUCTS = [
  { id: 1, name: "Deluxe Shirt", variant: "Blue - Medium", price: 26, image: "👕", category: "Apparel" },
  { id: 2, name: "Essential Hoodie", variant: "Navy - Medium", price: 48, image: "🧥", category: "Apparel" },
  { id: 3, name: "Yoga Mat Premium", variant: "Purple - Standard", price: 65, image: "🧘", category: "Fitness" },
  { id: 4, name: "Meditation Cushion", variant: "Gray - Round", price: 35, image: "🪑", category: "Wellness" },
  { id: 5, name: "Water Bottle", variant: "Stainless - 32oz", price: 22, image: "💧", category: "Accessories" },
  { id: 6, name: "Resistance Bands", variant: "Set of 3", price: 18, image: "🏋️", category: "Fitness" },
];

// Subscription plans
const SUBSCRIPTION_PLANS = [
  { id: 1, name: "Monthly Unlimited", price: 99, interval: "month", popular: false },
  { id: 2, name: "Annual Unlimited", price: 999, interval: "year", popular: true },
  { id: 3, name: "Family Plan", price: 149, interval: "month", popular: false },
];

// Icons
const IC = {
  shield:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"/><polyline points="9 12 11 14 15 10"/></svg>,
  mail:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>,
  lock:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  eye:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  home:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  receipt:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  user:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  back:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  check:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  alert:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  power:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
  search:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chevron:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  card:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  trend:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  flag:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  world:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  chart:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shop:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/><path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/></svg>,
  subscription: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M22 7h-4l-3-3 3-3 4 3-3 3z"/><path d="M2 7h4l3-3-3-3-4 3 3 3z"/></svg>,
  cart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>,
};

// Global Styles
const GS = () => <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#F6F9FC;color:#0A2540;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeInUp{
    from{opacity:0;transform:translateY(10px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes shimmer{
    0%{background-position:-200% 0}
    100%{background-position:200% 0}
  }
  @keyframes pulse{
    0%,100%{opacity:0.5;transform:scale(1)}
    50%{opacity:1;transform:scale(1.1)}
  }
  @keyframes slideIn{
    from{transform:translateX(-10px);opacity:0}
    to{transform:translateX(0);opacity:1}
  }
`}</style>;

// Loading Spinner
const Spin = () => <span style={{display:"inline-block",width:15,height:15,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .65s linear infinite",verticalAlign:"middle"}} />;

// Page Transition Wrapper
const PageTransition = ({ children }) => (
  <div style={{ animation: "fadeInUp 0.3s ease-out", width: "100%", height: "100%" }}>
    {children}
  </div>
);

// Card Component with Hover Effect
const Card = ({children, p=24, style:s, hoverable=false}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{
        background:"white",
        borderRadius:12,
        border:"1px solid #E0E6ED",
        boxShadow: isHovered && hoverable 
          ? "0 20px 35px -8px rgba(10, 37, 64, 0.15), 0 5px 12px -4px rgba(0,0,0,0.05)" 
          : "0 2px 5px rgba(50,50,93,.05), 0 1px 2px rgba(0,0,0,.02)",
        padding:p,
        transition: "all 0.25s cubic-bezier(0.2, 0, 0, 1)",
        transform: isHovered && hoverable ? "translateY(-2px)" : "translateY(0)",
        ...s
      }}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
    >
      {children}
    </div>
  );
};

const Divider = () => <div style={{height:1,background:"#F0F4F8"}} />;

// Input Field Component
const Field = ({label, icon, right, style:s, ...p}) => (
  <div style={{marginBottom:16,...s}}>
    {label && <label style={{display:"block",fontSize:13,fontWeight:500,color:"#425466",marginBottom:6}}>{label}</label>}
    <div style={{position:"relative"}}>
      {icon && <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#8898AA",display:"flex",pointerEvents:"none"}}>{icon}</span>}
      <input style={{
        width:"100%",height:44,
        padding:icon?"0 14px 0 40px":right?"0 40px 0 14px":"0 14px",
        border:"1px solid #E0E6ED",borderRadius:6,fontSize:14,
        transition: "border-color 0.15s, box-shadow 0.15s"
      }}
      onFocus={e=>{e.target.style.borderColor="#635BFF";e.target.style.boxShadow="0 0 0 3px rgba(99,91,255,.15)";}}
      onBlur={e=>{e.target.style.borderColor="#E0E6ED";e.target.style.boxShadow="0 1px 3px rgba(50,50,93,.06)";}}
      {...p}/>
      {right && <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#8898AA",display:"flex",cursor:"pointer"}}>{right}</span>}
    </div>
  </div>
);

// Button Component
const Btn = ({children, variant="primary", loading:ld, full, style:s, ...p}) => {
  const V = {
    primary:   {background:"#0A2540", color:"white", border:"1px solid #0A2540"},
    secondary: {background:"white", color:"#0A2540", border:"1px solid #E0E6ED"},
    success:   {background:"#0A2540", color:"white", border:"1px solid #0A2540"},
    danger:    {background:"#FA5252", color:"white", border:"1px solid #FA5252"},
  };
  return <button style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
    height:44, padding:"0 20px", borderRadius:6, fontSize:14, fontWeight:600,
    width:full?"100%":undefined, cursor: p.disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease", opacity: p.disabled ? 0.6 : 1,
    ...V[variant], ...s
  }}
  onMouseEnter={e => !p.disabled && (e.currentTarget.style.backgroundColor = "#1A3A5F")}
  onMouseLeave={e => !p.disabled && (e.currentTarget.style.backgroundColor = V[variant].background)}
  {...p}>{ld?<Spin/>:children}</button>;
};

// Pill/Badge Component
const Pill = ({children, color="purple"}) => {
  const C={
    purple:{bg:"#F0EFFF",tx:"#635BFF"},
    green:{bg:"#EDFAF5",tx:"#24B47E"},
    red:{bg:"#FFF0F0",tx:"#FA5252"},
    amber:{bg:"#FFF8EC",tx:"#C8801A"}
  };
  const c=C[color]||C.purple;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600,background:c.bg,color:c.tx}}>{children}</span>;
};

// Top Navigation Bar
const TopBar = ({title, onBack, right, logo}) => (
  <nav style={{background:"white",borderBottom:"1px solid #E0E6ED",height:60,display:"flex",alignItems:"center",padding:"0 20px",gap:12,position:"sticky",top:0,zIndex:10}}>
    {onBack && <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#425466",display:"flex",padding:4}}>{IC.back}</button>}
    {logo && <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#0A2540,#1F3A5F)",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>{IC.shield}</div>}
    <span style={{flex:1,fontSize:16,fontWeight:700,color:"#0A2540"}}>{title}</span>
    {right}
  </nav>
);

// Avatar Component
const Avatar = ({name,size=34}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:"#F0EFFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.35,fontWeight:700,color:"#635BFF"}}>
    {name.slice(0,2).toUpperCase()}
  </div>
);

// Toast Notification Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: "#EDFAF5", border: "#24B47E", text: "#0A2540", icon: "✓" },
    error: { bg: "#FFF0F0", border: "#FA5252", text: "#0A2540", icon: "!" },
    info: { bg: "#F0EFFF", border: "#635BFF", text: "#0A2540", icon: "i" }
  };

  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: c.bg,
      borderLeft: `4px solid ${c.border}`,
      borderRadius: 8,
      padding: "14px 20px",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
      animation: "slideIn 0.2s ease, fadeInUp 0.3s ease",
      zIndex: 1000,
      maxWidth: 360
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: c.border,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: "bold"
        }}>
          {c.icon}
        </div>
        <span style={{ fontSize: 14, color: c.text, flex: 1 }}>{message}</span>
        <button 
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#8898AA",
            fontSize: 20,
            padding: "0 4px"
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ title, message, icon, action }) => (
  <div style={{
    textAlign: "center",
    padding: "48px 24px",
    background: "white",
    borderRadius: 16,
    border: "1px dashed #E0E6ED",
    animation: "fadeInUp 0.3s ease"
  }}>
    <div style={{
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "#F6F9FC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      color: "#8898AA",
      fontSize: 32
    }}>
      {icon || "📭"}
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>
      {title}
    </h3>
    <p style={{ fontSize: 14, color: "#8898AA", marginBottom: 20, maxWidth: 280, margin: "0 auto 20px" }}>
      {message}
    </p>
    {action}
  </div>
);

// Skeleton Loader
const Skeleton = ({ width, height, style }) => (
  <div style={{
    width: width || "100%",
    height: height || 20,
    background: "linear-gradient(90deg, #F0F4F8 25%, #E0E6ED 50%, #F0F4F8 75%)",
    backgroundSize: "200% 100%",
    borderRadius: 4,
    animation: "shimmer 1.5s infinite",
    ...style
  }} />
);

// Pulse Loader
const PulseLoader = () => (
  <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: 40 }}>
    {[1,2,3].map(i => (
      <div key={i} style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#635BFF",
        opacity: 0.5,
        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
      }} />
    ))}
  </div>
);

// Connected Accounts Table
const ConnectedAccountsTable = ({ accounts }) => {
  const formatCurrency = (amount, currency) => {
    const symbols = { USD: "$", CAD: "C$", GBP: "£", AUD: "A$", NGN: "₦" };
    return `${symbols[currency] || "$"}${amount.toLocaleString()}`;
  };

  const activeAccounts = accounts.filter(a => a.status === "active");
  const totalVolume = activeAccounts.reduce((sum, a) => sum + a.volume, 0);

  return (
    <Card p={0}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E6ED" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540" }}>Connected Accounts</h3>
        <p style={{ fontSize: 13, color: "#68738D", marginTop: 4 }}>
          {activeAccounts.length} active platforms • {formatCurrency(totalVolume, "USD")} total volume
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F6F9FC" }}>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#68738D" }}>Account</th>
              <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#68738D" }}>Country</th>
              <th style={{ padding: "12px 24px", textAlign: "right", fontSize: 12, fontWeight: 500, color: "#68738D" }}>Balance</th>
              <th style={{ padding: "12px 24px", textAlign: "right", fontSize: 12, fontWeight: 500, color: "#68738D" }}>Volume (30d)</th>
              <th style={{ padding: "12px 24px", textAlign: "center", fontSize: 12, fontWeight: 500, color: "#68738D" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, i) => (
              <tr key={account.id} style={{
                borderBottom: i < accounts.length - 1 ? "1px solid #F0F4F8" : "none",
                transition: "background 0.15s",
                cursor: "pointer",
                opacity: account.status === "inactive" ? 0.6 : 1
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F0EFFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#635BFF" }}>
                      {account.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0A2540" }}>{account.name}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{account.country}</span>
                    <span style={{ fontSize: 12, color: "#8898AA" }}>{account.currency}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, fontWeight: 600, color: "#0A2540" }}>
                  {formatCurrency(account.balance, account.currency)}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, color: "#0A2540" }}>
                  {formatCurrency(account.volume, account.currency)}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <Pill color={account.status === "active" ? "green" : "amber"}>
                    {account.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Product Catalog Component
const ProductCatalog = ({ products, onBuy }) => {
  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 20 }}>Product Catalog</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {products.map(product => (
          <Card key={product.id} hoverable p={20}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 12, background: "#F6F9FC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {product.image}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 4 }}>{product.name}</h4>
                <p style={{ fontSize: 13, color: "#68738D", marginBottom: 8 }}>{product.variant}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#0A2540" }}>${product.price}</span>
                  <Btn variant="primary" style={{ height: 36, padding: "0 16px" }} onClick={() => onBuy(product)}>
                    Buy now
                  </Btn>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Subscription Success Screen
const SubscriptionSuccess = ({ plan, onBack }) => (
  <div style={{ maxWidth: 480, margin: "0 auto", padding: 40 }}>
    <Card p={32}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EDFAF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#24B47E", fontSize: 32 }}>
          ✓
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A2540", marginBottom: 8 }}>Thank you!</h2>
        <p style={{ fontSize: 15, color: "#68738D" }}>Your unlimited yoga subscription is now active.</p>
      </div>

      <div style={{ borderTop: "1px solid #E0E6ED", borderBottom: "1px solid #E0E6ED", padding: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#68738D" }}>Order number</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>#9803890</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#68738D" }}>Date</span>
          <span style={{ fontSize: 14, color: "#0A2540" }}>Jan 20, 2026</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#68738D" }}>Payment method</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>VISA</span>
            <span style={{ fontSize: 12, color: "#8898AA" }}>····4242</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "#68738D" }}>Your plan</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>${plan.price}/{plan.interval}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, marginBottom: 28 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#0A2540" }}>Total</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#0A2540" }}>${plan.price}</span>
      </div>

      <Btn full variant="primary" onClick={onBack}>
        Back to dashboard
      </Btn>
    </Card>
  </div>
);

// Subscription Plans Component
const SubscriptionPlans = ({ plans, onSelect }) => {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 20 }}>Choose your plan</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {plans.map(plan => (
          <Card 
            key={plan.id} 
            hoverable 
            p={24}
            style={{
              border: selectedPlan.id === plan.id ? "2px solid #635BFF" : "1px solid #E0E6ED",
              position: "relative",
              cursor: "pointer"
            }}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.popular && (
              <span style={{
                position: "absolute",
                top: -10,
                right: 20,
                background: "#635BFF",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20
              }}>
                POPULAR
              </span>
            )}
            <h4 style={{ fontSize: 18, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>{plan.name}</h4>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#0A2540" }}>${plan.price}</span>
              <span style={{ fontSize: 14, color: "#8898AA" }}>/{plan.interval}</span>
            </div>
            <Btn 
              full 
              variant={selectedPlan.id === plan.id ? "primary" : "secondary"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(plan);
              }}
            >
              Select
            </Btn>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Platform Dashboard
const PlatformDashboard = ({ email, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const name = email.split("@")[0];

  const handleBuyProduct = (product) => {
    alert(`Processing payment for ${product.name} - $${product.price}`);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowSubscriptionSuccess(true);
  };

  if (showSubscriptionSuccess && selectedPlan) {
    return <SubscriptionSuccess plan={selectedPlan} onBack={() => setShowSubscriptionSuccess(false)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F9FC" }}>
      <nav style={{
        background: "white",
        borderBottom: "1px solid #E0E6ED",
        padding: "0 32px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0A2540,#1F3A5F)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              {IC.shield}
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0A2540" }}>CivicPay</span>
          </div>
          
          <div style={{ display: "flex", gap: 24 }}>
            {["Overview", "Products", "Subscriptions", "Analytics"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  color: activeTab === tab.toLowerCase() ? "#0A2540" : "#68738D",
                  cursor: "pointer",
                  padding: "8px 0",
                  borderBottom: activeTab === tab.toLowerCase() ? "2px solid #0A2540" : "2px solid transparent"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0A2540" }}>{name}</div>
            <div style={{ fontSize: 11, color: "#8898AA" }}>Platform Admin</div>
          </div>
          <Avatar name={name} size={40} />
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#8898AA", padding: 8 }}>
            {IC.power}
          </button>
        </div>
      </nav>

      <PageTransition>
        <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
                {[
                  { label: "Total Volume", value: "$1.2M", change: "+23%", icon: IC.trend },
                  { label: "Active Accounts", value: "245", change: "+12", icon: IC.world },
                  { label: "Avg. Transaction", value: "$89", change: "+5%", icon: IC.chart },
                  { label: "Success Rate", value: "99.9%", change: "0.2%", icon: IC.check }
                ].map(stat => (
                  <Card key={stat.label} p={20}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: "#68738D" }}>{stat.label}</span>
                      <span style={{ color: "#24B47E", fontSize: 12 }}>{stat.change}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#0A2540", marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ width: "100%", height: 4, background: "#F0F4F8", borderRadius: 2 }}>
                      <div style={{ width: "70%", height: 4, background: "#0A2540", borderRadius: 2 }} />
                    </div>
                  </Card>
                ))}
              </div>

              <ConnectedAccountsTable accounts={CONNECTED_ACCOUNTS} />

              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A2540", marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {[
                    { icon: IC.shop, label: "Create Product", color: "#635BFF" },
                    { icon: IC.subscription, label: "New Plan", color: "#24B47E" },
                    { icon: IC.user, label: "Add Account", color: "#E8A400" },
                    { icon: IC.receipt, label: "View Reports", color: "#FA5252" }
                  ].map(action => (
                    <Card key={action.label} hoverable p={16} style={{ textAlign: "center", cursor: "pointer" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: action.color }}>
                        {action.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#0A2540" }}>{action.label}</span>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "products" && (
            <ProductCatalog products={PRODUCTS} onBuy={handleBuyProduct} />
          )}

          {activeTab === "subscriptions" && (
            <SubscriptionPlans plans={SUBSCRIPTION_PLANS} onSelect={handleSelectPlan} />
          )}

          {activeTab === "analytics" && (
            <Card p={32} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📊</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0A2540", marginBottom: 8 }}>Analytics Dashboard</h3>
              <p style={{ fontSize: 14, color: "#68738D", marginBottom: 20 }}>
                Advanced analytics and reporting coming soon
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <Skeleton width={200} height={100} />
                <Skeleton width={200} height={100} />
              </div>
            </Card>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

// Citizen Dashboard
function CitizenDashboard({email,onLogout}) {
  const [screen,setScreen]=useState("home");
  const name=email.split("@")[0];
  const txns=[
    {id:1,levy_type:"Transport Levy",amount:1000,status:"paid",date:"Mar 14, 2026"},
    {id:2,levy_type:"Market Fee",amount:500,status:"paid",date:"Mar 13, 2026"},
  ];
  const total=txns.reduce((s,t)=>s+t.amount,0);

  if(screen==="pay") return <PayScreen email={email} onBack={()=>setScreen("home")}/>;

  return (
    <div style={{minHeight:"100vh",background:"#F6F9FC"}}>
      <TopBar title="CivicPay Shield" logo right={
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={name}/>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:"#8898AA",padding:4}}>{IC.power}</button>
        </div>
      }/>

      <PageTransition>
        <div style={{padding:"24px 20px",maxWidth:600,margin:"0 auto"}}>
          <h1 style={{fontSize:24,fontWeight:700,color:"#0A2540",marginBottom:24,textTransform:"capitalize"}}>
            Welcome back, {name}
          </h1>

          <div style={{
            background: "linear-gradient(145deg, #0A2540 0%, #1F3A5F 100%)",
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 32,
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 25px -5px rgba(10, 37, 64, 0.2)"
          }}>
            <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}} />
            <div style={{position:"absolute",bottom:-40,left:"20%",width:150,height:150,borderRadius:"50%",background:"rgba(255,255,255,0.02)"}} />
            <div style={{position:"absolute",top:"20%",right:"10%",width:100,height:100,borderRadius:"50%",background:"rgba(99,91,255,0.08)"}} />

            <p style={{fontSize:12,fontWeight:500,opacity:0.6,letterSpacing:"1.5px",marginBottom:12,textTransform:"uppercase"}}>
              Total levies paid
            </p>
            <div style={{fontSize:48,fontWeight:700,marginBottom:28,letterSpacing:"-0.02em"}}>
              {fmt(total)}
            </div>
            
            <div style={{display:"flex",gap:40}}>
              <div>
                <div style={{fontSize:22,fontWeight:600,marginBottom:4}}>{txns.length}</div>
                <div style={{fontSize:13,opacity:0.6}}>Transactions</div>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:600,marginBottom:4}}>
                  {new Date().toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div style={{fontSize:13,opacity:0.6}}>Current period</div>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:600,marginBottom:4}}>100%</div>
                <div style={{fontSize:13,opacity:0.6}}>Success rate</div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
            <Btn variant="primary" style={{height:48,borderRadius:8}} onClick={()=>setScreen("pay")}>
              <span style={{fontSize:18,lineHeight:1,marginRight:4}}>+</span> New payment
            </Btn>
            <Btn variant="secondary" style={{height:48,borderRadius:8}}>
              {IC.receipt} View receipts
            </Btn>
          </div>

          {txns.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              message="Your payment history will appear here once you make your first levy payment."
              icon="💳"
              action={
                <Btn variant="primary" onClick={()=>setScreen("pay")}>
                  Make your first payment
                </Btn>
              }
            />
          ) : (
            <div>
              <h3 style={{fontSize:15,fontWeight:600,color:"#0A2540",marginBottom:16}}>
                Recent activity
              </h3>
              {txns.map((t,i)=>(
                <Card key={t.id} p={0} hoverable style={{marginBottom: i < txns.length-1 ? 8 : 0}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:"#F0EFFF",display:"flex",alignItems:"center",justifyContent:"center",color:"#635BFF"}}>
                      {IC.card}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:500,color:"#0A2540",marginBottom:4}}>
                        {t.levy_type}
                      </div>
                      <div style={{fontSize:13,color:"#8898AA",display:"flex",alignItems:"center",gap:8}}>
                        <span>{t.date}</span>
                        <span style={{width:4,height:4,borderRadius:"50%",background:"#E0E6ED"}} />
                        <span>Ref: TXN-{1000 + t.id}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:16,fontWeight:700,color:"#0A2540",marginBottom:4}}>
                        {fmt(t.amount)}
                      </div>
                      <Pill color="green">Paid</Pill>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

// Pay Screen
function PayScreen({email,onBack}) {
  const [levy,setLevy]=useState(LEVY_TYPES[0]); const [amount,setAmount]=useState(""); const [payer,setPayer]=useState("");
  const [loading,setLoading]=useState(false); const [success,setSuccess]=useState(null); const [err,setErr]=useState("");

  const pay = async () => {
    if(!amount||!payer) return setErr("Please enter payer name and amount.");
    setLoading(true); setErr("");
    try {
      const d=await apiFetch("/api/payments/initialize",{
        method:"POST",
        body:JSON.stringify({email,amount:Number(amount),levy_type:levy,payer_name:payer})
      });
      setSuccess(d.transaction_reference||`TXN-${Date.now()}`);
    } catch(e){ setErr(e.message); } finally{ setLoading(false); }
  };

  if(success) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:400,textAlign:"center"}}>
        <div style={{width:66,height:66,borderRadius:"50%",background:"#EDFAF5",border:"2px solid #24B47E",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:"#24B47E"}}>{IC.check}</div>
        <h2 style={{fontSize:22,fontWeight:700,marginBottom:28}}>Payment successful</h2>
        <Card><p>Reference: {success}</p></Card>
        <Btn full style={{marginTop:20}} onClick={onBack}>Back</Btn>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#F6F9FC"}}>
      <TopBar title="Pay levy" onBack={onBack}/>
      <div style={{padding:"24px 20px",maxWidth:520,margin:"0 auto"}}>
        {err&&<div style={{padding:"10px 14px",background:"#FFF0F0",border:"1px solid #FFC9C9",borderRadius:6,marginBottom:20,color:"#FA5252"}}>{err}</div>}
        <Card>
          <select value={levy} onChange={e=>setLevy(e.target.value)} style={{width:"100%",height:44,marginBottom:16}}>
            {LEVY_TYPES.map(l=><option key={l}>{l}</option>)}
          </select>
          <Field label="Amount (₦)" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <Field label="Payer name" value={payer} onChange={e=>setPayer(e.target.value)}/>
        </Card>
        <Btn full variant="success" style={{height:50,marginTop:20}} loading={loading} onClick={pay}>
          Pay {amount?fmt(amount):"now"}
        </Btn>
      </div>
    </div>
  );
}

// Collector Dashboard
function CollectorDashboard({email,onLogout,showToast}) {
  const [txns,setTxns]=useState([]); const [loading,setLoading]=useState(true);
  const name=email.split("@")[0];
  const mock=[
    {id:1,payer:"John Doe",levy_type:"Transport Levy",amount:1000,status:"valid",date:"Mar 15"},
    {id:2,payer:"Amina Bello",levy_type:"Market Fee",amount:500,status:"valid",date:"Mar 15"},
  ];

  useEffect(()=>{
    (async()=>{
      try{const d=await apiFetch("/api/admin/transactions",{});setTxns(Array.isArray(d)?d:d.transactions||[]);}
      catch{setTxns(mock);}finally{setLoading(false);}
    })();
  },[]);

  const list=txns.length?txns:mock;

  return (
    <div style={{minHeight:"100vh",background:"#F6F9FC"}}>
      <nav style={{background:"white",borderBottom:"1px solid #E0E6ED",height:64,display:"flex",alignItems:"center",padding:"0 24px",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#0A2540,#1F3A5F)",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>{IC.shield}</div>
          <div>Collector Dashboard</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar name={name}/>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer"}}>{IC.power}</button>
        </div>
      </nav>

      <PageTransition>
        <div style={{padding:"24px 20px",maxWidth:760,margin:"0 auto"}}>
          <Card p={0}>
            <div style={{padding:"16px 24px"}}>All Transactions</div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderTop:"1px solid #E0E6ED",borderBottom:"1px solid #E0E6ED",background:"#F6F9FC"}}>
                  {["Payer","Type","Amount","Date","Status"].map(h=><th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:11}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((t,i)=>(
                  <tr key={t.id} style={{
                    borderBottom:i<list.length-1?"1px solid #F0F4F8":"none",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{padding:"13px 20px"}}>{t.payer}</td>
                    <td style={{padding:"13px 20px"}}>{t.levy_type}</td>
                    <td style={{padding:"13px 20px",fontWeight:600}}>{fmt(t.amount)}</td>
                    <td style={{padding:"13px 20px"}}>{t.date}</td>
                    <td style={{padding:"13px 20px"}}><Pill color={t.status==="valid"?"green":"amber"}>{t.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </PageTransition>
    </div>
  );
}

// Login Page
function LoginPage({onLogin, showToast}) {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState(""); const [tab,setTab]=useState("login"); const [role,setRole]=useState("citizen");

  const doLogin = async (roleHint) => {
    if(!email||!pw) return setErr("Please enter your email and password.");
    setLoading(true); setErr("");
    try { 
      const data = await apiFetch("/api/auth/login", {
        method:"POST",
        body:JSON.stringify({email,password:pw})
      }); 
      onLogin(data.role || roleHint, email); 
    } catch(e){ setErr(e.message); } finally{ setLoading(false); }
  };

  const doReg = async () => {
    if(!email||!pw) return setErr("Please fill in all fields.");
    setLoading(true); setErr("");
    try { 
      await apiFetch("/api/auth/register", {
        method:"POST",
        body:JSON.stringify({email,password:pw,role})
      }); 
      setTab("login"); 
      alert("Account created. Sign in below."); 
    } catch(e){ setErr(e.message); } finally{ setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",background:"#F6F9FC"}}>
      <div style={{textAlign:"center",marginBottom:32,animation:"fadeInUp 0.4s ease"}}>
        <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#0A2540,#1F3A5F)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"white"}}>{IC.shield}</div>
        <div style={{fontSize:22,fontWeight:700,color:"#0A2540"}}>CivicPay Shield</div>
        <div style={{fontSize:14,color:"#8898AA",marginTop:4}}>Secure Government Payments</div>
      </div>

      <div style={{width:"100%",maxWidth:420,animation:"fadeInUp 0.45s ease 0.04s both"}}>
        <Card>
          <div style={{display:"flex",background:"#F6F9FC",borderRadius:7,padding:3,marginBottom:28}}>
            {[["login","Sign in"],["register","Create account"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setTab(m);setErr("");}} style={{flex:1,height:36,borderRadius:5,border:"none",fontSize:13,fontWeight:600,background:tab===m?"white":"transparent",color:tab===m?"#0A2540":"#8898AA"}}>{l}</button>
            ))}
          </div>

          {err && <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#FFF0F0",border:"1px solid #FFC9C9",borderRadius:6,marginBottom:20,color:"#FA5252",fontSize:13}}>{IC.alert}{err}</div>}

          {tab==="register" && (
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:13,fontWeight:500,color:"#425466",marginBottom:8}}>Account type</label>
              <div style={{display:"flex",gap:8}}>
                {[["citizen","Citizen"],["admin","Collector"],["platform","Platform Admin"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setRole(v)} style={{
                    flex:1, height:40, borderRadius:6, fontSize:13,
                    background:role===v?"#F0EFFF":"white",
                    border:role===v?"1.5px solid #635BFF":"1px solid #E0E6ED",
                    color:role===v?"#635BFF":"#425466"
                  }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Email address" icon={IC.mail} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <Field label="Password" icon={IC.lock} type={showPw?"text":"password"} placeholder="Your password" value={pw} onChange={e=>setPw(e.target.value)}
            right={<span onClick={()=>setShowPw(!showPw)}>{showPw?IC.eyeOff:IC.eye}</span>} />

          {tab==="login" ? (
            <>
              <Btn full loading={loading} style={{marginBottom:10}} onClick={()=>doLogin("citizen")}>Sign in as Citizen</Btn>
              <Btn full variant="secondary" loading={loading} style={{marginBottom:10}} onClick={()=>doLogin("admin")}>Sign in as Collector</Btn>
              <Btn full variant="secondary" loading={loading} onClick={()=>doLogin("platform")}>Sign in as Platform Admin</Btn>
            </>
          ) : (
            <Btn full loading={loading} onClick={doReg}>Create Account</Btn>
          )}
        </Card>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [auth, setAuth] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  return (
    <>
      <GS/>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      {!auth
        ? <LoginPage 
            onLogin={(role, email) => {
              setAuth({role, email});
              showToast(`Welcome back, ${email.split('@')[0]}!`, "success");
            }}
            showToast={showToast}
          />
        : auth.role === "platform"
          ? <PlatformDashboard 
              email={auth.email} 
              onLogout={() => {
                setAuth(null);
                showToast("Logged out successfully", "info");
              }}
            />
          : auth.role === "admin"
            ? <CollectorDashboard 
                email={auth.email} 
                onLogout={() => {
                  setAuth(null);
                  showToast("Logged out successfully", "info");
                }}
                showToast={showToast}
              />
            : <CitizenDashboard 
                email={auth.email} 
                onLogout={() => {
                  setAuth(null);
                  showToast("Logged out successfully", "info");
                }}
              />
      }
    </>
  );
}
