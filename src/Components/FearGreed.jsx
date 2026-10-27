import { useGetFearGreedQuery } from "../Services/coinGeckoApi";
import { Skeleton } from "./ui";

const zones = [
  { to: 25, color: "#ea3943", label: "Extreme fear" },
  { to: 45, color: "#f0883e", label: "Fear" },
  { to: 55, color: "#c9b327", label: "Neutral" },
  { to: 75, color: "#7ac943", label: "Greed" },
  { to: 100, color: "#16c784", label: "Extreme greed" },
];

const polar = (cx, cy, r, deg) => {
  const a = (Math.PI * (180 - deg)) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
};

const arc = (from, to, r = 80) => {
  const [x1, y1] = polar(100, 100, r, (from / 100) * 180);
  const [x2, y2] = polar(100, 100, r, (to / 100) * 180);
  return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
};

const FearGreed = () => {
  const { data, isLoading, isError } = useGetFearGreedQuery();

  if (isLoading) return <Skeleton h={120} r={12} />;
  if (isError || !data) return <p className="muted small">Sentiment index unavailable right now.</p>;

  const value = Number(data.value);
  const [nx, ny] = polar(100, 100, 66, (value / 100) * 180);
  const zone = zones.find((z) => value <= z.to) ?? zones[zones.length - 1];

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 112" role="img" aria-label={`Fear and greed index ${value}, ${data.value_classification}`}>
        {zones.map((z, i) => (
          <path
            key={z.label}
            d={arc(i === 0 ? 0.8 : zones[i - 1].to + 0.8, z.to - 0.8)}
            stroke={z.color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            opacity={z === zone ? 1 : 0.28}
          />
        ))}
        <line x1="100" y1="100" x2={nx} y2={ny} stroke="var(--text)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="var(--text)" />
      </svg>
      <div className="gauge-read">
        <strong style={{ color: zone.color }}>{value}</strong>
        <span>{data.value_classification}</span>
      </div>
    </div>
  );
};

export default FearGreed;
