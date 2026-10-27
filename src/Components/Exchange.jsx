import { ExternalLink } from "lucide-react";
import { useGetExchangesQuery } from "../Services/coinGeckoApi";
import { useMarkets } from "../hooks/useMarkets";
import { compact, money } from "../utils/format";
import { ErrorState, SkeletonRows } from "./ui";

const Exchanges = () => {
  const { data: exchanges, isLoading, isError, refetch } = useGetExchangesQuery();
  const { coins, vs } = useMarkets();
  const btc = coins.find((c) => c.id === "bitcoin")?.current_price;

  if (isError || (!isLoading && !Array.isArray(exchanges))) return <ErrorState title="Couldn't load exchanges" onRetry={refetch} />;

  return (
    <div className="stack">
      <div className="page-title">
        <div>
          <h1>Exchanges</h1>
          <p className="muted">Where crypto is traded, ranked by CoinGecko trust score.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card flush"><SkeletonRows rows={10} /></div>
      ) : (
        <div className="card flush table-scroll">
          <table className="market-table">
            <thead>
              <tr>
                <th className="col-rank left">#</th>
                <th className="left">Exchange</th>
                <th className="left">Trust score</th>
                <th className="right">24h volume</th>
                <th className="right hide-sm">Founded</th>
                <th className="right hide-md">Country</th>
                <th aria-label="Visit" />
              </tr>
            </thead>
            <tbody>
              {exchanges.map((x, i) => (
                <tr key={x.id}>
                  <td className="col-rank muted">{x.trust_score_rank ?? i + 1}</td>
                  <td>
                    <span className="coin-label">
                      <img src={x.image} alt="" width="32" height="32" loading="lazy" />
                      <span className="coin-label-text"><strong>{x.name}</strong></span>
                    </span>
                  </td>
                  <td>
                    <div className="trust">
                      <div className="trust-bar"><span style={{ width: `${(x.trust_score ?? 0) * 10}%` }} /></div>
                      <span className="num small">{x.trust_score ?? "—"}/10</span>
                    </div>
                  </td>
                  <td className="right">
                    <span className="num strong block">{compact(x.trade_volume_24h_btc)} BTC</span>
                    {btc && <span className="muted small num">≈ {money(x.trade_volume_24h_btc * btc, vs, { compact: true })}</span>}
                  </td>
                  <td className="right hide-sm">{x.year_established ?? "—"}</td>
                  <td className="right hide-md muted">{x.country ?? "—"}</td>
                  <td className="right">
                    <a className="icon-btn" href={x.url} target="_blank" rel="noreferrer" aria-label={`Visit ${x.name}`}><ExternalLink size={16} /></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Exchanges;
