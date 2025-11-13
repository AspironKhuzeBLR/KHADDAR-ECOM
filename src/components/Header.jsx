import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../context/AuthContext';

const logo = '/logo_file_page-0001.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBlackScrolled, setIsBlackScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
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
            {isAuthenticated ? (
              <button
                type="button"
                className="icon-btn account-btn"
                aria-label="Logout"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                  <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"></path>
                </svg>
              </button>
            ) : (
              <Link to="/login" className="icon-btn account-btn" aria-label="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            )}
            {isAuthenticated && (
              <button className="icon-btn cart-btn" aria-label="Shopping Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="cart-count">0</span>
              </button>
            )}
            {isAuthenticated && (
              <div className="auth-indicator">
                <span className="auth-email">{displayName}</span>
              </div>
            )}
          </div>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
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
                // Only close if we're not moving to the dropdown menu
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

