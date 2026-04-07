import React, { useEffect, useState, useRef } from "react";
import { getSensorData } from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ── helpers ────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

function pad2(n) { return String(n).padStart(2, "0"); }

function fmtTime(iso) {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fmtHour(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr   = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${ampm}`;
}

// ── custom tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,18,32,.97)",
      border: "1px solid rgba(251,191,36,.25)",
      borderRadius: 10, padding: "10px 14px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <p style={{ margin: 0, fontSize: 10, color: "#64748b", marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fbbf24" }}>
        🥚 {payload[0].value} eggs
      </p>
    </div>
  );
}

// ── animated counter ───────────────────────────────────────────────────────
function AnimCounter({ target }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target == null) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(ref.current); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(ref.current);
  }, [target]);
  return <span>{display}</span>;
}

// ── egg grid visual ────────────────────────────────────────────────────────
function EggGrid({ count }) {
  const show = Math.min(count ?? 0, 60);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "4px 0" }}>
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} style={{
          width: 18, height: 22,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          background: i < show
            ? `hsl(${42 + i * .5}, 85%, ${52 + i * .2}%)`
            : "rgba(255,255,255,.05)",
          boxShadow: i < show ? "0 2px 6px rgba(251,191,36,.3)" : "none",
          transition: `background .4s ease ${i * 18}ms, box-shadow .4s ease ${i * 18}ms`,
        }} />
      ))}
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function EggPage() {
  const [allData,      setAllData]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [chartType,    setChartType]    = useState("area"); // "area" | "bar"

  const fetchData = async () => {
    try {
      const res = await getSensorData();
      // res.data is array from MongoDB, newest first
      const arr = Array.isArray(res.data) ? res.data : [res.data];
      setAllData(arr);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, []);

  // ── derived stats ──────────────────────────────────────────────────────
  const latest      = allData[0] || {};
  const liveCount   = latest.eggCount ?? 0;

  // today's records
  const today       = todayStr();
  const todayData   = allData.filter(d => d.createdAt?.slice(0, 10) === today);
  const todayMax    = todayData.length
    ? Math.max(...todayData.map(d => d.eggCount ?? 0))
    : liveCount;
  const todayMin    = todayData.length
    ? Math.min(...todayData.map(d => d.eggCount ?? 0))
    : liveCount;

  // chart data — last 20 readings reversed to chronological
  const chartData = [...allData].reverse().slice(-20).map(d => ({
    time:  fmtTime(d.createdAt),
    eggs:  d.eggCount ?? 0,
  }));

  // hourly bar data (bucket by hour for today)
  const hourlyMap = {};
  todayData.forEach(d => {
    const h = new Date(d.createdAt).getHours();
    hourlyMap[h] = Math.max(hourlyMap[h] || 0, d.eggCount ?? 0);
  });
  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour:  fmtHour(h),
    eggs:  hourlyMap[h] ?? 0,
  })).filter(d => d.eggs > 0 || Object.keys(hourlyMap).length === 0).slice(
    0, Math.max(8, Object.keys(hourlyMap).length + 1)
  );

  const maxEgg = Math.max(...chartData.map(d => d.eggs), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes countGlow {
          0%,100% { text-shadow: 0 0 20px rgba(251,191,36,.4); }
          50%     { text-shadow: 0 0 60px rgba(251,191,36,.9), 0 0 100px rgba(251,191,36,.4); }
        }

        .egg-page {
          min-height: 100vh;
          background: #060d18;
          font-family: 'Outfit', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }
        .egg-page::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,191,36,.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(245,158,11,.05) 0%, transparent 50%);
        }

        .fade-up { animation: fadeUp .5s ease both; }

        .stat-card {
          background: rgba(12,20,36,.9);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 24px 26px;
          transition: transform .2s, box-shadow .2s, border-color .2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none; border-radius: 18px;
          background: radial-gradient(ellipse at 30% 0%, rgba(251,191,36,.07) 0%, transparent 60%);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(251,191,36,.2);
          box-shadow: 0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(251,191,36,.08);
        }

        .chart-card {
          background: rgba(12,20,36,.9);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 26px;
          position: relative; overflow: hidden;
        }

        .tab-btn {
          padding: 6px 16px; border-radius: 8px; cursor: pointer;
          font-size: 12px; font-weight: 700; letter-spacing: .5px;
          font-family: 'Outfit', sans-serif;
          transition: all .2s;
          border: 1px solid transparent;
        }
        .tab-btn.active {
          background: rgba(251,191,36,.12);
          border-color: rgba(251,191,36,.3);
          color: #fbbf24;
        }
        .tab-btn:not(.active) {
          background: rgba(255,255,255,.04);
          border-color: rgba(255,255,255,.07);
          color: #475569;
        }
        .tab-btn:not(.active):hover { color: #94a3b8; background: rgba(255,255,255,.07); }

        .refresh-btn {
          background: rgba(251,191,36,.08);
          border: 1px solid rgba(251,191,36,.2);
          color: #fbbf24; border-radius: 9px;
          padding: 7px 16px; font-size: 12px;
          font-family: 'Outfit', sans-serif; font-weight: 700;
          cursor: pointer; letter-spacing: .5px;
          transition: background .2s, box-shadow .2s;
        }
        .refresh-btn:hover {
          background: rgba(251,191,36,.15);
          box-shadow: 0 0 20px rgba(251,191,36,.2);
        }

        /* scrollbar */
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:99px; }
      `}</style>

      <div className="egg-page">
        <div style={{ position:"relative", zIndex:1, maxWidth:1300, margin:"0 auto", padding:"36px 28px 70px" }}>

          {/* ── PAGE HEADER ── */}
          <div className="fade-up" style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <div style={{
                  width:44, height:44, borderRadius:14,
                  background:"linear-gradient(135deg,#f59e0b,#fbbf24)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:22, boxShadow:"0 0 24px rgba(251,191,36,.4)",
                }}>🥚</div>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:900, letterSpacing:-.5, color:"#f1f5f9", lineHeight:1 }}>
                    Egg Production
                  </h1>
                  <p style={{ fontSize:11, color:"#334155", letterSpacing:1.5, textTransform:"uppercase", marginTop:2 }}>
                    Live Monitor · {new Date().toLocaleDateString([], { weekday:"long", day:"numeric", month:"long" })}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {lastUpdated && (
                <span style={{ fontSize:11, color:"#334155", fontFamily:"'JetBrains Mono',monospace" }}>
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <div style={{
                display:"flex", alignItems:"center", gap:6,
                background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)",
                borderRadius:20, padding:"4px 12px",
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", animation:"pulse 2s infinite" }}/>
                <span style={{ fontSize:10, color:"#34d399", fontWeight:700, letterSpacing:.8 }}>LIVE</span>
              </div>
              <button className="refresh-btn" onClick={fetchData}>↻ Refresh</button>
            </div>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)",
              borderRadius:12, padding:"12px 18px", marginBottom:24,
              fontSize:13, color:"#fca5a5",
            }}>❌ {error}</div>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <div style={{ textAlign:"center", paddingTop:100 }}>
              <div style={{
                width:44, height:44, borderRadius:"50%",
                border:"2px solid rgba(251,191,36,.15)", borderTop:"2px solid #fbbf24",
                animation:"spin 1s linear infinite", margin:"0 auto 16px",
              }}/>
              <p style={{ color:"#334155", fontSize:13 }}>Fetching egg data…</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ── TOP STAT CARDS ── */}
              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))",
                gap:16, marginBottom:28,
              }}>

                {/* Live Count — hero card */}
                <div className="stat-card fade-up" style={{
                  animationDelay:".0s",
                  gridColumn: "span 1",
                  border:"1px solid rgba(251,191,36,.2)",
                  background:"rgba(12,20,36,.95)",
                }}>
                  <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#64748b", marginBottom:10 }}>
                    🔴 Live Egg Count
                  </p>
                  <div style={{
                    fontSize:72, fontWeight:900, lineHeight:1,
                    fontFamily:"'JetBrains Mono',monospace",
                    color:"#fbbf24",
                    animation:"countGlow 3s ease-in-out infinite",
                  }}>
                    <AnimCounter target={liveCount} />
                  </div>
                  <p style={{ fontSize:11, color:"#475569", marginTop:8 }}>
                    eggs collected total
                  </p>
                  <div style={{
                    position:"absolute", bottom:0, left:0, right:0, height:3,
                    background:"linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a, #fbbf24, #f59e0b)",
                    backgroundSize:"200% 100%",
                    animation:"shimmer 2s linear infinite",
                    borderRadius:"0 0 18px 18px",
                  }}/>
                </div>

                {/* Today's high */}
                <div className="stat-card fade-up" style={{ animationDelay:".08s" }}>
                  <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#64748b", marginBottom:10 }}>
                    Today's Peak
                  </p>
                  <p style={{ fontSize:48, fontWeight:900, color:"#34d399", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
                    {todayMax}
                  </p>
                  <p style={{ fontSize:11, color:"#475569", marginTop:8 }}>highest reading today</p>
                  <div style={{ marginTop:14, height:4, background:"rgba(52,211,153,.1)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(todayMax/Math.max(todayMax,1))*100}%`,
                      background:"linear-gradient(90deg,#34d399,#6ee7b7)", borderRadius:99 }}/>
                  </div>
                </div>

                {/* Today's low */}
                <div className="stat-card fade-up" style={{ animationDelay:".14s" }}>
                  <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#64748b", marginBottom:10 }}>
                    Today's Low
                  </p>
                  <p style={{ fontSize:48, fontWeight:900, color:"#38bdf8", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
                    {todayMin}
                  </p>
                  <p style={{ fontSize:11, color:"#475569", marginTop:8 }}>lowest reading today</p>
                  <div style={{ marginTop:14, height:4, background:"rgba(56,189,248,.1)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(todayMin/Math.max(todayMax,1))*100}%`,
                      background:"linear-gradient(90deg,#38bdf8,#7dd3fc)", borderRadius:99 }}/>
                  </div>
                </div>

                {/* Readings today */}
                <div className="stat-card fade-up" style={{ animationDelay:".2s" }}>
                  <p style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:"#64748b", marginBottom:10 }}>
                    Readings Today
                  </p>
                  <p style={{ fontSize:48, fontWeight:900, color:"#a78bfa", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
                    {todayData.length || 1}
                  </p>
                  <p style={{ fontSize:11, color:"#475569", marginTop:8 }}>data points recorded</p>
                  <div style={{ marginTop:14, height:4, background:"rgba(167,139,250,.1)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:"100%",
                      background:"linear-gradient(90deg,#a78bfa,#c4b5fd)", borderRadius:99 }}/>
                  </div>
                </div>

              </div>

              {/* ── EGG GRID VISUAL ── */}
              <div className="chart-card fade-up" style={{ animationDelay:".22s", marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div>
                    <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#475569", marginBottom:2 }}>
                      Egg Grid · Visual Count
                    </p>
                    <p style={{ fontSize:11, color:"#334155" }}>
                      Showing {Math.min(liveCount, 60)} of {liveCount} eggs
                    </p>
                  </div>
                  <span style={{ fontSize:28 }}>🥚</span>
                </div>
                <EggGrid count={liveCount} />
              </div>

              {/* ── CHART ── */}
              <div className="chart-card fade-up" style={{ animationDelay:".28s", marginBottom:24 }}>
                {/* chart header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#475569", marginBottom:2 }}>
                      Egg Count Trend
                    </p>
                    <p style={{ fontSize:11, color:"#334155" }}>Last {chartData.length} readings from MongoDB</p>
                  </div>
                  {/* chart type tabs */}
                  <div style={{ display:"flex", gap:6 }}>
                    <button className={`tab-btn${chartType === "area" ? " active" : ""}`}
                      onClick={() => setChartType("area")}>📈 Area</button>
                    <button className={`tab-btn${chartType === "bar" ? " active" : ""}`}
                      onClick={() => setChartType("bar")}>📊 Bar</button>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"#334155", fontSize:13 }}>
                    No chart data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    {chartType === "area" ? (
                      <AreaChart data={chartData} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                        <defs>
                          <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                        <XAxis dataKey="time" tick={{ fill:"#334155", fontSize:10, fontFamily:"JetBrains Mono" }}
                          axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:"#334155", fontSize:10, fontFamily:"JetBrains Mono" }}
                          axisLine={false} tickLine={false} domain={[0, maxEgg + 5]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="eggs"
                          stroke="#fbbf24" strokeWidth={2.5}
                          fill="url(#eggGrad)"
                          dot={{ fill:"#fbbf24", r:3, strokeWidth:0 }}
                          activeDot={{ r:6, fill:"#fbbf24", boxShadow:"0 0 10px #fbbf24" }}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                        <XAxis dataKey="time" tick={{ fill:"#334155", fontSize:10, fontFamily:"JetBrains Mono" }}
                          axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:"#334155", fontSize:10, fontFamily:"JetBrains Mono" }}
                          axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="eggs" radius={[6,6,0,0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i}
                              fill={`hsl(${42 + i * 3}, 90%, ${52 + i * .5}%)`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>

              {/* ── HOURLY TABLE ── */}
              <div className="chart-card fade-up" style={{ animationDelay:".34s" }}>
                <p style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#475569", marginBottom:18 }}>
                  Today's Readings Log
                </p>
                {todayData.length === 0 ? (
                  <p style={{ color:"#334155", fontSize:13 }}>No readings recorded today yet.</p>
                ) : (
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                      <thead>
                        <tr>
                          {["Time","Egg Count","Status","ID"].map(h => (
                            <th key={h} style={{
                              padding:"8px 14px", textAlign:"left",
                              fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
                              color:"#334155", borderBottom:"1px solid rgba(255,255,255,.06)",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {todayData.slice(0, 10).map((row, i) => {
                          const isMax = row.eggCount === todayMax;
                          return (
                            <tr key={i} style={{
                              borderBottom:"1px solid rgba(255,255,255,.04)",
                              background: i % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent",
                              transition:"background .15s",
                            }}>
                              <td style={{ padding:"10px 14px", color:"#64748b" }}>{fmtTime(row.createdAt)}</td>
                              <td style={{ padding:"10px 14px", color:"#fbbf24", fontWeight:700 }}>
                                🥚 {row.eggCount ?? "--"}
                              </td>
                              <td style={{ padding:"10px 14px" }}>
                                <span style={{
                                  fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                                  background: isMax ? "rgba(52,211,153,.1)" : "rgba(255,255,255,.05)",
                                  color: isMax ? "#34d399" : "#475569",
                                  border: `1px solid ${isMax ? "rgba(52,211,153,.25)" : "rgba(255,255,255,.07)"}`,
                                }}>
                                  {isMax ? "⭐ Peak" : "Normal"}
                                </span>
                              </td>
                              <td style={{ padding:"10px 14px", color:"#1e3a5f", fontSize:10 }}>
                                {String(row._id).slice(-6)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {todayData.length > 10 && (
                      <p style={{ padding:"10px 14px", fontSize:11, color:"#334155" }}>
                        + {todayData.length - 10} more readings today
                      </p>
                    )}
                  </div>
                )}
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
}