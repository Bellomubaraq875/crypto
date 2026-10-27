import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useMarkets } from "../hooks/useMarkets";
import { useGetFxRatesQuery } from "../Services/coinGeckoApi";
import { number } from "../utils/format";
import { Skeleton } from "./ui";

const FIAT = [
  { key: "fiat:usd", code: "usd", symbol: "USD", name: "US Dollar" },
  { key: "fiat:ngn", code: "ngn", symbol: "NGN", name: "Nigerian Naira" },
  { key: "fiat:eur", code: "eur", symbol: "EUR", name: "Euro" },
  { key: "fiat:gbp", code: "gbp", symbol: "GBP", name: "British Pound" },
];

const Converter = () => {
  const { coins, isLoading } = useMarkets({ vs: "usd" });
  const { data: fx } = useGetFxRatesQuery();
  const [from, setFrom] = useState("coin:bitcoin");
  const [to, setTo] = useState("fiat:usd");
  const [amount, setAmount] = useState("1");

  // value of one unit of an asset, in USD
  const usdValue = useMemo(() => {
    const map = {};
    FIAT.forEach((f) => { if (fx?.[f.code]) map[f.key] = 1 / fx[f.code]; });
    coins.forEach((c) => (map[`coin:${c.id}`] = c.current_price));
    return map;
  }, [coins, fx]);

  const label = (key) => {
    if (key.startsWith("fiat:")) return FIAT.find((f) => f.key === key)?.symbol ?? "";
    return coins.find((c) => `coin:${c.id}` === key)?.symbol?.toUpperCase() ?? "";
  };
  const logo = (key) => coins.find((c) => `coin:${c.id}` === key)?.image;

  const rate = usdValue[from] && usdValue[to] ? usdValue[from] / usdValue[to] : null;
  const result = rate != null ? (Number(amount) || 0) * rate : null;
  const fmt = (n) => number(n, n >= 1 ? 4 : 8);

  const Picker = ({ value, onChange, ariaLabel }) => (
    <div className="asset-pick">
      {logo(value) ? <img src={logo(value)} alt="" width="26" height="26" /> : <span className="fiat-badge">{label(value)?.slice(0, 1)}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel}>
        <optgroup label="Currencies">
          {FIAT.map((f) => <option key={f.key} value={f.key}>{f.symbol} · {f.name}</option>)}
        </optgroup>
        <optgroup label="Crypto">
          {coins.map((c) => <option key={c.id} value={`coin:${c.id}`}>{c.symbol.toUpperCase()} · {c.name}</option>)}
        </optgroup>
      </select>
    </div>
  );

  const swap = () => { setFrom(to); setTo(from); };
  const quick = [["coin:bitcoin", "fiat:usd"], ["coin:ethereum", "fiat:ngn"], ["coin:solana", "fiat:usd"], ["fiat:usd", "coin:bitcoin"]];

  return (
    <div className="stack narrow">
      <div className="page-title">
        <div>
          <h1>Convert</h1>
          <p className="muted">Check what any coin is worth in another coin or currency, at today's market rate.</p>
        </div>
      </div>

      <div className="card convert-card">
        {isLoading ? (
          <Skeleton h={220} r={14} />
        ) : (
          <>
            <div className="convert-box">
              <span className="muted small">You have</span>
              <div className="convert-row">
                <input type="number" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount to convert" />
                <Picker value={from} onChange={setFrom} ariaLabel="Convert from" />
              </div>
            </div>

            <button className="swap-btn" onClick={swap} aria-label="Swap assets"><ArrowDownUp size={18} /></button>

            <div className="convert-box">
              <span className="muted small">You get</span>
              <div className="convert-row">
                <output className="num">{result != null ? fmt(result) : "—"}</output>
                <Picker value={to} onChange={setTo} ariaLabel="Convert to" />
              </div>
            </div>

            <p className="convert-rate num">
              {rate != null ? `1 ${label(from)} = ${fmt(rate)} ${label(to)}` : "Rate unavailable right now."}
            </p>
          </>
        )}
      </div>

      <div className="chips">
        {quick.map(([a, b]) => (
          <button key={a + b} className="chip btn-chip" onClick={() => { setFrom(a); setTo(b); }}>
            {label(a)} → {label(b)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Converter;
