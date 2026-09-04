import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─────────────────────────────────────────────
// 1. VERİ SİMÜLASYONU
// ─────────────────────────────────────────────
const MONTHS = ["Ocak", "Şubat", "Mart"];

// Emisyon katsayıları
const ELECTRIC_FACTOR = 0.49;   // kg CO2 / kWh (Türkiye grid faktörü)
const WATER_FACTOR    = 0.344;  // kg CO2 / m³
const GAS_FACTOR      = 2.04;   // kg CO2 / m³

const FACULTIES = [
  {
    id: "muh",
    name: "Mühendislik",
    shortName: "MÜH",
    color: "#3b82f6",
    emoji: "⚙️",
    anomaly: true,   // kırmızı alarm – israf yapan
    champion: false,
    // Yüksek tüketim (laboratuvarlar, bilgisayar odaları)
    electric: [42800, 44500, 41200],   // kWh
    water:    [1850,  1920,  1780],    // m³
    gas:      [3200,  3400,  2900],    // m³
  },
  {
    id: "iibf",
    name: "İktisadi ve İdari Bilimler",
    shortName: "İİBF",
    color: "#8b5cf6",
    emoji: "📊",
    anomaly: false,
    champion: false,
    electric: [18200, 19100, 17500],
    water:    [920,   980,   870],
    gas:      [1650,  1820,  1510],
  },
  {
    id: "fen",
    name: "Fen Edebiyat",
    shortName: "FEN",
    color: "#10b981",
    emoji: "🔬",
    anomaly: false,
    champion: true,  // altın madalya – en tasarruflu
    electric: [12400, 12900, 11800],
    water:    [610,   640,   580],
    gas:      [980,   1050,  890],
  },
  {
    id: "egitim",
    name: "Eğitim",
    shortName: "EĞT",
    color: "#f59e0b",
    emoji: "📚",
    anomaly: false,
    champion: false,
    electric: [15600, 16200, 14900],
    water:    [780,   820,   730],
    gas:      [1280,  1420,  1150],
  },
  {
    id: "teknoloji",
    name: "Teknoloji",
    shortName: "TEK",
    color: "#ef4444",
    emoji: "💻",
    anomaly: true,   // su israfı anomali
    champion: false,
    electric: [28600, 30200, 27400],
    water:    [2100,  2350,  2050],  // anomali – çok yüksek su tüketimi
    gas:      [2400,  2600,  2200],
  },
];

// Su tasarrufu şampiyonu hesapla (en az su kullanan)
const waterTotals = FACULTIES.map(f => ({ id: f.id, total: f.water.reduce((a, b) => a + b, 0) }));
const minWater = Math.min(...waterTotals.map(w => w.total));
const waterChampionId = waterTotals.find(w => w.total === minWater)?.id;

// Kampüs ortalamaları (anomali tespiti için)
const avgElectric = MONTHS.map((_, i) =>
  FACULTIES.reduce((s, f) => s + f.electric[i], 0) / FACULTIES.length
);
const avgWater = MONTHS.map((_, i) =>
  FACULTIES.reduce((s, f) => s + f.water[i], 0) / FACULTIES.length
);
const avgGas = MONTHS.map((_, i) =>
  FACULTIES.reduce((s, f) => s + f.gas[i], 0) / FACULTIES.length
);

// Bütçe tahmini (TL)
const ELECTRIC_PRICE = 3.8;  // TL/kWh
const WATER_PRICE    = 28.5; // TL/m³
const GAS_PRICE      = 15.2; // TL/m³

function computeStats(faculty) {
  const totalElectric = faculty.electric.reduce((a, b) => a + b, 0);
  const totalWater    = faculty.water.reduce((a, b) => a + b, 0);
  const totalGas      = faculty.gas.reduce((a, b) => a + b, 0);
  const co2 = (totalElectric * ELECTRIC_FACTOR + totalWater * WATER_FACTOR + totalGas * GAS_FACTOR) / 1000; // ton
  const budget = totalElectric * ELECTRIC_PRICE + totalWater * WATER_PRICE + totalGas * GAS_PRICE;
  return { totalElectric, totalWater, totalGas, co2: co2.toFixed(2), budget: Math.round(budget) };
}

