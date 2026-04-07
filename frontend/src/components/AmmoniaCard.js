const statusColor = v => v == null ? "#64748b" : v <= 15 ? "#34d399" : v <= 25 ? "#fbbf24" : "#ef4444";
const statusLabel = v => v == null ? "OFFLINE" : v <= 15 ? "SAFE" : v <= 25 ? "CAUTION" : "DANGER";

function RadialMeter({ value, max = 50 }) {
  const pct = Math.min(1, Math.max(0, (value ?? 0) / max));
  const color = statusColor(value);
  const size = 160, cx = 80, cy = 80, r = 60;
  const bars = 30;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: 180, display: "block", margin: "0 auto" }}>
      {Array.from({ length: bars }, (_, i) => {
        const angle = -135 + (270 / bars) * i;
        const rad = (angle * Math.PI) / 180;
        const filled = i / bars <= pct;
        const x1 = cx + (r - 8) * Math.cos(rad);
        const y1 = cy + (r - 8) * Math.sin(rad);
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy + r * Math.sin(rad);
        const c = filled
          ? i / bars < 0.5 ? "#34d399"
          : i / bars < 0.75 ? "#fbbf24" : "#ef4444"
          : "rgba(255,255,255,.07)";
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={c} strokeWidth={4} strokeLinecap="round"
            style={filled ? { filter: `drop-shadow(0 0 3px ${c})` } : {}} />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f1f5f9"
        style={{ fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
        {value == null ? "--" : Number(value).toFixed(1)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" style={{ fontSize: 10 }}>ppm NH₃</text>
      <text x={cx} y={cy + 30} textAnchor="middle"
        fill={color} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
        {statusLabel(value)}
      </text>
    </svg>
  );
}

// ✅ Accepts BOTH:
//   <AmmoniaCard data={{ ammonia: 4 }} />   ← from Dashboard
//   <AmmoniaCard ammonia={4} />             ← direct prop
export default function AmmoniaCard({ data, ammonia: ammoniaProp }) {
  // prefer data.ammonia, fall back to direct ammonia prop
  const ammonia = data?.ammonia ?? ammoniaProp ?? null;
  const color = statusColor(ammonia);

  const thresholds = [
    { label: "Safe (< 15 ppm)",     color: "#34d399", range: "0 – 15"  },
    { label: "Caution (15–25 ppm)", color: "#fbbf24", range: "15 – 25" },
    { label: "Danger (> 25 ppm)",   color: "#ef4444", range: "25+"     },
  ];

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
        background: `radial-gradient(ellipse at 50% 50%, ${color}15 0%, transparent 70%)` }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#475569" }}>Ammonia · NH₃</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color, letterSpacing: 1.5 }}>
            Air Quality Index
          </p>
        </div>
        <span style={{ fontSize: 28 }}>☁️</span>
      </div>

      {/* radial meter */}
      <RadialMeter value={ammonia} max={50} />

      {/* threshold rows */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {thresholds.map(t => {
          const active = ammonia != null && (
            (t.color === "#34d399" && ammonia <= 15) ||
            (t.color === "#fbbf24" && ammonia > 15 && ammonia <= 25) ||
            (t.color === "#ef4444" && ammonia > 25)
          );
          return (
            <div key={t.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "8px 14px",
              border: `1px solid ${active ? t.color + "44" : "transparent"}`,
              transition: "border-color .3s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color,
                  boxShadow: `0 0 6px ${t.color}` }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{t.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.color,
                fontFamily: "'DM Mono', monospace" }}>{t.range}</span>
            </div>
          );
        })}
      </div>

      {/* ventilation warning */}
      {ammonia != null && ammonia > 15 && (
        <div style={{
          marginTop: 12, background: "rgba(239,68,68,.08)",
          border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "#fca5a5",
        }}>
          ⚠️ {ammonia > 25
            ? "Immediate ventilation required! Bird health at risk."
            : "Increase ventilation to reduce NH₃ levels."}
        </div>
      )}

      {/* safe badge */}
      {ammonia != null && ammonia <= 15 && (
        <div style={{
          marginTop: 12, background: "rgba(52,211,153,.08)",
          border: "1px solid rgba(52,211,153,.2)", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, color: "#34d399",
        }}>
          ✅ Air quality is safe for your flock.
        </div>
      )}
    </div>
  );
}