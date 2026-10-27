import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue];
}

export function AppProvider({ children }) {
  const [theme, setTheme] = usePersisted("cryptoc:theme", "dark");
  const [currency, setCurrency] = usePersisted("cryptoc:currency", "usd");
  const [watchlist, setWatchlist] = usePersisted("cryptoc:watchlist", ["bitcoin", "ethereum", "solana"]);
  const [holdings, setHoldings] = usePersisted("cryptoc:holdings", []);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleWatch = useCallback(
    (id, name) => {
      setWatchlist((list) => {
        const has = list.includes(id);
        notify(has ? `${name ?? id} removed from watchlist` : `${name ?? id} added to watchlist`);
        return has ? list.filter((x) => x !== id) : [...list, id];
      });
    },
    [setWatchlist, notify]
  );

  const addHolding = useCallback(
    (h) => {
      setHoldings((list) => [...list, { ...h, uid: `${h.id}-${Date.now()}` }]);
      notify(`${h.name} added to portfolio`);
    },
    [setHoldings, notify]
  );

  const removeHolding = useCallback(
    (uid) => setHoldings((list) => list.filter((h) => h.uid !== uid)),
    [setHoldings]
  );

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      currency,
      setCurrency,
      watchlist,
      toggleWatch,
      holdings,
      addHolding,
      removeHolding,
      toast,
      notify,
    }),
    [theme, setTheme, currency, setCurrency, watchlist, toggleWatch, holdings, addHolding, removeHolding, toast, notify]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