// Campus totals
const campusTotals = (() => {
  const te = FACULTIES.reduce((s, f) => s + f.electric.reduce((a, b) => a + b, 0), 0);
  const tw = FACULTIES.reduce((s, f) => s + f.water.reduce((a, b) => a + b, 0), 0);
  const tg = FACULTIES.reduce((s, f) => s + f.gas.reduce((a, b) => a + b, 0), 0);
  const co2 = ((te * ELECTRIC_FACTOR + tw * WATER_FACTOR + tg * GAS_FACTOR) / 1000).toFixed(1);
  const budget = Math.round(te * ELECTRIC_PRICE + tw * WATER_PRICE + tg * GAS_PRICE);
  return { te, tw, tg, co2, budget };
})();

// ─────────────────────────────────────────────
// 2. YARDIMCI BİLEŞENLER
// ─────────────────────────────────────────────

const KPICard = ({ icon, label, value, unit, color, sub }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    border: `1px solid ${color}33`,
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: -10, right: -10, fontSize: 64, opacity: 0.07 }}>{icon}</div>
    <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
    <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
    <div style={{ color, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4, color: "#94a3b8" }}>{unit}</span>
    </div>
    {sub && <div style={{ color: "#64748b", fontSize: 12 }}>{sub}</div>}
  </div>
);

const Badge = ({ type }) => {
  const configs = {
    gold: { label: "🥇 Altın Madalya", bg: "linear-gradient(90deg,#f59e0b,#fbbf24)", color: "#1c1917" },
    silver: { label: "🥈 Gümüş", bg: "linear-gradient(90deg,#94a3b8,#cbd5e1)", color: "#1c1917" },
    bronze: { label: "🥉 Bronz", bg: "linear-gradient(90deg,#b45309,#d97706)", color: "#fff" },
    water: { label: "💧 Su Koruyucusu", bg: "linear-gradient(90deg,#0ea5e9,#38bdf8)", color: "#fff" },
    anomaly: { label: "⚠️ Anomali", bg: "linear-gradient(90deg,#ef4444,#f87171)", color: "#fff" },
  };
  const c = configs[type];
  if (!c) return null;
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      display: "inline-block",
    }}>{c.label}</span>
  );
};

const AnomalyTag = ({ value, avg, unit }) => {
  const pct = ((value - avg) / avg * 100).toFixed(0);
  const isHigh = value > avg * 1.15;
  const isLow  = value < avg * 0.85;
  if (isHigh) return (
    <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, background: "#ef444422", borderRadius: 6, padding: "2px 7px" }}>
      ↑{pct}% aşım ⚠️
    </span>
  );
  if (isLow) return (
    <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700, background: "#10b98122", borderRadius: 6, padding: "2px 7px" }}>
      ↓{Math.abs(pct)}% tasarruf ✓
    </span>
  );
  return <span style={{ color: "#64748b", fontSize: 11 }}>Normal</span>;
};

// ─────────────────────────────────────────────
// 3. SEKME BİLEŞENLERİ
// ─────────────────────────────────────────────

