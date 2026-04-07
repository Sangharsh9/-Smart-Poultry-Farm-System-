import { useEffect, useRef } from "react";

const statusColor = v => v == null ? "#64748b" : v >= 50 && v <= 65 ? "#34d399" : v < 80 ? "#fbbf24" : "#ef4444";
const statusLabel = v => v == null ? "OFFLINE" : v >= 50 && v <= 65 ? "OPTIMAL" : v < 80 ? "HIGH" : "CRITICAL";

function WaveBlob({ pct, color }) {
  const w = 200, h = 120;
  const waterY = h - (pct / 100) * h;
  const wave = (x, offset) => waterY + Math.sin((x / w) * 2 * Math.PI + offset) * 6;

  const points1 = Array.from({ length: w + 1 }, (_, x) => `${x},${wave(x, 0)}`).join(" ");
  const points2 = Array.from({ length: w + 1 }, (_, x) => `${x},${wave(x, Math.PI * .6)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 120, display: "block", borderRadius: 12, overflow: "hidden" }}>
      <defs>
        <linearGradient id="wg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".5" />
          <stop offset="100%" stopColor={color} stopOpacity=".15" />
        </linearGradient>
        <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity=".08" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="rgba(255,255,255,.04)" />
      {/* wave 1 */}
      <polyline points={`0,${h} ${points1} ${w},${h}`} fill="url(#wg1)" />
      {/* wave 2 */}
      <polyline points={`0,${h} ${points2} ${w},${h}`} fill="url(#wg2)" />
      {/* label */}
      <text x={w / 2} y={h / 2 + 6} textAnchor="middle"
        fill="#f1f5f9" style={{ fontSize: 26, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
        {pct == null ? "--" : `${pct.toFixed(1)}%`}
      </text>
    </svg>
  );
}

export default function HumidityCard({ data }) {
  const humidity = data?.humidity;
  const color = statusColor(humidity);
  const label = statusLabel(humidity);

  const rows = [
    { l: "Dew Point",   v: humidity != null ? `${(humidity * .55 - 10).toFixed(1)}°C` : "--" },
    { l: "Optimal",     v: "50 – 65 %" },
    { l: "Min Today",   v: data?.hum_min != null ? `${data.hum_min}%` : "--" },
    { l: "Max Today",   v: data?.hum_max != null ? `${data.hum_max}%` : "--" },
  ];

  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      background: "rgba(15,23,42,.8)",
      border: "1px solid rgba(255,255,255,.08)",
      padding: "24px 22px",
      fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 100%, ${color}18 0%, transparent 65%)` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#475569" }}>Humidity</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color, letterSpacing: 1.5 }}>{label}</p>
        </div>
        <span style={{ fontSize: 28 }}>💧</span>
      </div>

      <WaveBlob pct={humidity} color={color} />

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rows.map(r => (
          <div key={r.l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "8px 12px" }}>
            <p style={{ margin: 0, fontSize: 9, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase" }}>{r.l}</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Mono', monospace" }}>{r.v}</p>
          </div>
        ))}
      </div>

      {/* comfort band */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", marginBottom: 4 }}>
          <span>0%</span><span>Comfort Zone: 50-65%</span><span>100%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: "50%", width: "15%", height: "100%", background: "rgba(52,211,153,.3)" }} />
          {humidity != null && (
            <div style={{
              position: "absolute", top: 0, height: "100%", width: 3,
              background: color, borderRadius: 99,
              left: `${Math.min(97, humidity)}%`,
              boxShadow: `0 0 6px ${color}`,
            }} />
          )}
        </div>
      </div>
    </div>
  );
}