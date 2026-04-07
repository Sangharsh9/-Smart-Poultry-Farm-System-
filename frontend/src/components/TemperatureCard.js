import { useEffect, useState } from "react";

function Arc({ value, min, max, color }) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const r = 70, cx = 90, cy = 90;
  const startAngle = -210, sweep = 240;
  const toRad = d => (d * Math.PI) / 180;
  const arcPt = angle => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const endAngle = startAngle + sweep * pct;
  const s = arcPt(startAngle), e = arcPt(endAngle), bg = arcPt(startAngle + sweep);

  const describeArc = (a1, a2) => {
    const p1 = arcPt(a1), p2 = arcPt(a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  return (
    <svg viewBox="0 0 180 130" style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto" }}>
      {/* bg arc */}
      <path d={describeArc(startAngle, startAngle + sweep)}
        fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={10} strokeLinecap="round" />
      {/* value arc */}
      {pct > 0 && (
        <path d={describeArc(startAngle, endAngle)}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      )}
      {/* center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9"
        style={{ fontSize: 26, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
        {value == null ? "--" : Number(value).toFixed(1)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#64748b" style={{ fontSize: 11 }}>°C</text>
      <text x={arcPt(startAngle).x} y={arcPt(startAngle).y + 14} textAnchor="middle" fill="#334155" style={{ fontSize: 9 }}>{min}</text>
      <text x={arcPt(startAngle + sweep).x} y={arcPt(startAngle + sweep).y + 14} textAnchor="middle" fill="#334155" style={{ fontSize: 9 }}>{max}</text>
    </svg>
  );
}

const statusColor = v => v == null ? "#64748b" : v <= 28 ? "#34d399" : v <= 34 ? "#fbbf24" : "#ef4444";
const statusLabel = v => v == null ? "OFFLINE" : v <= 28 ? "OPTIMAL" : v <= 34 ? "WARNING" : "CRITICAL";

export default function TemperatureCard({ data }) {
  const temp = data?.temperature;
  const color = statusColor(temp);
  const label = statusLabel(temp);

  const [prev, setPrev] = useState(null);
  useEffect(() => {
    if (temp != null) setPrev(p => p === null ? temp : p);
  }, [temp]);

  const trend = prev == null || temp == null ? "—" : temp > prev ? "↑ Rising" : temp < prev ? "↓ Falling" : "→ Stable";

  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      background: "rgba(15,23,42,.8)",
      border: "1px solid rgba(255,255,255,.08)",
      padding: "24px 22px",
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${color}22 0%, transparent 65%)` }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#475569" }}>Temperature</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700,
            color, letterSpacing: 1.5,
            textShadow: `0 0 10px ${color}` }}>{label}</p>
        </div>
        <span style={{ fontSize: 28 }}>🌡️</span>
      </div>

      <Arc value={temp} min={15} max={45} color={color} />

      {/* stats */}
      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { l: "Feels Like", v: temp != null ? `${(temp + .8).toFixed(1)}°C` : "--" },
          { l: "Trend",      v: trend },
          { l: "Min Today",  v: data?.temp_min != null ? `${data.temp_min}°C` : "--" },
          { l: "Max Today",  v: data?.temp_max != null ? `${data.temp_max}°C` : "--" },
        ].map(s => (
          <div key={s.l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "8px 12px" }}>
            <p style={{ margin: 0, fontSize: 9, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase" }}>{s.l}</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#cbd5e1", fontFamily: "'DM Mono', monospace" }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* threshold bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9, color: "#475569" }}>
          <span>15°C</span><span>Optimal: 22-28°C</span><span>45°C</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
          {/* zones */}
          <div style={{ position: "absolute", left: "23%", width: "43%", height: "100%", background: "rgba(52,211,153,.25)" }} />
          <div style={{ position: "absolute", left: "66%", width: "19%", height: "100%", background: "rgba(251,191,36,.2)" }} />
          <div style={{ position: "absolute", left: "85%", width: "15%", height: "100%", background: "rgba(239,68,68,.2)" }} />
          {/* needle */}
          {temp != null && (
            <div style={{
              position: "absolute", top: 0, height: "100%", width: 3,
              background: color, borderRadius: 99,
              left: `${Math.min(97, Math.max(0, ((temp - 15) / 30) * 100))}%`,
              boxShadow: `0 0 6px ${color}`,
            }} />
          )}
        </div>
      </div>
    </div>
  );
}