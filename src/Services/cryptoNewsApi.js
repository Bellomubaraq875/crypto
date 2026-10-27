import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://newsdata.io/api/1";
// Prefer an env var (VITE_NEWS_API_KEY in .env) so the key is not committed.
const apiKey =
  import.meta.env.VITE_NEWS_API_KEY || "pub_5cca991e541f4b228fb1fef8d7d8a6d5";

const createRequest = (url) => `${url}&apikey=${apiKey}`;

export const cryptoNewsApi = createApi({
  reducerPath: "cryptoNewsApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getCryptoNews: builder.query({
      query: ({ newsCategory = "cryptocurrency", page = "" }) =>
        createRequest(
          `/news?q=${newsCategory}&language=en${page ? `&page=${page}` : ""}`
        ),
    }),
  }),
});

export const { useGetCryptoNewsQuery } = cryptoNewsApi;
