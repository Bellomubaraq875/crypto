# Cryptoc

A crypto tracking web app built with React 19, Redux Toolkit (RTK Query), Chart.js and Vite.
Live data from CoinGecko, news from newsdata.io, sentiment from alternative.me.

## Features
- Overview: global market cap, 24h volume, BTC/ETH dominance, Fear & Greed gauge, trending coins, top gainers/losers, watchlist
- Markets: top 100 coins, 1h/24h/7d change, 7-day sparklines, sortable columns, search, watchlist stars, gainers/losers filters, auto-refresh every minute
- Coin page: interactive chart (24H/7D/1M/3M/1Y), 24h range bar, supply progress, ATH/ATL, performance, price calculator, about and links
- Portfolio: holdings, live value, profit/loss, 24h change, allocation donut (stored in your browser)
- Convert: coin to coin/USD/NGN/EUR/GBP
- Exchanges and News with topic filters
- Dark/light theme, currency switcher, press / to search, mobile tab bar

## Run
    npm install
    npm run dev

Optional: set VITE_NEWS_API_KEY in a .env file (falls back to the key in code).

## Speed
- `npm run dev` is the slow development build. For the real speed, run `npm run build` then `npm run preview`.
- The last prices are cached on your device, so the app paints instantly and refreshes in the background.

## Logo
`public/logo.svg` (icon), `public/logo.png` (512px), `public/logo-lockup-dark.png` and `public/logo-lockup-light.png`.
