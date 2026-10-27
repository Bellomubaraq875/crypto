import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coinGeckoApi = createApi({
  reducerPath: "coinGeckoApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.coingecko.com/api/v3" }),
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    // Market list with 7d sparkline + 1h/24h/7d change. One call feeds the
    // dashboard, markets table, search, converter and portfolio.
    getMarkets: builder.query({
      query: ({ vs = "usd", page = 1, perPage = 100 } = {}) =>
        `/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`,
    }),

    getGlobal: builder.query({
      query: () => `/global`,
      transformResponse: (res) => res?.data,
    }),

    getTrending: builder.query({
      query: () => `/search/trending`,
      transformResponse: (res) => (res?.coins ?? []).map((c) => c?.item).filter(Boolean),
    }),

    // Crypto Fear & Greed index (alternative.me, free, no key)
    getFearGreed: builder.query({
      query: () => `https://api.alternative.me/fng/?limit=1`,
      transformResponse: (res) => res?.data?.[0],
    }),

    getCryptoDetails: builder.query({
      query: (coinId) =>
        `/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
    }),

    getCryptoHistory: builder.query({
      query: ({ coinId, timeperiod, vs = "usd" }) =>
        `/coins/${coinId}/market_chart?vs_currency=${vs}&days=${timeperiod}`,
    }),

    // Fiat rates derived from BTC prices: units of each currency per 1 USD
    getFxRates: builder.query({
      query: () => `/simple/price?ids=bitcoin&vs_currencies=usd,ngn,eur,gbp`,
      transformResponse: (res) => {
        const p = res?.bitcoin ?? {};
        if (!p.usd) return { usd: 1 };
        return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v / p.usd]));
      },
    }),

    getExchanges: builder.query({
      query: (limit = 50) => `/exchanges?per_page=${limit}&page=1`,
    }),
  }),
});

export const {
  useGetMarketsQuery,
  useGetGlobalQuery,
  useGetTrendingQuery,
  useGetFearGreedQuery,
  useGetCryptoDetailsQuery,
  useGetCryptoHistoryQuery,
  useGetFxRatesQuery,
  useGetExchangesQuery,
} = coinGeckoApi;
