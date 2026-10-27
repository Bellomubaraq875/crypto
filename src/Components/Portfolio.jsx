import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../chartconfig.js";
import { Doughnut } from "react-chartjs-2";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useMarkets } from "../hooks/useMarkets";
import { money, number } from "../utils/format";
import { Change, CoinLabel, EmptyState, Skeleton } from "./ui";
import AddAssetModal from "./AddAssetModal";

const palette = ["#6c7bff", "#16c784", "#f7931a", "#e84393", "#26c6da", "#ffb020", "#9b6bff", "#ff6b6b"];

const Portfolio = () => {
  const { holdings, removeHolding } = useApp();
  const { coins, isLoading } = useMarkets({ vs: "usd", poll: 60000 });
  const [adding, setAdding] = useState(false);

  const rows = useMemo(
    () =>
      holdings.map((h) => {
        const live = coins.find((c) => c.id === h.id);
        const price = live?.current_price ?? h.buyPrice;
        const value = h.amount * price;
        const cost = h.amount * h.buyPrice;
        const pct24 = live?.price_change_percentage_24h ?? 0;
        return { ...h, live, stale: !live, price, value, cost, pnl: value - cost, pnlPct: cost ? ((value - cost) / cost) * 100 : 0, day: value - value / (1 + pct24 / 100) };
      }),
    [holdings, coins]
  );

  const totals = rows.reduce((t, r) => ({ value: t.value + r.value, cost: t.cost + r.cost, day: t.day + r.day }), { value: 0, cost: 0, day: 0 });
  const pnl = totals.value - totals.cost;
  const pnlPct = totals.cost ? (pnl / totals.cost) * 100 : 0;
  const dayPct = totals.value - totals.day ? (totals.day / (totals.value - totals.day)) * 100 : 0;

  const allocation = useMemo(() => {
    const byCoin = {};
    rows.forEach((r) => (byCoin[r.symbol] = (byCoin[r.symbol] ?? 0) + r.value));
    return Object.entries(byCoin).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <div className="stack">
      <div className="page-title">
        <div>
          <h1>Portfolio</h1>
          <p className="muted">Everything is stored on this device and valued in USD at live prices.</p>
        </div>
        <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add asset</button>
      </div>

      {holdings.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="Start your portfolio"
            message="Add the coins you hold with the price you paid and we'll track value, profit and allocation for you."
            action={<button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add your first asset</button>}
          />
        </div>
      ) : (
        <>
          <section className="grid-hero">
            <div className="card hero-card">
              <p className="muted">Total balance</p>
              {isLoading ? <Skeleton w="50%" h={52} r={12} style={{ margin: "10px 0" }} /> : <h1 className="num hero-balance">{money(totals.value, "usd")}</h1>}
              <div className="hero-meta">
                <div>
                  <span className="muted small">Total profit / loss</span>
                  <strong className={`num ${pnl >= 0 ? "up" : "down"}`}>{pnl >= 0 ? "+" : "−"}{money(Math.abs(pnl), "usd")}</strong>
                  <Change value={pnlPct} />
                </div>
                <div>
                  <span className="muted small">Past 24 hours</span>
                  <strong className={`num ${totals.day >= 0 ? "up" : "down"}`}>{totals.day >= 0 ? "+" : "−"}{money(Math.abs(totals.day), "usd")}</strong>
                  <Change value={dayPct} />
                </div>
                <div>
                  <span className="muted small">Amount invested</span>
                  <strong className="num">{money(totals.cost, "usd")}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Allocation</h3>
              <div className="alloc">
                <div className="donut">
                  <Doughnut
                    data={{ labels: allocation.map(([s]) => s.toUpperCase()), datasets: [{ data: allocation.map(([, v]) => v), backgroundColor: allocation.map((_, i) => palette[i % palette.length]), borderWidth: 0, hoverOffset: 4 }] }}
                    options={{ cutout: "72%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (i) => ` ${i.label}  ${money(i.parsed, "usd")}` } } } }}
                  />
                </div>
                <ul className="alloc-list">
                  {allocation.slice(0, 6).map(([s, v], i) => (
                    <li key={s}>
                      <i style={{ background: palette[i % palette.length] }} />
                      <span>{s.toUpperCase()}</span>
                      <span className="num muted">{totals.value ? ((v / totals.value) * 100).toFixed(1) : 0}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="card flush table-scroll">
            <table className="market-table">
              <thead>
                <tr>
                  <th className="left">Asset</th>
                  <th className="right">Price</th>
                  <th className="right hide-sm">Holdings</th>
                  <th className="right hide-sm">Buy price</th>
                  <th className="right">Value</th>
                  <th className="right">Profit / loss</th>
                  <th aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid}>
                    <td><Link to={`/crypto/${r.id}`}><CoinLabel image={r.image} name={r.name} symbol={r.symbol} /></Link></td>
                    <td className="right num">{r.stale ? <span className="muted" title="Live price unavailable, showing your buy price">{money(r.price, "usd")}*</span> : money(r.price, "usd")}</td>
                    <td className="right num hide-sm">{number(r.amount)} {r.symbol.toUpperCase()}</td>
                    <td className="right num hide-sm">{money(r.buyPrice, "usd")}</td>
                    <td className="right num strong">{money(r.value, "usd")}</td>
                    <td className="right">
                      <span className={`num block ${r.pnl >= 0 ? "up" : "down"}`}>{r.pnl >= 0 ? "+" : "−"}{money(Math.abs(r.pnl), "usd")}</span>
                      <Change value={r.pnlPct} />
                    </td>
                    <td className="right">
                      <button className="icon-btn" aria-label={`Remove ${r.name}`} onClick={() => removeHolding(r.uid)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.some((r) => r.stale) && <p className="muted small">* Not in the top 100, so the live price isn't available. Your buy price is shown instead.</p>}
        </>
      )}

      {adding && <AddAssetModal onClose={() => setAdding(false)} />}
    </div>
  );
};

export default Portfolio;
