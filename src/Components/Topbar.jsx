import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useMarkets } from "../hooks/useMarkets";
import { CURRENCIES, money } from "../utils/format";
import { Change } from "./ui";
import { LogoMark } from "./Logo";

const Topbar = () => {
  const { theme, toggleTheme, currency, setCurrency } = useApp();
  const { coins, vs } = useMarkets();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return coins
      .filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .slice(0, 6);
  }, [coins, query]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const go = (coin) => {
    navigate(`/crypto/${coin.id}`);
    setQuery("");
    setOpen(false);
  };

  const onInputKey = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      go(results[cursor]);
    }
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand mobile-brand" aria-label="Cryptoc home">
        <LogoMark size={36} />
      </Link>

      <div className="search" ref={boxRef}>
        <Search size={17} />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search coins, e.g. Bitcoin or SOL"
          aria-label="Search coins"
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
        />
        <kbd>/</kbd>
        {open && query.trim() && (
          <div className="search-pop" role="listbox">
            {results.length === 0 && <p className="muted small pad">No coin matches “{query}”.</p>}
            {results.map((c, i) => (
              <button
                key={c.id}
                role="option"
                aria-selected={i === cursor}
                className={`search-item ${i === cursor ? "active" : ""}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(c)}
              >
                <img src={c.image} alt="" width="26" height="26" />
                <span className="grow">
                  <strong>{c.name}</strong> <small>{c.symbol.toUpperCase()}</small>
                </span>
                <span className="num">{money(c.current_price, vs)}</span>
                <Change value={c.price_change_percentage_24h} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <label className="select-wrap">
          <span className="sr-only">Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {Object.entries(CURRENCIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.symbol} {v.code}
              </option>
            ))}
          </select>
        </label>
        <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
