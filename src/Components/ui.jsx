import { memo, useId } from "react";
import { ArrowDownRight, ArrowUpRight, Star, AlertTriangle } from "lucide-react";
import { percent } from "../utils/format";

/* 7-day sparkline, drawn as SVG so 100 rows stay cheap */
export const Sparkline = memo(function Sparkline({ data, up, width = 120, height = 36 }) {
  const id = useId();
  if (!Array.isArray(data) || data.length < 2) return <div style={{ width, height }} />;
  const step = Math.max(1, Math.floor(data.length / 42));
  const pts = data.filter((_, i) => i % step === 0);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const coords = pts.map((v, i) => [
    (i / (pts.length - 1)) * width,
    height - 3 - ((v - min) / span) * (height - 6),
  ]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
});

/* +2.31% / -1.04% pill */
export const Change = ({ value, pill = false, digits = 2 }) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return <span className="muted">—</span>;
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`change ${up ? "up" : "down"} ${pill ? "pill" : ""}`}>
      <Icon size={14} strokeWidth={2.4} />
      {percent(value, digits)}
    </span>
  );
};

export const CoinLabel = ({ image, name, symbol, size = 32 }) => (
  <span className="coin-label">
    {image ? <img src={image} alt="" width={size} height={size} loading="lazy" /> : <span className="coin-fallback" style={{ width: size, height: size }} />}
    <span className="coin-label-text">
      <strong>{name}</strong>
      {symbol && <small>{symbol.toUpperCase()}</small>}
    </span>
  </span>
);

export const StarButton = ({ active, onClick, label }) => (
  <button
    type="button"
    className={`star-btn ${active ? "active" : ""}`}
    aria-pressed={active}
    aria-label={label}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
  >
    <Star size={18} fill={active ? "currentColor" : "none"} />
  </button>
);

export const Skeleton = ({ w = "100%", h = 16, r = 8, style }) => (
  <span className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

export const SkeletonRows = ({ rows = 8 }) => (
  <div className="skeleton-rows">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-row">
        <Skeleton w={32} h={32} r={16} />
        <Skeleton w="22%" />
        <Skeleton w="12%" />
        <Skeleton w="10%" />
        <Skeleton w="14%" style={{ marginLeft: "auto" }} />
      </div>
    ))}
  </div>
);

export const ErrorState = ({ title = "Couldn't load data", message, onRetry }) => (
  <div className="state-box">
    <AlertTriangle size={28} />
    <h3>{title}</h3>
    <p>{message ?? "The market data service didn't respond. It may be rate-limiting requests — wait a few seconds and try again."}</p>
    {onRetry && (
      <button className="btn" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="state-box">
    {Icon && <Icon size={28} />}
    <h3>{title}</h3>
    <p>{message}</p>
    {action}
  </div>
);

export const SectionHead = ({ title, sub, action }) => (
  <div className="section-head">
    <div>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
    {action}
  </div>
);
