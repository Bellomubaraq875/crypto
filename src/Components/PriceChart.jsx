import { useMemo } from "react";
import "../chartconfig.js";
import { Line } from "react-chartjs-2";
import { money } from "../utils/format";
import { useApp } from "../context/AppContext";

const crosshair = {
  id: "crosshair",
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements?.();
    if (!active?.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = chart.options.plugins.crosshairColor ?? "#888";
    ctx.stroke();
    ctx.restore();
  },
};

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const PriceChart = ({ history, vs, days }) => {
  const { theme } = useApp();

  const { data, options } = useMemo(() => {
    const prices = history?.prices ?? [];
    const values = prices.map((p) => p[1]);
    const up = values.length < 2 || values[values.length - 1] >= values[0];
    const color = css(up ? "--up" : "--down") || (up ? "#16c784" : "#ea3943");
    const grid = css("--line") || "rgba(255,255,255,.06)";
    const muted = css("--text-3") || "#7c8499";
    const surface = css("--surface-3") || "#1a2033";
    const text = css("--text") || "#fff";

    const fmtLabel = (ts) => {
      const d = new Date(ts);
      if (String(days) === "1") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (Number(days) >= 365) return d.toLocaleDateString([], { month: "short", year: "2-digit" });
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return {
      data: {
        labels: prices.map((p) => p[0]),
        datasets: [
          {
            data: values,
            borderColor: color,
            borderWidth: 2.2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
            tension: 0.25,
            fill: true,
            backgroundColor: (context) => {
              const { ctx, chartArea } = context.chart;
              if (!chartArea) return "transparent";
              const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, color + "44");
              g.addColorStop(1, color + "00");
              return g;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          crosshairColor: muted,
          tooltip: {
            backgroundColor: surface,
            titleColor: muted,
            bodyColor: text,
            borderColor: grid,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            titleFont: { family: "Manrope Variable, sans-serif", size: 12, weight: 500 },
            bodyFont: { family: "Manrope Variable, sans-serif", size: 15, weight: 700 },
            callbacks: {
              title: (items) =>
                new Date(items[0].label * 1 || items[0].parsed.x).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              label: (item) => money(item.parsed.y, vs),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: muted,
              maxTicksLimit: 6,
              maxRotation: 0,
              font: { family: "Manrope Variable, sans-serif", size: 11 },
              callback(value) {
                return fmtLabel(this.getLabelForValue(value) * 1);
              },
            },
          },
          y: {
            position: "right",
            grid: { color: grid },
            border: { display: false },
            ticks: {
              color: muted,
              maxTicksLimit: 5,
              font: { family: "Manrope Variable, sans-serif", size: 11 },
              callback: (v) => money(v, vs, { compact: Math.abs(v) >= 1000 }),
            },
          },
        },
      },
    };
    // theme is a dependency so colors refresh when the user toggles light/dark
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, vs, days, theme]);

  return (
    <div className="chart-wrap">
      <Line data={data} options={options} plugins={[crosshair]} />
    </div>
  );
};

export default PriceChart;
