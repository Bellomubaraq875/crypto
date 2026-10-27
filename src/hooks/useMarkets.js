import { useEffect, useMemo } from "react";
import { useGetMarketsQuery } from "../Services/coinGeckoApi";
import { useApp } from "../context/AppContext";

const memo = new Map();

function readCache(key) {
  if (memo.has(key)) return memo.get(key);
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : null;
    memo.set(key, value);
    return value;
  } catch {
    return null;
  }
}

function writeCache(key, coins) {
  // keep it small: a 7-day sparkline needs ~42 points, not 168
  const slim = coins.map((c) => ({
    ...c,
    sparkline_in_7d: c.sparkline_in_7d?.price
      ? { price: c.sparkline_in_7d.price.filter((_, i) => i % 4 === 0) }
      : c.sparkline_in_7d,
  }));
  memo.set(key, slim);
  try {
    localStorage.setItem(key, JSON.stringify(slim));
  } catch {
    /* storage full or unavailable */
  }
}

// Every screen asks for the same args, so RTK Query serves them from one cached request.
// The last good response is also kept on disk, so the app paints instantly on the next visit
// while fresh prices load in the background.
export function useMarkets({ vs, poll = 0 } = {}) {
  const { currency } = useApp();
  const currencyCode = vs ?? currency;
  const key = `cryptoc:markets:${currencyCode}`;

  const result = useGetMarketsQuery(
    { vs: currencyCode, page: 1, perPage: 100 },
    { pollingInterval: poll, skipPollingIfUnfocused: true }
  );

  const live = Array.isArray(result.data) ? result.data : null;
  useEffect(() => {
    if (live?.length) writeCache(key, live);
  }, [live, key]);

  const cached = useMemo(() => readCache(key), [key]);
  const coins = live ?? (Array.isArray(cached) ? cached : []);
  const hasData = coins.length > 0;

  return {
    ...result,
    vs: currencyCode,
    coins,
    // only show skeletons when there's truly nothing to draw yet
    isLoading: result.isLoading && !hasData,
    isError: result.isError && !hasData,
  };
}
