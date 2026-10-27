import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react";
import { useMarkets } from "../hooks/useMarkets";
import { useApp } from "../context/AppContext";
import { money } from "../utils/format";
import { Change, CoinLabel, EmptyState, ErrorState, SkeletonRows, StarButton, Sparkline } from "./ui";

const columns = [
  { key: "market_cap_rank", label: "#", align: "left", cls: "col-rank" },
  { key: "name", label: "Name", align: "left" },
  { key: "current_price", label: "Price", align: "right" },
  { key: "price_change_percentage_1h_in_currency", label: "1h", align: "right", cls: "hide-sm" },
  { key: "price_change_percentage_24h_in_currency", label: "24h", align: "right" },
  { key: "price_change_percentage_7d_in_currency", label: "7d", align: "right", cls: "hide-md" },
  { key: "total_volume", label: "24h volume", align: "right", cls: "hide-md" },
  { key: "market_cap", label: "Market cap", align: "right", cls: "hide-sm" },
  { key: "spark", label: "Last 7 days", align: "right", cls: "hide-md", nosort: true },
];

const MarketRow = memo(function MarketRow({ c, vs, watched, onToggle }) {
  const navigate = useNavigate();
  const d7 = c.price_change_percentage_7d_in_currency;
  const open = () => navigate(`/crypto/${c.id}`);
  return (
    <tr tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
      <td className="col-star">
        <StarButton
          active={watched}
          label={`${watched ? "Remove" : "Add"} ${c.name} ${watched ? "from" : "to"} watchlist`}
          onClick={() => onToggle(c.id, c.name)}
        />
      </td>
      <td className="col-rank muted">{c.market_cap_rank}</td>
      <td><CoinLabel image={c.image} name={c.name} symbol={c.symbol} /></td>
      <td className="right num strong">{money(c.current_price, vs)}</td>
      <td className="right hide-sm"><Change value={c.price_change_percentage_1h_in_currency} /></td>
      <td className="right"><Change value={c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h} /></td>
      <td className="right hide-md"><Change value={d7} /></td>
      <td className="right num hide-md">{money(c.total_volume, vs, { compact: true })}</td>
      <td className="right num hide-sm">{money(c.market_cap, vs, { compact: true })}</td>
      <td className="right hide-md">
        <Sparkline data={c.sparkline_in_7d?.price} up={(d7 ?? 0) >= 0} />
      </td>
    </tr>
  );
});

export const MarketsTable = ({ coins, vs, loading, sort, onSort }) => {
  const { watchlist, toggleWatch } = useApp();

  if (loading) return <div className="card flush"><SkeletonRows rows={10} /></div>;

  return (
    <div className="card flush table-scroll">
      <table className="market-table">
        <thead>
          <tr>
            <th className="col-star" aria-label="Watchlist" />
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} className={`${c.cls ?? ""} ${c.align}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                  {onSort && !c.nosort ? (
                    <button className={`th-btn ${active ? "on" : ""}`} onClick={() => onSort(c.key)}>
                      {c.label}
                      {active && (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {coins.map((c) => (
            <MarketRow key={c.id} c={c} vs={vs} watched={watchlist.includes(c.id)} onToggle={toggleWatch} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const filters = [
  ["all", "All coins"],
  ["watchlist", "Watchlist"],
  ["gainers", "Gainers"],
  ["losers", "Losers"],
];

const Cryptocurrencies = () => {
  const { coins, vs, isLoading, isError, refetch, isFetching } = useMarkets({ poll: 60000 });
  const { watchlist } = useApp();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ key: "market_cap_rank", dir: "asc" });
  const [visible, setVisible] = useState(25);

  const onSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" || key === "market_cap_rank" ? "asc" : "desc" }));

  const rows = useMemo(() => {
    let list = coins.filter((c) => {
      const q = term.trim().toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    });
    if (filter === "watchlist") list = list.filter((c) => watchlist.includes(c.id));
    if (filter === "gainers") list = list.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
    if (filter === "losers") list = list.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
    const dir = sort.dir === "asc" ? 1 : -1;
    const sortKey = filter === "gainers" || filter === "losers" ? "price_change_percentage_24h" : sort.key;
    const sortDir = filter === "gainers" ? -1 : filter === "losers" ? 1 : dir;
    return [...list].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (typeof x === "string") return x.localeCompare(y) * sortDir;
      return ((x ?? -Infinity) - (y ?? -Infinity)) * sortDir;
    });
  }, [coins, term, filter, sort, watchlist]);

  const totalCap = coins.reduce((s, c) => s + (c.market_cap || 0), 0);

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="stack">
      <div className="page-title">
        <div>
          <h1>Markets</h1>
          <p className="muted">
            Top 100 coins by market cap, worth {money(totalCap, vs, { compact: true })} combined. Prices refresh every minute.
            {isFetching && !isLoading && <span className="live-dot" title="Refreshing" />}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="seg">
          {filters.map(([k, label]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
              {k === "watchlist" && <Star size={14} />}
              {label}
              {k === "watchlist" && <span className="count">{watchlist.length}</span>}
            </button>
          ))}
        </div>
        <label className="field search-field">
          <Search size={16} />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Filter by name or symbol" aria-label="Filter coins" />
        </label>
      </div>

      {rows.length === 0 && !isLoading ? (
        <div className="card">
          {filter === "watchlist" && watchlist.length === 0 ? (
            <EmptyState icon={Star} title="Your watchlist is empty" message="Star the coins you care about and they'll show up here." />
          ) : (
            <EmptyState icon={Search} title="No coins found" message={term ? `Nothing matches “${term}”. Try a different name or symbol.` : "No coins match this filter right now."} />
          )}
        </div>
      ) : (
        <>
          <MarketsTable coins={rows.slice(0, visible)} vs={vs} loading={isLoading} sort={sort} onSort={onSort} />
          {rows.length > visible && (
            <div className="center">
              <button className="btn ghost" onClick={() => setVisible((v) => v + 25)}>
                Show more ({rows.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cryptocurrencies;
