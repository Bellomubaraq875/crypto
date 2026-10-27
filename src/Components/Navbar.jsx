import { createElement } from "react";
import { NavLink, Link } from "react-router-dom";
import { navItems } from "./navItems";
import { Wordmark } from "./Logo";

const Navbar = () => (
  <>
    <aside className="sidebar">
      <Link to="/" className="brand">
        <Wordmark />
      </Link>
      <nav aria-label="Main">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            {createElement(icon, { size: 19 })}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-card">
        <strong>Track what you hold</strong>
        <p>Add coins to your portfolio to see profit, loss and allocation in one place.</p>
        <Link to="/portfolio" className="btn small">Open portfolio</Link>
      </div>
    </aside>

    <nav className="tabbar" aria-label="Main">
      {navItems.filter((n) => n.to !== "/exchange").map(({ to, label, icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          {createElement(icon, { size: 21 })}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </>
);

export default Navbar;
