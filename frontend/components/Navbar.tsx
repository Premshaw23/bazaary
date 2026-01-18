"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShoppingCart, Package, LayoutDashboard, Wallet, Settings, Crown, Menu, X, User, ShoppingBag, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useCart } from "@/lib/cart/context";
import SearchOverlay from "@/components/SearchOverlay";

type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
};

const NAV_LINKS: Record<string, NavLink[]> = {
  BUYER: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/profile", label: "Profile", icon: User },
  ],
  SELLER: [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/products", label: "Add Products", icon: Package },
    { href: "/seller/listings", label: "Listings", icon: Package },
    { href: "/seller/orders", label: "Orders", icon: Package },
    { href: "/seller/wallets", label: "Wallet", icon: Wallet },
    { href: "/seller/profile", label: "Profile", icon: User },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/payouts", label: "Payouts", icon: Wallet },
    { href: "/admin/wallet", label: "Platform Wallet", icon: Wallet },
    { href: "/admin/unlock-requests", label: "Unlock Requests", icon: Settings },
    { href: "/admin/products", label: "Manage Product", icon: Package },
  ],
  PUBLIC: [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const role = user?.role || "PUBLIC";
  const links: NavLink[] = NAV_LINKS[role] || NAV_LINKS.PUBLIC;
  // Unique cart items count (for BUYER only)
  const uniqueCartCount = Array.isArray(cart) ? cart.length : 0;
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep body padding-top in sync with navbar height
  useEffect(() => {
    if (!navRef.current) return;

    const setNavOffset = () => {
      try {
        const el = navRef.current;
        if (!el) return;
        const h = `${Math.ceil(el.getBoundingClientRect().height)}px`;
        document.body.style.paddingTop = h;
      } catch (e) {
        // ignore
      }
    };

    setNavOffset();

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(setNavOffset);
      if (navRef.current) ro.observe(navRef.current);
    } catch (e) {
      // ResizeObserver may not be available
    }

    window.addEventListener("resize", setNavOffset);

    return () => {
      try {
        if (ro && navRef.current) ro.unobserve(navRef.current);
      } catch (e) { }
      window.removeEventListener("resize", setNavOffset);
      document.body.style.paddingTop = "";
    };
  }, [navRef]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (mobileOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [mobileOpen, userMenuOpen]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Get user initials
  const getInitials = (user: { name?: string; email?: string } | null | undefined): string => {
    if (!user) return "?";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) return user.email[0].toUpperCase();
    return "?";
  };

  const getUserDisplayName = (user: { name?: string; email?: string } | null | undefined): string => {
    if (!user) return "User";
    return user.name || user.email?.split("@")[0] || "User";
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    setUserMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Main Navbar */}
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "glass py-2 shadow-xl"
          : "bg-white/10 backdrop-blur-sm border-b border-transparent py-4"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <ShoppingBag className="text-white w-6 h-6" />
                </div>
              </div>
              <span className="text-2xl font-display font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Bazaary.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.slice(0, role === "PUBLIC" ? 2 : 5).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                // Show badge only for Cart link and BUYER
                const showCartBadge = link.href === "/cart" && role === "BUYER" && uniqueCartCount > 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
                      ? "bg-linear-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span className="text-sm">{link.label}</span>
                    {showCartBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 flex items-center justify-center shadow">
                        {uniqueCartCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Trigger - Premium Fake Input */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all w-64 group border border-transparent hover:border-slate-300"
              >
                <SearchIcon size={18} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                <span className="text-sm font-medium">Search products...</span>
                <div className="flex items-center gap-1 ml-auto">
                  <kbd className="hidden lg:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-300 rounded shadow-sm">
                    ⌘K
                  </kbd>
                </div>
              </button>

              {/* Mobile Search Icon (keep for mobile) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-300 group"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-blue-200 group-hover:border-blue-300 transition-all duration-300 group-hover:scale-105 shadow-sm">
                        {getInitials(user)}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {getUserDisplayName(user)}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-200 shadow-sm">
                            {getInitials(user)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-semibold text-sm truncate">
                              {getUserDisplayName(user)}
                            </p>
                            <p className="text-slate-600 text-xs truncate mt-0.5">
                              {user.email}
                            </p>
                            {user.role === "ADMIN" && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                <Crown size={10} />
                                Admin
                              </span>
                            )}
                            {user.role === "SELLER" && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                <Package size={10} />
                                Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {links.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-sm"
                            >
                              {Icon && <Icon size={18} />}
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                        {/* <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-50 rounded-md transition-colors text-sm"
                        >
                          <Settings size={18} />
                          <span>Settings</span>
                        </Link> */}
                      </div>

                      {/* Logout */}
                      <div className="p-2 border-t border-slate-200">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm w-full"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <SearchIcon size={24} />
              </button>
              <button
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <aside
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-50 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info (Mobile) */}
          {user && (
            <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-200 shadow-sm">
                  {getInitials(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-sm truncate">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-slate-600 text-xs truncate">
                    {user.email}
                  </p>
                  {user.role === "ADMIN" && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      <Crown size={10} />
                      Admin
                    </span>
                  )}
                  {user.role === "SELLER" && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      <Package size={10} />
                      Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const showCartBadge = link.href === "/cart" && role === "BUYER" && uniqueCartCount > 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive
                    ? "bg-linear-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {Icon && <Icon size={20} />}
                  <span>{link.label}</span>
                  {showCartBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 flex items-center justify-center shadow">
                      {uniqueCartCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* {user && (
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300"
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            )} */}
          </nav>

          {/* Mobile Auth Footer */}
          <div className="p-4 border-t border-slate-200">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all duration-300 border border-red-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3 text-center text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors border border-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3 text-center bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}