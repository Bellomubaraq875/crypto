import { Component } from "react";

// Keeps the app shell alive if one screen throws, and shows what went wrong.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Cryptoc crashed:", error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  resetData = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("cryptoc:"))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="state-box" role="alert">
        <h3>This screen hit a problem</h3>
        <p>{String(this.state.error?.message ?? this.state.error)}</p>
        <div className="chips" style={{ justifyContent: "center", marginTop: 8 }}>
          <button className="btn primary" onClick={() => window.location.reload()}>Reload</button>
          <button className="btn ghost" onClick={this.resetData}>Clear saved data and reload</button>
        </div>
      </div>
    );
  }
}
