import { Link } from "react-router";

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="logo-container">
        {/* Simple inline SVG for a Pokeball accent */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#FFCB05" strokeWidth="2" />
          <path d="M2 12H22" stroke="#FFCB05" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="#FFCB05" strokeWidth="2" />
          <circle cx="12" cy="12" r="1" fill="#FFCB05" />
        </svg>
        <span className="logo-text">Pokédex</span>
      </Link>
    </header>
  );
}
