import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HTMLReactParser from "html-react-parser";
import { ArrowLeft, ExternalLink, Plus } from "lucide-react";
import { useGetCryptoDetailsQuery, useGetCryptoHistoryQuery } from "../Services/coinGeckoApi";
import { useApp } from "../context/AppContext";
import { money, number, compact, percent } from "../utils/format";
import { Change, ErrorState, Skeleton, StarButton } from "./ui";
import PriceChart from "./PriceChart";
import AddAssetModal from "./AddAssetModal";

const periods = [
  { label: "24H", value: "1" },
  { label: "7D", value: "7" },
  { label: "1M", value: "30" },
  { label: "3M", value: "90" },
  { label: "1Y", value: "365" },
];

const Stat = ({ label, value, sub }) => (
  <div className="stat">
    <span className="muted small">{label}</span>
    <strong className="num">{value}</strong>
    {sub && <span className="small muted">{sub}</span>}
  </div>
);

const CryptoDetails = () => {
  const { coinId } = useParams();
  const { currency: vs, watchlist, toggleWatch } = useApp();
  const [days, setDays] = useState("7");
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState("1");

  const { data: coin, isLoading, isError, refetch } = useGetCryptoDetailsQuery(coinId, { pollingInterval: 60000 });
  const { data: history, isFetching: historyFetching, isError: historyError } = useGetCryptoHistoryQuery({ coinId, timeperiod: days, vs });

  const periodChange = useMemo(() => {
    const p = history?.prices;
    if (!p || p.length < 2) return null;
    return ((p[p.length - 1][1] - p[0][1]) / p[0][1]) * 100;
  }, [history]);

  if (isError) return <ErrorState title="Couldn't load this coin" message="It may not exist, or the market data service is rate-limiting requests. Try again in a few seconds." onRetry={refetch} />;

  if (isLoading || !coin) {
    return (
      <div className="stack">
        <Skeleton w={220} h={40} />
        <Skeleton h={380} r={16} />
        <Skeleton h={200} r={16} />
      </div>
    );
  }

  const m = coin.market_data ?? {};
  const price = m.current_price?.[vs];
  const low = m.low_24h?.[vs];
  const high = m.high_24h?.[vs];
  const rangePos = low != null && high != null && high > low ? Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100)) : null;
  const supplyMax = m.max_supply || m.total_supply;
  const supplyPct = supplyMax && m.circulating_supply ? Math.min(100, (m.circulating_supply / supplyMax) * 100) : null;
  const watching = watchlist.includes(coin.id);
  const desc = coin.description?.en;
  const links = [
    ["Website", coin.links?.homepage?.find(Boolean)],
    ["Explorer", coin.links?.blockchain_site?.find(Boolean)],
    ["Reddit", coin.links?.subreddit_url],
    ["GitHub", coin.links?.repos_url?.github?.find(Boolean)],
    ["X / Twitter", coin.links?.twitter_screen_name ? `https://x.com/${coin.links.twitter_screen_name}` : null],
  ].filter(([, url]) => url);

  const perf = [
    ["1h", m.price_change_percentage_1h_in_currency?.[vs]],
    ["24h", m.price_change_percentage_24h_in_currency?.[vs]],
    ["7d", m.price_change_percentage_7d_in_currency?.[vs]],
    ["30d", m.price_change_percentage_30d_in_currency?.[vs]],
    ["1y", m.price_change_percentage_1y_in_currency?.[vs]],
  ];

  return (
    <div className="stack">
      <Link to="/cryptocurrencies" className="back-link"><ArrowLeft size={16} /> Markets</Link>

      <header className="coin-head">
        <div className="coin-id">
          <img src={coin.image?.large} alt="" width="52" height="52" />
          <div>
            <h1>{coin.name} <span className="sym">{coin.symbol?.toUpperCase()}</span></h1>
            <div className="chips">
              {coin.market_cap_rank && <span className="chip strong">Rank #{coin.market_cap_rank}</span>}
              {coin.categories?.slice(0, 2).map((c) => <span className="chip" key={c}>{c}</span>)}
            </div>
          </div>
        </div>
        <div className="coin-actions">
          <StarButton active={watching} label={watching ? "Remove from watchlist" : "Add to watchlist"} onClick={() => toggleWatch(coin.id, coin.name)} />
          <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add to portfolio</button>
        </div>
      </header>

      <div className="detail-grid">
        <section className="card chart-card">
          <div className="price-head">
            <div>
              <h2 className="big-price num">{money(price, vs)}</h2>
              <div className="price-sub">
                <Change value={m.price_change_percentage_24h_in_currency?.[vs]} pill />
                <span className="muted small">24h</span>
              </div>
            </div>
            <div className="seg" role="tablist" aria-label="Chart period">
              {periods.map((p) => (
                <button key={p.value} role="tab" aria-selected={days === p.value} className={days === p.value ? "on" : ""} onClick={() => setDays(p.value)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {periodChange != null && (
            <p className="muted small period-line">
              Over this period: <Change value={periodChange} />
            </p>
          )}
          <div className={historyFetching ? "dim" : ""}>
            {history ? <PriceChart history={history} vs={vs} days={days} /> : historyError ? <p className="muted pad">Price history isn't available right now. Try again shortly.</p> : <Skeleton h={320} r={12} />}
          </div>
        </section>

        <aside className="stack-sm">
          <div className="card">
            <h3 className="card-title">Price calculator</h3>
            <label className="field-block">
              <span>{coin.symbol?.toUpperCase()}</span>
              <input type="number" step="any" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
            </label>
            <div className="calc-result">
              <span className="muted small">Worth</span>
              <strong className="num">{money((Number(qty) || 0) * (price ?? 0), vs)}</strong>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Performance</h3>
            <div className="perf">
              {perf.map(([label, v]) => (
                <div key={label}>
                  <span className="muted small">{label}</span>
                  <Change value={v} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="card">
        <h3 className="card-title">Market statistics</h3>
        <div className="stat-grid">
          <Stat label="Market cap" value={money(m.market_cap?.[vs], vs, { compact: true })} />
          <Stat label="Fully diluted value" value={money(m.fully_diluted_valuation?.[vs], vs, { compact: true })} />
          <Stat label="24h volume" value={money(m.total_volume?.[vs], vs, { compact: true })} />
          <Stat label="Volume / market cap" value={m.market_cap?.[vs] ? percent((m.total_volume?.[vs] / m.market_cap[vs]) * 100) : "—"} />
        </div>

        <div className="meters">
          <div className="meter">
            <div className="meter-top small">
              <span className="muted">24h range</span>
              <span className="num">{money(low, vs)} – {money(high, vs)}</span>
            </div>
            <div className="range-bar">
              <span className="range-fill" />
              {rangePos != null && <i style={{ left: `${rangePos}%` }} aria-label={`Price is at ${rangePos.toFixed(0)}% of today's range`} />}
            </div>
          </div>
          <div className="meter">
            <div className="meter-top small">
              <span className="muted">Circulating supply</span>
              <span className="num">{number(m.circulating_supply, 0)} {coin.symbol?.toUpperCase()}</span>
            </div>
            <div className="range-bar solid">
              <span style={{ width: `${supplyPct ?? 0}%` }} />
            </div>
            <div className="meter-top small">
              <span className="muted">{supplyPct != null ? `${supplyPct.toFixed(0)}% of ${m.max_supply ? "max" : "total"} supply` : "Max supply not capped"}</span>
              <span className="num muted">{supplyMax ? compact(supplyMax) : "∞"}</span>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <Stat label="All-time high" value={money(m.ath?.[vs], vs)} sub={m.ath_date?.[vs] ? `${percent(m.ath_change_percentage?.[vs], 1)} below · ${new Date(m.ath_date[vs]).toLocaleDateString()}` : null} />
          <Stat label="All-time low" value={money(m.atl?.[vs], vs)} sub={m.atl_date?.[vs] ? `${percent(m.atl_change_percentage?.[vs], 0)} above · ${new Date(m.atl_date[vs]).toLocaleDateString()}` : null} />
          <Stat label="Total supply" value={m.total_supply ? compact(m.total_supply) : "—"} />
          <Stat label="Max supply" value={m.max_supply ? compact(m.max_supply) : "No cap"} />
        </div>
      </section>

      <section className="detail-about">
        <div className="card">
          <h3 className="card-title">About {coin.name}</h3>
          {desc ? <div className="prose">{HTMLReactParser(desc)}</div> : <p className="muted">No description is available for this coin yet.</p>}
        </div>
        <div className="card">
          <h3 className="card-title">Links</h3>
          {links.length === 0 && <p className="muted">No official links listed.</p>}
          <div className="link-list">
            {links.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">
                <span>{label}</span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {adding && (
        <AddAssetModal
          coin={{ id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image?.large, price: m.current_price?.usd }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
};

export default CryptoDetails;
