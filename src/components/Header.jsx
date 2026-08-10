import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";
// Import the service to fetch categories
import { fetchCategories } from "../services/productService";
const logo = "/logo_file_page-0001.png";

const adminNavItems = [
  { label: "Overview", hash: "overview" },
  { label: "Products", hash: "products" },
  { label: "Orders", hash: "orders" },
  { label: "Settings", hash: "settings" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  // State for dynamic categories
  const [navCategories, setNavCategories] = useState([]);

  // NEW: Mobile Accordion State
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileSubCategoryOpen, setMobileSubCategoryOpen] = useState(null); // 'mens' or 'womens'
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Check admin authentication separately for admin routes
  const isAdminAuthenticated = isAdminRoute
    ? !!sessionStorage.getItem("adminToken")
    : false;

  // Show icons if either regular auth or admin auth
  const showAuthIcons = isAuthenticated || isAdminAuthenticated;

  // Get admin user info for display
  const adminUser =
    isAdminRoute && isAdminAuthenticated
      ? JSON.parse(sessionStorage.getItem("adminUser") || "{}")
      : null;

  const displayName = useMemo(() => {
    if (user?.name) {
      return user.name.trim().split(/\s+/)[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Account";
  }, [user]);

  // Fetch Categories for the Dropdown
  useEffect(() => {
    const getNavData = async () => {
      try {
        const data = await fetchCategories();
        const categoriesArray = Array.isArray(data)
          ? data
          : data?.categories || data?.data || [];
        setNavCategories(categoriesArray);
      } catch (err) {
        console.error("Failed to load nav categories", err);
      }
    };
    if (!isAdminRoute) {
      getNavData();
    }
  }, [isAdminRoute]);

  useEffect(() => {
    // Pages that should have transparent header initially (have hero images/videos)
    const transparentPages = [
      "/",
      "/collections",
      "/collections/kolors-of-kutch",
      "/collections/threads-of-travancore",
      "/community",
      "/community2",
      "/sustainability",
      "/contact",
    ];
    const isTransparentPage = transparentPages.includes(location.pathname);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    // Set initial transparent state based on page
    setIsTransparent(isTransparentPage);

    // Initial scroll check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setHoveredMenu(null);
    setMobileCategoryOpen(false);
  };

  const handleMenuHover = (menu) => {
    // Only allow hover on desktop (> 1200px)
    if (window.innerWidth > 1200) {
      setHoveredMenu(menu);
    }
  };

  const handleMenuLeave = () => {
    if (window.innerWidth > 1200) {
      setHoveredMenu(null);
    }
  };

  const handleLogout = () => {
    if (isAdminRoute) {
      window.sessionStorage.removeItem("adminToken");
      window.sessionStorage.removeItem("adminUser");
    }
    logout();
    setIsMenuOpen(false);
    navigate(isAdminRoute ? "/login" : "/");
  };

  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);

  const handleMobileClick = (e, type, id) => {
    if (window.innerWidth <= 1200) {
      e.preventDefault();
      e.stopPropagation();

      if (type === "main") {
        setMobileCategoryOpen(!mobileCategoryOpen);
      } else if (type === "community") {
        setMobileCommunityOpen(!mobileCommunityOpen);
      } else if (type === "collections") {
        setMobileCollectionsOpen(!mobileCollectionsOpen);
      } else if (type === "sub") {
        setMobileSubCategoryOpen(mobileSubCategoryOpen === id ? null : id);
      }
    } else {
      closeMenu();
    }
  };
  // Filter logic for dropdown links
  const menLinks = navCategories.filter(
    (cat) => cat.parent_id === 1 || cat.id === 29,
  );
  const womenLinks = navCategories.filter(
    (cat) => cat.parent_id === 4 || cat.id === 17 || cat.name === "Kurtas",
  );

  return (
    <>
      <header
        className={`header ${isScrolled || !isTransparent ? "scrolled" : ""} ${isTransparent ? "transparent-page" : ""}`}
      >
        <div className="header-main">
          <div className="header-main-container">
            <Link to="/" className="logo-link">
              <img src={logo} alt="Khaddar Logo" className="logo" />
            </Link>

            <div className="header-icons-left">
              {showAuthIcons ? (
                <>
                  {!isAdminRoute && (
                    <Link
                      to="/profile"
                      className="icon-btn account-btn"
                      aria-label="Account"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </Link>
                  )}
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
                <Link
                  to="/login"
                  className="icon-btn account-btn"
                  aria-label="Account"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              )}
              {showAuthIcons && !isAdminRoute && (
                <Link
                  to="/cart"
                  className="icon-btn cart-btn"
                  aria-label="Shopping Cart"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span className="cart-count">0</span>
                </Link>
              )}
              {isAdminRoute && isAdminAuthenticated && adminUser && (
                <div className="header-welcome">
                  <span className="header-welcome-text">Welcome back</span>
                  <span className="header-welcome-name">
                    {adminUser.username || adminUser.email || "Admin"}
                  </span>
                </div>
              )}
              {showAuthIcons && !isAdminRoute && (
                <div className="auth-indicator">
                  <span className="auth-email">{displayName}</span>
                </div>
              )}
            </div>

            <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
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
                  <Link to="/" className="nav-link" onClick={closeMenu}>
                    HOME
                  </Link>

                  <div
                    className="nav-link-wrapper"
                    onMouseEnter={() => handleMenuHover("collections")}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      to="/collections"
                      className="nav-link"
                      onClick={(e) => handleMobileClick(e, "collections")}
                    >
                      COLLECTIONS
                      <span className="mobile-arrow show-mobile">▾</span>
                    </Link>

                    {/* Flat Dropdown - Kolors of Kutch / Threads of Travancore */}
                    {(hoveredMenu === "collections" || mobileCollectionsOpen) && (
                      <div
                        className={`dropdown-menu ${mobileCollectionsOpen ? "mobile-visible" : ""}`}
                        onMouseEnter={() => handleMenuHover("collections")}
                        onMouseLeave={handleMenuLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to="/collections"
                          className="dropdown-item"
                          onClick={closeMenu}
                        >
                          Kolors of Kutch
                        </Link>
                        <Link
                          to="/collections/threads-of-travancore"
                          className="dropdown-item"
                          onClick={closeMenu}
                        >
                          Threads of Travancore
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* SHOP BY CATEGORY - MODIFIED FOR MOBILE ACCORDION */}
                  <div
                    className="nav-link-wrapper"
                    onMouseEnter={() => handleMenuHover("shop")}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      to="/shop/mens-wear"
                      className="nav-link"
                      onClick={(e) => handleMobileClick(e, "main")}
                    >
                      SHOP BY CATEGORY
                      {/* Arrow visible only on mobile */}
                      <span className="mobile-arrow show-mobile">▾</span>
                    </Link>

                    {/* Show if Hovered (Desktop) OR Open (Mobile) */}
                    {(hoveredMenu === "shop" || mobileCategoryOpen) && (
                      <div
                        className={`dropdown-menu ${mobileCategoryOpen ? "mobile-visible" : ""}`}
                        onMouseEnter={() => handleMenuHover("shop")}
                        onMouseLeave={handleMenuLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* MEN'S WEAR SECTION */}
                        <div className="dropdown-item-wrapper">
                          <Link
                            to="/shop/mens-wear"
                            className="dropdown-item"
                            onClick={(e) => handleMobileClick(e, "sub", "mens")}
                          >
                            MEN'S WEAR
                          </Link>

                          <div
                            className={`dropdown-submenu ${mobileSubCategoryOpen === "mens" ? "mobile-visible" : ""}`}
                          >
                            {menLinks.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/shop/mens-wear?category=${cat.id}`}
                                className="dropdown-subitem"
                                onClick={closeMenu}
                              >
                                {cat.name || cat.sub_category}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* WOMEN'S WEAR SECTION */}
                        <div className="dropdown-item-wrapper">
                          <Link
                            to="/shop/womens-wear"
                            className="dropdown-item"
                            onClick={(e) =>
                              handleMobileClick(e, "sub", "womens")
                            }
                          >
                            WOMEN'S WEAR
                          </Link>

                          <div
                            className={`dropdown-submenu ${mobileSubCategoryOpen === "womens" ? "mobile-visible" : ""}`}
                          >
                            {womenLinks.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/shop/womens-wear?category=${cat.id}`}
                                className="dropdown-subitem"
                                onClick={closeMenu}
                              >
                                {cat.name || cat.sub_category}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* COMMUNITY SECTION */}
                  <div
                    className="nav-link-wrapper"
                    onMouseEnter={() => handleMenuHover("community")}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      to="/community"
                      className="nav-link"
                      onClick={(e) => handleMobileClick(e, "community")}
                    >
                      COMMUNITY
                      <span className="mobile-arrow show-mobile">▾</span>
                    </Link>

                    {/* Flat Dropdown (No nested Artisan level) */}
                    {(hoveredMenu === "community" || mobileCommunityOpen) && (
                      <div
                        className={`dropdown-menu ${mobileCommunityOpen ? "mobile-visible" : ""}`}
                        onMouseEnter={() => handleMenuHover("community")}
                        onMouseLeave={handleMenuLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to="/community"
                          className="dropdown-item"
                          onClick={closeMenu}
                        >
                          Artisan Heritage
                        </Link>
                        <Link
                          to="/community2"
                          className="dropdown-item"
                          onClick={closeMenu}
                        >
                          Featured Collaborations
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/sustainability"
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    SUSTAINABILITY
                  </Link>
                  <Link to="/contact" className="nav-link" onClick={closeMenu}>
                    CONTACT US
                  </Link>
                </>
              )}
            </nav>

            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              type="button"
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
              <span className={`hamburger ${isMenuOpen ? "open" : ""}`}></span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;