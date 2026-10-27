import { useState } from "react";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { useGetCryptoNewsQuery } from "../Services/cryptoNewsApi";
import { timeAgo } from "../utils/format";
import { EmptyState, ErrorState, Skeleton } from "./ui";

const topics = [
  ["cryptocurrency", "All"],
  ["bitcoin", "Bitcoin"],
  ["ethereum", "Ethereum"],
  ["blockchain", "Blockchain"],
  ["defi", "DeFi"],
  ["nft", "NFTs"],
];

const Cover = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="news-cover placeholder" aria-hidden="true"><Newspaper size={30} /></div>;
  return <img className="news-cover" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
};

const News = ({ simplified }) => {
  const [pageToken, setPageToken] = useState("");
  const [category, setCategory] = useState("cryptocurrency");

  const { data, isFetching, isError, refetch } = useGetCryptoNewsQuery({
    newsCategory: category,
    page: simplified ? "" : pageToken,
  });

  const list = Array.isArray(data?.results) ? data.results : [];
  const shown = simplified ? list.slice(0, 3) : list;

  return (
    <div className={simplified ? "" : "stack"}>
      {!simplified && (
        <>
          <div className="page-title">
            <div>
              <h1>News</h1>
              <p className="muted">Stories from across the crypto world.</p>
            </div>
          </div>
          <div className="chips scroll-x" role="tablist" aria-label="News topic">
            {topics.map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={category === k}
                className={`chip btn-chip ${category === k ? "on" : ""}`}
                onClick={() => { setCategory(k); setPageToken(""); }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {isError ? (
        <ErrorState title="Couldn't load news" message="The news service didn't respond. Its free plan limits how often it can be called, so try again in a few minutes." onRetry={refetch} />
      ) : isFetching && !list.length ? (
        <div className="news-grid">{Array.from({ length: simplified ? 3 : 6 }).map((_, i) => <Skeleton key={i} h={300} r={16} />)}</div>
      ) : !shown.length ? (
        <div className="card"><EmptyState icon={Newspaper} title="No stories found" message="Try another topic." /></div>
      ) : (
        <div className={`news-grid ${isFetching ? "dim" : ""}`}>
          {shown.map((n, i) => (
            <a key={n.article_id ?? i} href={n.link} target="_blank" rel="noreferrer" className="news-card card">
              <Cover src={n.image_url} alt="" />
              <div className="news-body">
                <div className="news-meta small muted">
                  <span className="news-source">{n.source_name ?? n.source_id}</span>
                  <span>{n.pubDate ? timeAgo(n.pubDate) : ""}</span>
                </div>
                <h3>{n.title}</h3>
                <p className="muted">{n.description ? n.description.slice(0, 120).trim() + "…" : "Open the story to read more."}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {!simplified && (
        <div className="pager">
          <button className="btn ghost" disabled={!data?.previousPage} onClick={() => setPageToken(data.previousPage)}><ChevronLeft size={16} /> Previous</button>
          <button className="btn ghost" disabled={!data?.nextPage} onClick={() => setPageToken(data.nextPage)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
};

export default News;
