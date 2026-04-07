import { useState, useEffect } from "react";

export default function Navbar({ activePage, setActivePage }) {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // close menu when page changes
  useEffect(() => { setMenuOpen(false); }, [activePage]);

  const navItems = [
    { id: "dashboard",   label: "Dashboard",   icon: "⬡"  },
    { id: "temperature", label: "Temperature", icon: "🌡" },
    { id: "humidity",    label: "Humidity",    icon: "💧" },
    { id: "ammonia",     label: "Ammonia",     icon: "☁"  },
    { id: "eggs",        label: "Egg Count",   icon: "🥚" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 600; letter-spacing: .3px;
          color: #475569; border: 1px solid transparent;
          transition: all .2s ease; white-space: nowrap;
          background: none; font-family: 'Sora', sans-serif;
        }
        .nav-item:hover  { color: #94a3b8; background: rgba(255,255,255,.05); }
        .nav-item.active { color: #38bdf8; background: rgba(56,189,248,.1); border-color: rgba(56,189,248,.25); }

        /* mobile full-width nav items */
        .nav-item-mobile {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 13px 20px;
          border-radius: 12px; cursor: pointer;
          font-size: 14px; font-weight: 600;
          color: #475569; border: 1px solid transparent;
          transition: all .2s ease;
          background: none; font-family: 'Sora', sans-serif;
          text-align: left;
        }
        .nav-item-mobile:hover  { color: #94a3b8; background: rgba(255,255,255,.05); }
        .nav-item-mobile.active { color: #38bdf8; background: rgba(56,189,248,.1); border-color: rgba(56,189,248,.2); }

        /* hamburger lines */
        .hb-line {
          display: block; width: 22px; height: 2px;
          background: #64748b; border-radius: 99px;
          transition: all .3s ease;
          transform-origin: center;
        }
        .hb-open .hb-line:nth-child(1) { transform: translateY(7px) rotate(45deg);  background: #38bdf8; }
        .hb-open .hb-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hb-open .hb-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #38bdf8; }

        /* show/hide at breakpoints */
        .desktop-nav { display: flex; }
        .hamburger   { display: none; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
          .clock-block { display: none !important; }
        }

        /* mobile drawer */
        .mobile-drawer {
          position: fixed;
          top: 62px; left: 0; right: 0;
          background: rgba(5,11,20,.97);
          border-bottom: 1px solid rgba(56,189,248,.15);
          backdrop-filter: blur(24px);
          z-index: 199;
          padding: 16px 20px 24px;
          animation: slideDown .25s ease;
        }
      `}</style>

      {/* ── NAV BAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(5,11,20,.97)",
        borderBottom: "1px solid rgba(255,255,255,.07)",
        backdropFilter: "blur(24px)",
        fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 62,
        }}>

          {/* ── Brand ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:18, boxShadow:"0 4px 20px rgba(14,165,233,.35)",
            }}>🐔</div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", letterSpacing:-.3 }}>PoultryOS</div>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:1.8, textTransform:"uppercase" }}>Smart Farm</div>
            </div>
          </div>

          {/* ── Desktop nav links ── */}
          <div className="desktop-nav" style={{ alignItems:"center", gap:4 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item${activePage === item.id ? " active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span style={{ fontSize:15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Right cluster ── */}
          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>

            {/* clock — hidden on mobile */}
            <div className="clock-block" style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#cbd5e1", fontFamily:"'DM Mono',monospace" }}>
                {time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
              </div>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:.5 }}>
                {time.toLocaleDateString([], { weekday:"short", day:"numeric", month:"short" })}
              </div>
            </div>

            {/* live dot */}
            <div style={{
              display:"flex", alignItems:"center", gap:6,
              background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)",
              borderRadius:20, padding:"4px 10px",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:10, color:"#34d399", fontWeight:700, letterSpacing:.8 }}>LIVE</span>
            </div>

            {/* ── Hamburger (mobile only) ── */}
            <button
              className={`hamburger${menuOpen ? " hb-open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background:"none", border:"none", cursor:"pointer",
                display:"none", flexDirection:"column", gap:5,
                padding:6, borderRadius:8,
                transition:"background .2s",
              }}
              aria-label="Toggle menu"
            >
              <span className="hb-line"/>
              <span className="hb-line"/>
              <span className="hb-line"/>
            </button>

          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="mobile-drawer">

          {/* clock inside drawer on mobile */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:16, paddingBottom:14,
            borderBottom:"1px solid rgba(255,255,255,.06)",
          }}>
            <span style={{ fontSize:10, color:"#334155", letterSpacing:1.5, textTransform:"uppercase" }}>
              Navigation
            </span>
            <span style={{ fontSize:12, color:"#475569", fontFamily:"'DM Mono',monospace" }}>
              {time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
            </span>
          </div>

          {/* nav items */}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item-mobile${activePage === item.id ? " active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span style={{ fontSize:18, width:28, textAlign:"center" }}>{item.icon}</span>
                <span>{item.label}</span>
                {activePage === item.id && (
                  <span style={{
                    marginLeft:"auto", width:6, height:6, borderRadius:"50%",
                    background:"#38bdf8", boxShadow:"0 0 8px #38bdf8",
                  }}/>
                )}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ── Backdrop (closes menu on outside tap) ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position:"fixed", inset:0, zIndex:198,
            background:"rgba(0,0,0,.4)",
            backdropFilter:"blur(2px)",
          }}
        />
      )}
    </>
  );
}