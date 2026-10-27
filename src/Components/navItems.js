import { LayoutDashboard, BarChart3, Wallet, ArrowLeftRight, Landmark, Newspaper } from "lucide-react";

export const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/cryptocurrencies", label: "Markets", icon: BarChart3 },
  { to: "/portfolio", label: "Portfolio", icon: Wallet },
  { to: "/convert", label: "Convert", icon: ArrowLeftRight },
  { to: "/exchange", label: "Exchanges", icon: Landmark },
  { to: "/news", label: "News", icon: Newspaper },
];
