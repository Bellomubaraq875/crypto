import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useMarkets } from "../hooks/useMarkets";
import { money } from "../utils/format";

// Portfolio values are tracked in USD so they stay consistent when the display currency changes.
const AddAssetModal = ({ coin, onClose }) => {
  const { addHolding } = useApp();
  const { coins } = useMarkets({ vs: "usd" });
  const [selectedId, setSelectedId] = useState(coin?.id ?? "");
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState(coin?.price != null ? String(coin.price) : "");
  const [error, setError] = useState("");

  const selected = coin && coin.id === selectedId ? coin : coins.find((c) => c.id === selectedId);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pickCoin = (id) => {
    setSelectedId(id);
    const c = coins.find((x) => x.id === id);
    if (c) setBuyPrice(String(c.current_price));
  };

  const submit = (e) => {
    e.preventDefault();
    const qty = Number(amount);
    const price = Number(buyPrice);
    if (!selected) return setError("Choose a coin to add.");
    if (!(qty > 0)) return setError("Enter how many coins you hold. It must be more than 0.");
    if (!(price >= 0) || buyPrice === "") return setError("Enter the price you paid per coin in USD.");
    addHolding({
      id: selected.id,
      name: selected.name,
      symbol: selected.symbol,
      image: selected.image?.large ?? selected.image?.small ?? selected.image,
      amount: qty,
      buyPrice: price,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" onSubmit={submit}>
        <div className="modal-head">
          <h2 id="add-title">Add to portfolio</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label className="field-block">
          <span>Coin</span>
          {coin ? (
            <div className="static-field">{coin.name} ({coin.symbol.toUpperCase()})</div>
          ) : (
            <select value={selectedId} onChange={(e) => pickCoin(e.target.value)}>
              <option value="">Select a coin…</option>
              {coins.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>
              ))}
            </select>
          )}
        </label>

        <label className="field-block">
          <span>Amount you hold</span>
          <input type="number" inputMode="decimal" step="any" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </label>

        <label className="field-block">
          <span>Buy price per coin (USD)</span>
          <input type="number" inputMode="decimal" step="any" min="0" placeholder="0.00" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
        </label>

        {Number(amount) > 0 && Number(buyPrice) >= 0 && buyPrice !== "" && (
          <p className="muted small">Total cost: <strong className="num">{money(Number(amount) * Number(buyPrice), "usd")}</strong></p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">Add to portfolio</button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetModal;
