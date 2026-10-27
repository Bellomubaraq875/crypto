import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Flame, Star } from "lucide-react";
import { useGetGlobalQuery, useGetTrendingQuery } from "../Services/coinGeckoApi";
import { useMarkets } from "../hooks/useMarkets";
import { useApp } from "../context/AppContext";
import { money, percent } from "../utils/format";
import { Change, CoinLabel, Skeleton, Sparkline, SectionHead, EmptyState, ErrorState } from "./ui";
import FearGreed from "./FearGreed";
import { MarketsTable } from "./Cryptocurrencies";
import News from "./News";

const MoverRow = ({ coin, vs, rank }) => (
  <Link to={`/crypto/${coin.id}`} className="mover-row">
    {rank && <span className="rank">{rank}</span>}
    <CoinLabel image={coin.image} name={coin.name} symbol={coin.symbol} size={30} />
    <span className="num grow-end">{money(coin.current_price, vs)}</span>
    <Change value={coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h} pill />
  </Link>
);

const Homepage = () => {
  const { watchlist } = useApp();
  const { coins, vs, isLoading, isError, refetch } = useMarkets({ poll: 60000 });
  const { data: global, isLoading: globalLoading } = useGetGlobalQuery();
  const { data: trending = [] } = useGetTrendingQuery();
  const [tab, setTab] = useState("trending");

  const lists = useMemo(() => {
    const byChange = [...coins]
      .filter((c) => c.price_change_percentage_24h != null)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    const trendCoins = trending
      .map((t) => coins.find((c) => c.id === t.id) ?? null)
      .filter(Boolean);
    return {
      trending: trendCoins.length ? trendCoins : coins.slice(0, 6),
      gainers: byChange.slice(0, 6),
      losers: byChange.slice(-6).reverse(),
    };
  }, [coins, trending]);

  const watched = coins.filter((c) => watchlist.includes(c.id));
  const cap = global?.total_market_cap?.[vs];
  const vol = global?.total_volume?.[vs];
  const capChange = global?.market_cap_change_percentage_24h_usd;
  const btcDom = global?.market_cap_percentage?.btc;
  const ethDom = global?.market_cap_percentage?.eth;

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="stack">
      <section className="grid-hero">
        <div className="card hero-card">
          <p className="muted">Global crypto market cap</p>
          {globalLoading ? (
            <Skeleton w="60%" h={52} r={12} style={{ margin: "10px 0" }} />
          ) : (
            <div className="hero-figure">
              <h1 className="num">{money(cap, vs, { compact: true })}</h1>
              <Change value={capChange} pill />
              <span className="muted small">past 24 hours</span>
            </div>
          )}
          <div className="hero-meta">
            <div>
              <span className="muted small">24h volume</span>
              <strong className="num">{money(vol, vs, { compact: true })}</strong>
            </div>
            <div>
              <span className="muted small">Active coins</span>
              <strong className="num">{global?.active_cryptocurrencies?.toLocaleString() ?? "—"}</strong>
            </div>
            <div>
              <span className="muted small">Markets</span>
              <strong className="num">{global?.markets?.toLocaleString() ?? "—"}</strong>
            </div>
          </div>
          <div className="dominance" aria-label="Market dominance">
            <div className="dom-bar">
              <span style={{ width: `${btcDom ?? 0}%`, background: "var(--btc)" }} />
              <span style={{ width: `${ethDom ?? 0}%`, background: "var(--eth)" }} />
              <span style={{ flex: 1, background: "var(--line-strong)" }} />
            </div>
            <div className="dom-legend small">
              <span><i style={{ background: "var(--btc)" }} />BTC {btcDom ? percent(btcDom, 1) : "—"}</span>
              <span><i style={{ background: "var(--eth)" }} />ETH {ethDom ? percent(ethDom, 1) : "—"}</span>
              <span><i style={{ background: "var(--line-strong)" }} />Others</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Fear &amp; Greed</h3>
          <p className="muted small">Market mood today, from 0 (panic) to 100 (euphoria).</p>
          <FearGreed />
        </div>
      </section>

      <section className="grid-two">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Market movers</h3>
            <div className="seg" role="tablist">
              {[
                ["trending", "Trending", <Flame size={14} key="f" />],
                ["gainers", "Top gainers"],
                ["losers", "Top losers"],
              ].map(([k, label, icon]) => (
                <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="movers">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={46} r={10} />)}</div>
          ) : (
            <div className="movers">
              {lists[tab].map((c, i) => (
                <MoverRow key={c.id} coin={c} vs={vs} rank={i + 1} />
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Watchlist</h3>
            <Link to="/cryptocurrencies" className="link-sm">Edit <ChevronRight size={14} /></Link>
          </div>
          {watched.length === 0 ? (
            <EmptyState icon={Star} title="Nothing here yet" message="Tap the star next to any coin to follow it here." />
          ) : (
            <div className="watch-list">
              {watched.slice(0, 5).map((c) => (
                <Link key={c.id} to={`/crypto/${c.id}`} className="watch-row">
                  <CoinLabel image={c.image} name={c.symbol.toUpperCase()} size={28} />
                  <Sparkline data={c.sparkline_in_7d?.price} up={(c.price_change_percentage_7d_in_currency ?? 0) >= 0} width={64} height={26} />
                  <span className="grow-end">
                    <span className="num block">{money(c.current_price, vs)}</span>
                    <Change value={c.price_change_percentage_24h} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHead
          title="Top cryptocurrencies"
          sub="Ranked by market cap"
          action={<Link to="/cryptocurrencies" className="link-sm">See all markets <ChevronRight size={14} /></Link>}
        />
        <MarketsTable coins={coins.slice(0, 10)} vs={vs} loading={isLoading} />
      </section>

      <section>
        <SectionHead
          title="Latest news"
          action={<Link to="/news" className="link-sm">More stories <ChevronRight size={14} /></Link>}
        />
        <News simplified />
      </section>
    </div>
  );
};

export default Homepage;
