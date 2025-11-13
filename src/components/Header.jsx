import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const logo = '/logo_file_page-0001.png';

const adminNavItems = [
  { label: 'Overview', hash: 'overview' },
  { label: 'Products', hash: 'products' },
  { label: 'Orders', hash: 'orders' },
  { label: 'Users', hash: 'users' },
  { label: 'Settings', hash: 'settings' }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBlackScrolled, setIsBlackScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Check admin authentication separately for admin routes
  const isAdminAuthenticated = isAdminRoute 
    ? !!localStorage.getItem('adminToken')
    : false;
  
  // Show icons if either regular auth or admin auth
  const showAuthIcons = isAuthenticated || isAdminAuthenticated;
  
  // Get admin user info for display
  const adminUser = isAdminRoute && isAdminAuthenticated
    ? JSON.parse(localStorage.getItem('adminUser') || '{}')
    : null;
  const displayName = useMemo(() => {
    if (user?.name) {
      return user.name.trim().split(/\s+/)[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Account';
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (location.pathname === '/' ||
          location.pathname === '/collections' ||
          location.pathname === '/community' ||
          location.pathname === '/sustainability' ||
          location.pathname === '/contact') {
        setIsScrolled(scrollPosition > 100);
        setIsBlackScrolled(false);
      } else {
        setIsScrolled(true);
        setIsBlackScrolled(scrollPosition > 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setHoveredMenu(null);
  };

  const handleMenuHover = (menu) => {
    setHoveredMenu(menu);
  };

  const handleMenuLeave = () => {
    setHoveredMenu(null);
  };

  const handleLogout = () => {
    if (isAdminRoute) {
      window.localStorage.removeItem('adminToken');
      window.localStorage.removeItem('adminUser');
    }
    logout();
    setIsMenuOpen(false);
    navigate(isAdminRoute ? '/login' : '/');
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isBlackScrolled ? 'black-scrolled' : ''}`}>
        <div className="header-main">
          <div className="header-main-container">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Khaddar Logo" className="logo" />
          </Link>

          <div className="header-icons-left">
            <button
              className="icon-btn search-btn"
              aria-label="Search"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSearchOpen(!isSearchOpen);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            {showAuthIcons ? (
              <>
                <button
                  type="button"
                  className="icon-btn account-btn"
                  aria-label="Account"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                <button
                  type="button"
                  className="icon-btn logout-btn"
                  aria-label="Logout"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <FaSignOutAlt size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="icon-btn account-btn" aria-label="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}
            {showAuthIcons && !isAdminRoute && (
              <button className="icon-btn cart-btn" aria-label="Shopping Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="cart-count">0</span>
              </button>
            )}
            {isAdminRoute && isAdminAuthenticated && adminUser && (
              <div className="header-welcome">
                <span className="header-welcome-text">Welcome back</span>
                <span className="header-welcome-name">{adminUser.username || adminUser.email || 'Admin'}</span>
              </div>
            )}
            {showAuthIcons && !isAdminRoute && (
              <div className="auth-indicator">
                <span className="auth-email">{displayName}</span>
              </div>
            )}
          </div>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            {isAdminRoute ? (
              adminNavItems.map((item) => (
                <Link
                  key={item.hash}
                  to={`/admin/dashboard#${item.hash}`}
                  className="nav-link"
                  onClick={closeMenu}
                >
                  {item.label.toUpperCase()}
                </Link>
              ))
            ) : (
              <>
                <Link to="/" className="nav-link" onClick={closeMenu}>HOME</Link>

                <div
                  className="nav-link-wrapper"
                  onMouseEnter={() => handleMenuHover('collections')}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link to="/collections" className="nav-link" onClick={closeMenu}>COLLECTIONS</Link>
                </div>

                <div
                  className="nav-link-wrapper"
                  onMouseEnter={() => handleMenuHover('shop')}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      handleMenuLeave();
                    }
                  }}
                >
                  <span className="nav-link">SHOP BY CATEGORY</span>
                  {hoveredMenu === 'shop' && (
                    <div
                      className="dropdown-menu"
                      onMouseEnter={() => handleMenuHover('shop')}
                      onMouseLeave={handleMenuLeave}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to="/shop/mens-wear" className="dropdown-item" onClick={closeMenu}>
                        MEN'S WEAR
                        <div className="dropdown-submenu">
                          <Link to="/shop/mens-wear?category=shirts" className="dropdown-subitem" onClick={closeMenu}>Shirts</Link>
                          <Link to="/shop/mens-wear?category=trousers" className="dropdown-subitem" onClick={closeMenu}>Trousers</Link>
                          <Link to="/shop/mens-wear?category=co-ords" className="dropdown-subitem" onClick={closeMenu}>Co-ords</Link>
                          <Link to="/shop/mens-wear?category=blazers-jackets" className="dropdown-subitem" onClick={closeMenu}>Blazers / Jackets</Link>
                          <Link to="/shop/mens-wear?category=kurtas" className="dropdown-subitem" onClick={closeMenu}>Kurtas</Link>
                        </div>
                      </Link>
                      <Link to="/shop/womens-wear" className="dropdown-item" onClick={closeMenu}>
                        WOMEN'S WEAR
                        <div className="dropdown-submenu">
                          <Link to="/shop/womens-wear?category=blouses" className="dropdown-subitem" onClick={closeMenu}>Blouses</Link>
                          <Link to="/shop/womens-wear?category=skirts-trousers" className="dropdown-subitem" onClick={closeMenu}>Skirts/ Trousers</Link>
                          <Link to="/shop/womens-wear?category=co-ords" className="dropdown-subitem" onClick={closeMenu}>Co-ords</Link>
                          <Link to="/shop/womens-wear?category=blazers-jackets" className="dropdown-subitem" onClick={closeMenu}>Blazers/ Jackets</Link>
                          <Link to="/shop/womens-wear?category=kurtas" className="dropdown-subitem" onClick={closeMenu}>Kurtas</Link>
                          <Link to="/shop/womens-wear?category=dresses" className="dropdown-subitem" onClick={closeMenu}>Dresses</Link>
                          <Link to="/shop/womens-wear?category=sarees" className="dropdown-subitem" onClick={closeMenu}>Sarees</Link>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/community" className="nav-link" onClick={closeMenu}>COMMUNITY / COLLABORATION</Link>
                <Link to="/sustainability" className="nav-link" onClick={closeMenu}>SUSTAINABILITY</Link>
                <Link to="/contact" className="nav-link" onClick={closeMenu}>CONTACT US</Link>
              </>
            )}
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={toggleMenu}
            type="button"
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>
    </header>

    {isSearchOpen && (
      <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
        <div className="search-modal" onClick={(e) => e.stopPropagation()}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search for products..."
              className="search-input"
              autoFocus
            />
            <button
              type="button"
              className="search-close-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSearchOpen(false);
              }}
              aria-label="Close search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;

