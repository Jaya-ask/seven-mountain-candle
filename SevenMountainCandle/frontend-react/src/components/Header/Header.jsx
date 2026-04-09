import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import "./Header.scss";

export default function Header({
  cartCount,
  onCartOpen,
  search,
  onSearchChange,
  onBrandClick,
  onTrackOrderClick,
  onManageOrdersClick,
  onAuthClick,
  onLogoutClick,
  isLoggedIn,
  isAdmin,
  userName,
  page = "home"
}) {
  const showSearch = page === "shop";
  const centerBrand = page === "home";
  const showHomeLogo = page === "home";
  const headerMainClassName = `header-main${showSearch ? " shop-layout" : " without-search"}${centerBrand ? " center-brand" : ""}`;

  return (
    <header className="site-header">
      <div className={headerMainClassName}>
        {showHomeLogo ? (
          <button
            type="button"
            className="home-logo"
            onClick={onBrandClick}
            aria-label="Go to home"
          >
            <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <path
                d="M24 48 L24 31 C24 27.5 26.7 24.8 30.2 24.8 L33.8 24.8 C37.3 24.8 40 27.5 40 31 L40 48 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path d="M32 24.8 L32 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M32 11.5 C27.8 17.1 28.8 21.6 32 24 C35.2 21.6 36.2 17.1 32 11.5 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M32 14.8 C30.9 16.9 31.1 18.6 32 19.7 C32.9 18.6 33.1 16.9 32 14.8 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path className="logo-spark" d="M24.8 12.9 L24.8 17.3" fill="none" strokeWidth="1.8" strokeLinecap="round" />
              <path className="logo-spark" d="M22.6 15.1 L27 15.1" fill="none" strokeWidth="1.8" strokeLinecap="round" />
              <path className="logo-spark" d="M39 12.4 L39 15.6" fill="none" strokeWidth="1.6" strokeLinecap="round" />
              <path className="logo-spark" d="M37.4 14 L40.6 14" fill="none" strokeWidth="1.6" strokeLinecap="round" />
              <circle className="logo-spark-dot" cx="42.4" cy="18.2" r="1.3" />
              <path d="M22 48 L42 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        <button type="button" className="brand-block" onClick={onBrandClick}>
          <h1>Seven Mountains</h1>
          <p className="eyebrow">Candle Studio</p>
        </button>
        {showSearch ? (
          <div className="header-search">
            <input
              type="search"
              placeholder="Search florals, festive candles, pillars, gifts"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        ) : null}
        <div className="header-actions">
          {isAdmin ? (
            <button type="button" onClick={onManageOrdersClick}>Manage Orders</button>
          ) : null}
          <button type="button" onClick={onTrackOrderClick}>
            {isLoggedIn ? "My Orders" : "Track order"}
          </button>
          <button type="button" className="cart-action-button" onClick={onCartOpen}>
            Cart ({cartCount})
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              className="logout-icon-button"
              onClick={onLogoutClick}
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon fontSize="small" aria-hidden="true" />
            </button>
          ) : null}
          {!isAdmin ? (
            <button
              type="button"
              className={isLoggedIn ? "profile-icon-button" : ""}
              onClick={onAuthClick}
              aria-label={isLoggedIn ? "Open profile" : undefined}
              title={isLoggedIn ? "Profile" : undefined}
            >
              {isLoggedIn ? <PersonIcon fontSize="small" aria-hidden="true" /> : "Login / Register"}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}