// ── 3A. Ana Sayfa ──────────────────────────────
function HomeTab() {
  const trendData = MONTHS.map((m, i) => ({
    ay: m,
    Elektrik: FACULTIES.reduce((s, f) => s + f.electric[i], 0),
    Su: FACULTIES.reduce((s, f) => s + f.water[i], 0),
    Doğalgaz: FACULTIES.reduce((s, f) => s + f.gas[i], 0),
    CO2: parseFloat(
      ((FACULTIES.reduce((s, f) => s + f.electric[i], 0) * ELECTRIC_FACTOR +
        FACULTIES.reduce((s, f) => s + f.water[i], 0) * WATER_FACTOR +
        FACULTIES.reduce((s, f) => s + f.gas[i], 0) * GAS_FACTOR) / 1000).toFixed(1)
    ),
  }));

  const co2Pie = FACULTIES.map(f => {
    const s = computeStats(f);
    return { name: f.shortName, value: parseFloat(s.co2), color: f.color };
  });

  const COLORS_PIE = FACULTIES.map(f => f.color);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* KPI Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        <KPICard icon="⚡" label="Toplam Elektrik" value={(campusTotals.te / 1000).toFixed(1)} unit="MWh" color="#3b82f6" sub="Ocak–Mart 2025" />
        <KPICard icon="💧" label="Toplam Su" value={campusTotals.tw.toLocaleString("tr-TR")} unit="m³" color="#0ea5e9" sub="Tüm fakülteler" />
        <KPICard icon="🔥" label="Toplam Doğalgaz" value={campusTotals.tg.toLocaleString("tr-TR")} unit="m³" color="#f59e0b" sub="Kış dönemi" />
        <KPICard icon="💰" label="Tahmini Bütçe" value={(campusTotals.budget / 1000).toFixed(0)} unit="bin ₺" color="#8b5cf6" sub="3 aylık toplam" />
        <KPICard icon="🌿" label="Toplam CO₂" value={campusTotals.co2} unit="ton" color="#10b981" sub="Karbon ayak izi" />
      </div>

      {/* Trend Grafikleri */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="⚡ Kampüs Elektrik Tüketimi (kWh)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="Elektrik" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="💧 Su + 🔥 Doğalgaz Tüketimi">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="Su" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Doğalgaz" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🌿 Aylık CO₂ Emisyonu (ton)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="CO2" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🍕 Fakülte Karbon Ayak İzi Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={co2Pie} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#475569" }}>
                {co2Pie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} formatter={(v) => [`${v} ton CO₂`]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Anomali Özet Uyarıları */}
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 20 }}>
        <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚠️ Kampüs Anomali Uyarıları</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FACULTIES.filter(f => f.anomaly).map(f => (
            <div key={f.id} style={{ color: "#fca5a5", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{f.emoji}</span>
              <strong>{f.name}</strong> — Ortalama tüketimin belirgin şekilde üzerinde. Acil inceleme önerilir.
            </div>
          ))}
          <div style={{ color: "#fca5a5", fontSize: 13 }}>
            🔧 Teknoloji Fakültesi su tüketimi kampüs ortalamasının <strong>%{Math.round((FACULTIES.find(f=>f.id==="teknoloji").water[1] / avgWater[1] - 1)*100)}</strong> üzerinde (Şubat).
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3B. Fakülte Analiz Paneli ───────────────────
function FacultyTab() {
  const [selectedId, setSelectedId] = useState(FACULTIES[0].id);
  const faculty = FACULTIES.find(f => f.id === selectedId);
  const stats = computeStats(faculty);

  const monthlyData = MONTHS.map((m, i) => ({
    ay: m,
    Elektrik: faculty.electric[i],
    Su: faculty.water[i],
    Doğalgaz: faculty.gas[i],
    CO2: parseFloat(
      ((faculty.electric[i] * ELECTRIC_FACTOR + faculty.water[i] * WATER_FACTOR + faculty.gas[i] * GAS_FACTOR) / 1000).toFixed(2)
    ),
    avgElectric: Math.round(avgElectric[i]),
    avgWater: Math.round(avgWater[i]),
    avgGas: Math.round(avgGas[i]),
  }));

  const radarData = [
    { subject: "Elektrik", value: faculty.electric.reduce((a,b)=>a+b,0), fullMark: 130000 },
    { subject: "Su", value: faculty.water.reduce((a,b)=>a+b,0) * 20, fullMark: 130000 },
    { subject: "Doğalgaz", value: faculty.gas.reduce((a,b)=>a+b,0) * 15, fullMark: 130000 },
  ];

  const co2Breakdown = [
    { name: "Elektrik", value: parseFloat((faculty.electric.reduce((a,b)=>a+b,0)*ELECTRIC_FACTOR/1000).toFixed(2)), color: "#3b82f6" },
    { name: "Su", value: parseFloat((faculty.water.reduce((a,b)=>a+b,0)*WATER_FACTOR/1000).toFixed(2)), color: "#0ea5e9" },
    { name: "Doğalgaz", value: parseFloat((faculty.gas.reduce((a,b)=>a+b,0)*GAS_FACTOR/1000).toFixed(2)), color: "#f59e0b" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Fakülte Seçici */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Fakülte Seç:</div>
        {FACULTIES.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedId(f.id)}
            style={{
              padding: "8px 18px", borderRadius: 24, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              background: selectedId === f.id ? f.color : "rgba(255,255,255,0.06)",
              color: selectedId === f.id ? "#fff" : "#94a3b8",
              transition: "all 0.2s",
            }}
          >
            {f.emoji} {f.shortName}
          </button>
        ))}
      </div>

      {/* Başlık & Rozetler */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 36 }}>{faculty.emoji}</div>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800 }}>{faculty.name} Fakültesi</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>2025 Ocak–Mart Tüketim Analizi</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {faculty.champion && <Badge type="gold" />}
          {faculty.id === waterChampionId && <Badge type="water" />}
          {faculty.anomaly && <Badge type="anomaly" />}
        </div>
      </div>

      {/* Mini KPI'lar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <KPICard icon="⚡" label="Toplam Elektrik" value={(stats.totalElectric/1000).toFixed(1)} unit="MWh" color={faculty.color} />
        <KPICard icon="💧" label="Toplam Su" value={stats.totalWater.toLocaleString("tr-TR")} unit="m³" color="#0ea5e9" />
        <KPICard icon="🔥" label="Toplam Doğalgaz" value={stats.totalGas.toLocaleString("tr-TR")} unit="m³" color="#f59e0b" />
        <KPICard icon="🌿" label="CO₂ Ayak İzi" value={stats.co2} unit="ton" color="#10b981" />
        <KPICard icon="💰" label="Tahmini Bütçe" value={(stats.budget/1000).toFixed(1)} unit="bin ₺" color="#8b5cf6" />
      </div>

      {/* Grafikler */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title={`⚡ Elektrik Tüketimi vs Ortalama (kWh)`}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="Elektrik" name="Bu Fakülte" fill={faculty.color} radius={[4,4,0,0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={d.Elektrik > d.avgElectric * 1.15 ? "#ef4444" : d.Elektrik < d.avgElectric * 0.85 ? "#10b981" : faculty.color} />
                ))}
              </Bar>
              <Bar dataKey="avgElectric" name="Kampüs Ort." fill="#334155" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="💧 Su Tüketimi vs Ortalama (m³)">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="Su" name="Bu Fakülte" fill="#0ea5e9" radius={[4,4,0,0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={d.Su > d.avgWater * 1.15 ? "#ef4444" : d.Su < d.avgWater * 0.85 ? "#10b981" : "#0ea5e9"} />
                ))}
              </Bar>
              <Bar dataKey="avgWater" name="Kampüs Ort." fill="#334155" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🔥 Doğalgaz Tüketimi (m³) + 🌿 CO₂ (ton)">
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ay" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="Doğalgaz" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5, fill: "#f59e0b" }} />
              <Line yAxisId="right" type="monotone" dataKey="CO2" stroke="#10b981" strokeWidth={2} dot={{ r: 5, fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🌿 CO₂ Kaynağı Dağılımı (ton)">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={co2Breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}t`}>
                {co2Breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Anomali Detay Tablosu */}
      <ChartCard title="📋 Aylık Anomali Analizi">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Ay","Elektrik (kWh)","Durum","Su (m³)","Durum","Doğalgaz (m³)","Durum"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => (
                <tr key={m} style={{ borderBottom: "1px solid #0f172a" }}>
                  <td style={{ padding: "10px 12px", color: "#f1f5f9", fontWeight: 600 }}>{m}</td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{faculty.electric[i].toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "10px 12px" }}><AnomalyTag value={faculty.electric[i]} avg={avgElectric[i]} /></td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{faculty.water[i].toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "10px 12px" }}><AnomalyTag value={faculty.water[i]} avg={avgWater[i]} /></td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>{faculty.gas[i].toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "10px 12px" }}><AnomalyTag value={faculty.gas[i]} avg={avgGas[i]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

// ── 3C. Liderlik Tablosu ───────────────────────
function LeaderboardTab() {
  const [sortBy, setSortBy] = useState("co2");

  const rows = FACULTIES.map((f, idx) => {
    const s = computeStats(f);
    return { ...f, ...s };
  }).sort((a, b) => {
    if (sortBy === "co2") return parseFloat(a.co2) - parseFloat(b.co2);
    if (sortBy === "electric") return a.totalElectric - b.totalElectric;
    if (sortBy === "water") return a.totalWater - b.totalWater;
    if (sortBy === "gas") return a.totalGas - b.totalGas;
    return parseFloat(a.co2) - parseFloat(b.co2);
  });

  const medalTypes = ["gold", "silver", "bronze"];

  const barData = FACULTIES.map(f => ({ name: f.shortName, CO2: parseFloat(computeStats(f).co2), color: f.color }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 800 }}>🏆 Fakülte Liderlik Tablosu</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>En az tüketen = En yeşil fakülte</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 12 }}>Sırala:</span>
          {[
            { key: "co2", label: "🌿 CO₂" },
            { key: "electric", label: "⚡ Elektrik" },
            { key: "water", label: "💧 Su" },
            { key: "gas", label: "🔥 Gaz" },
          ].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: sortBy === s.key ? "#3b82f6" : "rgba(255,255,255,0.06)",
              color: sortBy === s.key ? "#fff" : "#94a3b8",
              transition: "all 0.2s",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Podium Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {rows.slice(0, 3).map((f, i) => (
          <div key={f.id} style={{
            background: i === 0
              ? "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))"
              : i === 1
              ? "linear-gradient(135deg,rgba(148,163,184,0.12),rgba(148,163,184,0.04))"
              : "linear-gradient(135deg,rgba(180,83,9,0.12),rgba(180,83,9,0.04))",
            border: `1px solid ${i === 0 ? "#f59e0b55" : i === 1 ? "#94a3b844" : "#b4530944"}`,
            borderRadius: 16, padding: 20, textAlign: "center",
          }}>
            <div style={{ fontSize: 48 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
            <div style={{ fontSize: 28 }}>{f.emoji}</div>
            <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16, marginTop: 8 }}>{f.name}</div>
            <div style={{ color: "#10b981", fontWeight: 700, fontSize: 22, margin: "8px 0" }}>{f.co2} ton CO₂</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              <Badge type={medalTypes[i]} />
              {f.id === waterChampionId && <Badge type="water" />}
              {f.anomaly && <Badge type="anomaly" />}
            </div>
          </div>
        ))}
      </div>

      {/* Tam Sıralama Tablosu */}
      <ChartCard title="📋 Tam Sıralama">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Sıra","Fakülte","Elektrik (MWh)","Su (m³)","Doğalgaz (m³)","CO₂ (ton)","Bütçe (₺)","Durum"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((f, i) => (
                <tr key={f.id} style={{
                  borderBottom: "1px solid #0f172a",
                  background: f.anomaly ? "rgba(239,68,68,0.04)" : f.champion ? "rgba(16,185,129,0.04)" : "transparent",
                }}>
                  <td style={{ padding: "12px", color: "#94a3b8", fontWeight: 700, fontSize: 18 }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{f.emoji}</span>
                      <div>
                        <div style={{ color: "#f1f5f9", fontWeight: 600 }}>{f.name}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                          {f.champion && <Badge type="gold" />}
                          {f.id === waterChampionId && <Badge type="water" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>{(f.totalElectric/1000).toFixed(1)}</td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>{f.totalWater.toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>{f.totalGas.toLocaleString("tr-TR")}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ color: f.anomaly ? "#ef4444" : "#10b981", fontWeight: 700 }}>{f.co2}</span>
                  </td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>{f.budget.toLocaleString("tr-TR")} ₺</td>
                  <td style={{ padding: "12px" }}>
                    {f.anomaly
                      ? <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>⚠️ Anomali</span>
                      : f.champion
                      ? <span style={{ color: "#10b981", fontWeight: 700, fontSize: 12 }}>✅ Şampiyon</span>
                      : <span style={{ color: "#64748b", fontSize: 12 }}>Normal</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* CO2 Bar Karşılaştırması */}
      <ChartCard title="🌿 Fakülte CO₂ Karşılaştırması (3 Aylık Toplam, ton)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} width={40} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9" }} formatter={(v) => [`${v} ton CO₂`]} />
            <Bar dataKey="CO2" radius={[0,6,6,0]}>
              {barData.map((e, i) => <Cell key={i} fill={FACULTIES.find(f=>f.shortName===e.name)?.anomaly ? "#ef4444" : FACULTIES.find(f=>f.shortName===e.name)?.champion ? "#10b981" : e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── 3D. SKA ve Öneriler ────────────────────────
function SDGTab() {
  const goals = [
    {
      id: 7, icon: "☀️", title: "SKA 7 – Erişilebilir ve Temiz Enerji",
      desc: "Enerji verimliliğini iki katına çıkarma ve yenilenebilir enerji payını artırma hedefi.",
      progress: 62,
      color: "#f59e0b",
    },
    {
      id: 11, icon: "🏙️", title: "SKA 11 – Sürdürülebilir Şehirler ve Topluluklar",
      desc: "Kampüs kaynak yönetiminin dijitalleştirilmesi ile sürdürülebilir yerleşke hedefi.",
      progress: 74,
      color: "#3b82f6",
    },
    {
      id: 13, icon: "🌍", title: "SKA 13 – İklim Eylemi",
      desc: "CO₂ emisyonlarının azaltılması ve karbon nötr kampüs vizyonuna ilerleme.",
      progress: 48,
      color: "#10b981",
    },
  ];

  // Kural tabanlı akıllı öneriler
  const recommendations = useMemo(() => {
    const recs = [];
    const muh = FACULTIES.find(f => f.id === "muh");
    const tek = FACULTIES.find(f => f.id === "teknoloji");
    const fenS = computeStats(FACULTIES.find(f => f.id === "fen"));

    recs.push({
      icon: "⚡",
      severity: "high",
      title: "Mühendislik Fakültesi Elektrik Anomalisi",
      text: `Mühendislik Fakültesi'nin aylık ortalama elektrik tüketimi (${Math.round(muh.electric.reduce((a,b)=>a+b,0)/3).toLocaleString("tr-TR")} kWh) kampüs ortalamasının %${Math.round((muh.electric.reduce((a,b)=>a+b,0)/3 / (avgElectric.reduce((a,b)=>a+b,0)/3) - 1)*100)} üzerinde. Laboratuvar ekipmanlarının bekleme (standby) modunu devre dışı bırakması ve LED aydınlatmaya geçiş planlanmalıdır.`,
    });
    recs.push({
      icon: "💧",
      severity: "high",
      title: "Teknoloji Fakültesi Aşırı Su Tüketimi",
      text: `Teknoloji Fakültesi su tüketimi (Şubat: ${tek.water[1].toLocaleString("tr-TR")} m³) kampüs ortalamasının çok üzerinde. Olası boru sızıntısı veya klima soğutma sisteminde aksaklık incelenmelidir. Su akış sensörü kurulumu acilen önerilir.`,
    });
    recs.push({
      icon: "🌿",
      severity: "success",
      title: "Fen Edebiyat Fakültesi İyi Uygulama Modeli",
      text: `Fen Edebiyat Fakültesi 3 aylık toplamda yalnızca ${fenS.co2} ton CO₂ emisyonu üretmiştir. Bu binanın enerji yönetimi pratikleri (doğal aydınlatma kullanımı, ısı yalıtımı) diğer fakültelere örnek olarak sunulmalıdır.`,
    });
    recs.push({
      icon: "🔥",
      severity: "medium",
      title: "Doğalgaz Tüketiminde Kış Mevsimi Optimizasyonu",
      text: "Ocak–Şubat doğalgaz tüketimi kampüs genelinde Mart'a göre ortalama %15 yüksek. Binalarda termostat programlaması (gece 18°C / gündüz 21°C) ve çift cam yalıtımı uygulanarak tahminen yıllık 45.000 ₺ tasarruf sağlanabilir.",
    });
    recs.push({
      icon: "☀️",
      severity: "medium",
      title: "Güneş Enerjisi Potansiyeli – SKA 7",
      text: "Afyonkarahisar'ın yıllık güneş saati (2.700 saat/yıl) çatı güneş paneli kurulumu için elverişlidir. 500 kWp'lik bir sistem ile yıllık kampüs elektrik tüketiminin ~%18'i yenilenebilir enerjiden karşılanabilir.",
    });
    recs.push({
      icon: "📊",
      severity: "info",
      title: "Veri Görünürlüğü – Davranışsal Etki",
      text: "Darby (2006) araştırmasına göre, tüketim verilerinin görsel olarak sunulması kullanıcı tasarrufunu %5–15 artırır. Bu dashboard'un öğrenci ve personele açık bir ekranda yayınlanması önerilir (lobi ekranı, QR kod).",
    });
    return recs;
  }, []);

  const severityConfig = {
    high: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", label: "⚠️ Yüksek Öncelik" },
    success: { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", label: "✅ İyi Uygulama" },
    medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "🔶 Orta Öncelik" },
    info: { color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", label: "ℹ️ Bilgi" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* SKA İlerleme Barları */}
      <div>
        <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🎯 Sürdürülebilir Kalkınma Amaçları (SKA) İlerlemesi</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {goals.map(g => (
            <div key={g.id} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 32 }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{g.title}</div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{g.desc}</div>
                </div>
                <div style={{ color: g.color, fontWeight: 800, fontSize: 22 }}>{g.progress}%</div>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{
                  width: `${g.progress}%`, height: "100%",
                  background: `linear-gradient(90deg, ${g.color}99, ${g.color})`,
                  borderRadius: 8, transition: "width 1s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "#475569", fontSize: 11 }}>Mevcut Durum</span>
                <span style={{ color: "#475569", fontSize: 11 }}>Hedef: 100%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Akıllı Öneriler */}
      <div>
        <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🤖 Sistem Önerileri (Kural Tabanlı Analiz)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recommendations.map((r, i) => {
            const sc = severityConfig[r.severity];
            return (
              <div key={i} style={{
                background: sc.bg, border: `1px solid ${sc.border}`,
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                      <span style={{ color: sc.color, fontSize: 11, fontWeight: 700, background: `${sc.border}`, borderRadius: 10, padding: "2px 10px" }}>{sc.label}</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{r.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anket Bulgular Özeti */}
      <ChartCard title="📋 İhtiyaç Analizi Anket Sonuçları (n=5, 5'li Likert)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 4 }}>
          {[
            { label: "Enerji tüketimi yeterince takip edilmiyor", avg: 4.0 },
            { label: "Merkezi sistem toplanması gerekli", avg: 4.6 },
            { label: "Görselleştirme anlaşılabilirliği artırır", avg: 4.8 },
            { label: "Sürdürülebilirlik farkındalığı yeterli", avg: 3.6 },
            { label: "Şeffaflık tasarruf davranışını artırır", avg: 4.6 },
            { label: "Dijital sistemlere ihtiyaç var", avg: 4.8 },
            { label: "Görsel raporlar karar almayı kolaylaştırır", avg: 4.6 },
            { label: "Analiz sistemi kurulmalıdır", avg: 4.8 },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.4, marginBottom: 8 }}>{item.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, background: "#1e293b", borderRadius: 6, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${(item.avg / 5) * 100}%`, height: "100%", background: item.avg >= 4.5 ? "#10b981" : item.avg >= 4.0 ? "#3b82f6" : "#f59e0b", borderRadius: 6 }} />
                </div>
                <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 15, minWidth: 28 }}>{item.avg}</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

// ── ChartCard wrapper ──────────────────────────
function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: 20,
    }}>
      <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. ANA UYGULAMA
// ─────────────────────────────────────────────
const TABS = [
  { id: "home", label: "🏠 Ana Sayfa", component: HomeTab },
  { id: "faculty", label: "🏫 Fakülte Analizi", component: FacultyTab },
  { id: "leaderboard", label: "🏆 Liderlik Tablosu", component: LeaderboardTab },
  { id: "sdg", label: "🎯 SKA & Öneriler", component: SDGTab },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || HomeTab;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020817 0%, #0a0f1e 50%, #030b14 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(59,130,246,0.15)",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Logo Satırı */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg, #10b981, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>🌿</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  Yeşil Kampüs
                  <span style={{ color: "#3b82f6" }}> Dashboard</span>
                </div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
                  Afyon Kocatepe Üniversitesi · Enerji Takip Sistemi · 2025
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#10b981", fontWeight: 600,
              }}>🟢 Canlı Simülasyon</div>
              <div style={{
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#3b82f6", fontWeight: 600,
              }}>📅 Oca–Mar 2025</div>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 4, paddingBottom: 1 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === t.id ? 700 : 500,
                  color: activeTab === t.id ? "#3b82f6" : "#64748b",
                  borderBottom: `2px solid ${activeTab === t.id ? "#3b82f6" : "transparent"}`,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
        <ActiveComponent />
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 24px",
        textAlign: "center",
        color: "#334155",
        fontSize: 12,
      }}>
        Süeda Çetin & Belinay Aydın · Yönetim Bilişim Sistemleri Bölümü · Afyon Kocatepe Üniversitesi · YBS Güncel Konular Bitirme Projesi 2025
        <br />
        Veriler simüle edilmiştir. Emisyon katsayıları: Elektrik 0,49 kg CO₂/kWh · Su 0,344 kg CO₂/m³ · Doğalgaz 2,04 kg CO₂/m³
      </div>
    </div>
  );
}
