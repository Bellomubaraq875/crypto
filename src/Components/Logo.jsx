// Cryptoc mark: a "C" coin whose open side is a rising price line.
export const LogoMark = ({ size = 34, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Cryptoc">
    <defs>
      <linearGradient id="lg-bg" x1="8" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#8a7bff" />
        <stop offset="1" stopColor="#3347e0" />
      </linearGradient>
      <linearGradient id="lg-up" x1="26" y1="40" x2="52" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#3ff0b0" />
        <stop offset="1" stopColor="#16c784" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="17" fill="url(#lg-bg)" />
    <path d="M12 6h40a12 12 0 0 1 12 12v2C48 14 26 8 12 6Z" fill="#fff" opacity=".1" />
    <path d="M45.4 20a18 18 0 1 0 0 24" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <path d="M27 40l7-7 4 4 11-12" fill="none" stroke="url(#lg-up)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 24.5h8.5V33" fill="none" stroke="url(#lg-up)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Wordmark = () => (
  <span className="brand-lockup">
    <LogoMark size={36} />
    <span>Cryptoc</span>
  </span>
);
