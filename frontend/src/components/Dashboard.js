import React, { useEffect, useState } from "react";
import { getSensorData } from "../services/api";
import TemperatureCard from "./TemperatureCard";
import HumidityCard from "./HumidityCard";
import AmmoniaCard from "./AmmoniaCard";
import EggCountCard from "./EggCountCard";

function Dashboard() {

  // ── EXACT SAME API LOGIC ──────────────────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getSensorData();
      setData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const latest = data?.[0] || {};
  const temp     = latest.temperature;
  const humidity = latest.humidity;
  const ammonia  = latest.ammonia;
  const light    = latest.light;
  const eggs     = latest.eggCount;

  const alerts = [];
  if (temp     > 34) alerts.push(`🌡 Temperature critical: ${temp}°C`);
  if (humidity > 75) alerts.push(`💧 Humidity critical: ${humidity}%`);
  if (ammonia  > 25) alerts.push(`☁ Ammonia dangerous: ${ammonia} ppm`);
  // ── END API LOGIC ─────────────────────────────────────────────────────────

  const tempColor = temp     > 34 ? "#ef4444" : temp     > 28 ? "#fbbf24" : "#34d399";
  const humColor  = humidity > 75 ? "#ef4444" : humidity > 65 ? "#fbbf24" : "#38bdf8";
  const ammColor  = ammonia  > 25 ? "#ef4444" : ammonia  > 15 ? "#fbbf24" : "#a78bfa";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0);    } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes spin     { to   { transform: rotate(360deg); } }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes scanline { 0%   { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes glow     { 0%,100%{ box-shadow: 0 0 20px rgba(56,189,248,.2); } 50%{ box-shadow: 0 0 40px rgba(56,189,248,.5); } }

        .dash-root {
          min-height: 100vh;
          background: #050b14;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }

        /* grid bg pattern */
        .dash-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(56,189,248,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        /* scanline effect */
        .dash-root::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,.6), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        .dash-content { position: relative; z-index: 2; }

        /* ── header ── */
        .dash-header {
          background: rgba(5,11,20,.9);
          border-bottom: 1px solid rgba(56,189,248,.15);
          backdrop-filter: blur(20px);
          padding: 0 36px;
          position: sticky; top: 0; z-index: 100;
        }
        .dash-header-inner {
          max-width: 1400px; margin: 0 auto;
          height: 66px;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* ── kpi strip ── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .kpi-card {
          background: rgba(10,18,32,.9);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex; flex-direction: column; gap: 6px;
          transition: transform .2s, border-color .2s, box-shadow .2s;
          cursor: default;
          animation: fadeUp .5s ease both;
        }
        .kpi-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56,189,248,.25);
          box-shadow: 0 12px 36px rgba(0,0,0,.5), 0 0 0 1px rgba(56,189,248,.1);
        }
        .kpi-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          color: #475569;
        }
        .kpi-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 26px; font-weight: 700;
          line-height: 1;
        }
        .kpi-sub {
          font-size: 10px; color: #334155;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── sensor cards ── */
        .sensor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 20px;
        }
        .sensor-wrap {
          transition: transform .2s, box-shadow .2s;
          animation: fadeUp .5s ease both;
        }
        .sensor-wrap:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 56px rgba(0,0,0,.6);
        }

        /* ── alert banner ── */
        .alert-banner {
          background: rgba(239,68,68,.07);
          border: 1px solid rgba(239,68,68,.3);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex; align-items: flex-start; gap: 12px;
          animation: fadeIn .3s ease;
        }

        /* ── raw data panel ── */
        .raw-panel {
          background: rgba(10,18,32,.9);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          overflow: hidden;
          animation: fadeUp .5s ease both;
        }
        .raw-panel-header {
          padding: 14px 22px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 10px;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── refresh btn ── */
        .refresh-btn {
          background: rgba(56,189,248,.08);
          border: 1px solid rgba(56,189,248,.2);
          color: #38bdf8;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: .5px;
          transition: background .2s, box-shadow .2s;
        }
        .refresh-btn:hover {
          background: rgba(56,189,248,.15);
          box-shadow: 0 0 20px rgba(56,189,248,.2);
        }

        /* ── status badge ── */
        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; letter-spacing: .8px;
        }

        .fade-up { animation: fadeUp .5s ease both; }
      `}</style>

      <div className="dash-root">
        <div className="dash-content">


          {/* ── BODY ── */}
          <main style={{ maxWidth:1400, margin:"0 auto", padding:"32px 36px 60px" }}>

            {/* Page title */}
            <div className="fade-up" style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", letterSpacing:-.4, marginBottom:4 }}>
                Farm Overview
              </h1>
              <p style={{ fontSize:12, color:"#334155" }}>
                Real-time sensor data from MongoDB · auto-refresh every 10s
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)",
                borderRadius:10, padding:"12px 16px", marginBottom:20,
                fontSize:12, color:"#fca5a5", fontWeight:500,
              }}>
                ❌ {error} — ensure backend is running and CORS is enabled
              </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="alert-banner" style={{ marginBottom:24 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>🚨</span>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
                    Active Alerts
                  </p>
                  {alerts.map((a, i) => (
                    <p key={i} style={{ fontSize:13, color:"#fca5a5", fontWeight:500 }}>{a}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign:"center", paddingTop:100 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%",
                  border:"2px solid rgba(56,189,248,.15)",
                  borderTop:"2px solid #38bdf8",
                  animation:"spin 1s linear infinite",
                  margin:"0 auto 16px",
                }}/>
                <p style={{ color:"#334155", fontSize:13 }}>Connecting to MongoDB…</p>
              </div>
            )}

            {!loading && (
              <>
                {/* ── KPI STRIP ── */}
                <div className="kpi-grid" style={{ marginBottom:28 }}>

                  {[
                    {
                      icon:"🌡️", label:"Temperature",
                      value: temp != null ? `${temp}°C` : "--",
                      color: tempColor, delay:"0s",
                      sub: temp > 34 ? "⚠ Critical" : temp > 28 ? "⚠ Warning" : "✓ Optimal",
                      subColor: tempColor,
                    },
                    {
                      icon:"💧", label:"Humidity",
                      value: humidity != null ? `${humidity}%` : "--",
                      color: humColor, delay:".06s",
                      sub: humidity > 75 ? "⚠ Critical" : humidity > 65 ? "⚠ High" : "✓ Normal",
                      subColor: humColor,
                    },
                    {
                      icon:"☁️", label:"Ammonia NH₃",
                      value: ammonia != null ? `${ammonia} ppm` : "--",
                      color: ammColor, delay:".12s",
                      sub: ammonia > 25 ? "⚠ Dangerous" : ammonia > 15 ? "⚠ Caution" : "✓ Safe",
                      subColor: ammColor,
                    },
                    {
                      icon:"💡", label:"Light",
                      value: light != null ? `${light} lux` : "--",
                      color: "#fbbf24", delay:".18s",
                      sub: "Ambient level",
                      subColor: "#475569",
                    },
                    {
                      icon:"🥚", label:"Egg Count",
                      value: eggs != null ? eggs : "--",
                      color: "#f59e0b", delay:".24s",
                      sub: "Total collected",
                      subColor: "#475569",
                    },
                  ].map(k => (
                    <div key={k.label} className="kpi-card" style={{ animationDelay: k.delay }}>
                      {/* top row */}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span className="kpi-label">{k.label}</span>
                        <span style={{ fontSize:20 }}>{k.icon}</span>
                      </div>
                      {/* value */}
                      <div className="kpi-value" style={{ color: k.color }}>
                        {k.value}
                      </div>
                      {/* sub */}
                      <div className="kpi-sub" style={{ color: k.subColor }}>
                        {k.sub}
                      </div>
                      {/* accent bar */}
                      <div style={{
                        height:2, borderRadius:99, marginTop:6,
                        background:`linear-gradient(90deg, ${k.color}, transparent)`,
                        opacity:.5,
                      }}/>
                    </div>
                  ))}

                </div>

                {/* ── SENSOR CARDS ── */}
                <div className="sensor-grid" style={{ marginBottom:28 }}>
                  <div className="sensor-wrap" style={{ animationDelay:".08s" }}>
                    <TemperatureCard data={latest} />
                  </div>
                  <div className="sensor-wrap" style={{ animationDelay:".16s" }}>
                    <HumidityCard data={latest} />
                  </div>
                  <div className="sensor-wrap" style={{ animationDelay:".24s" }}>
                    <AmmoniaCard data={latest} />
                  </div>
                  <div className="sensor-wrap" style={{ animationDelay:".32s" }}>
                    <EggCountCard data={latest} />
                  </div>
                </div>

                {/* ── RAW MONGODB DOCUMENT ── */}
                <div className="raw-panel fade-up" style={{ animationDelay:".4s" }}>
                  <div className="raw-panel-header">
                    <div className="dot" style={{ background:"#ef4444" }}/>
                    <div className="dot" style={{ background:"#fbbf24" }}/>
                    <div className="dot" style={{ background:"#34d399" }}/>
                    <span style={{ fontSize:10, color:"#334155", letterSpacing:2, textTransform:"uppercase", marginLeft:8 }}>
                      Latest MongoDB Document
                    </span>
                    {latest._id && (
                      <span style={{
                        marginLeft:"auto", fontSize:10,
                        color:"#1e3a5f", fontFamily:"'JetBrains Mono',monospace",
                      }}>
                        _id: {latest._id}
                      </span>
                    )}
                  </div>
                  <pre style={{
                    padding:"18px 22px",
                    fontSize:12, lineHeight:1.7,
                    color:"#38bdf8",
                    fontFamily:"'JetBrains Mono',monospace",
                    overflow:"auto", maxHeight:220,
                    margin:0,
                  }}>
                    {JSON.stringify(latest, null, 2)}
                  </pre>
                </div>

              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;