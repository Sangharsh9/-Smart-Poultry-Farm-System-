function EggGrid({ count = 0, max = 50 }) {
  const display = Math.min(count, max);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(10, 1fr)",
      gap: 4,
      padding: "14px 0",
    }}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: i < display
              ? `hsl(${45 + i * 1.5}, 80%, ${55 + i * .3}%)`
              : "rgba(255,255,255,.06)",
            boxShadow: i < display ? "0 2px 6px rgba(251,191,36,.35)" : "none",
            transition: `background .3s ease ${i * 12}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function EggCountCard({ data }) {
  const eggs       = data?.egg_count  ?? data?.eggCount  ?? 0;
  const birds      = data?.bird_count ?? data?.birdCount ?? 0;
  const production = birds > 0 ? ((eggs / birds) * 100).toFixed(1) : "--";

  const stats = [
    { l: "Total Eggs",  v: eggs,         color: "#fbbf24" },
    { l: "Total Birds", v: birds,        color: "#a78bfa" },
    { l: "Production Rate", v: `${production}%`, color: "#34d399" },
    { l: "Avg / Bird", v: birds > 0 ? (eggs / birds).toFixed(2) : "--", color: "#38bdf8" },
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
        background: "radial-gradient(ellipse at 30% 30%, rgba(251,191,36,.12) 0%, transparent 65%)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#475569" }}>Egg Count</p>
          <p style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 900, color: "#fbbf24",
            fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
            {eggs}
            <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400, marginLeft: 4 }}>eggs</span>
          </p>
        </div>
        <span style={{ fontSize: 40 }}>🥚</span>
      </div>

      {/* egg visual grid */}
      <EggGrid count={Math.min(eggs, 50)} max={50} />

      {eggs > 50 && (
        <p style={{ margin: "-8px 0 8px", fontSize: 11, color: "#64748b", textAlign: "center" }}>
          Showing 50 of {eggs} eggs
        </p>
      )}

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map(s => (
          <div key={s.l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ margin: 0, fontSize: 9, color: "#475569", letterSpacing: 1.2, textTransform: "uppercase" }}>{s.l}</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: s.color,
              fontFamily: "'DM Mono', monospace" }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* production bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", marginBottom: 4 }}>
          <span>Production Rate</span>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>{production}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, production)}%`,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
            borderRadius: 99,
            boxShadow: "0 0 10px rgba(251,191,36,.4)",
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}