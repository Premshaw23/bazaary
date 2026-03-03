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
  icon?: React.ComponentType<{ size?: number; className?: string }>;
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
          ? "py-3"
          : "py-5"
          }`}
      >
        <div className="mx-auto px-4 md:px-8 max-w-[1600px]">
          <nav className={`flex items-center justify-between transition-all duration-500 p-2 ${scrolled ? 'glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/40' : ''
            }`}>
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0 min-w-[140px]">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                    <ShoppingBag className="text-white w-5 h-5" />
                  </div>
                  <div className="absolute -inset-2 bg-brand-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xl font-display font-black text-slate-950 tracking-tight">
                  Bazaary.
                </span>
                {role !== "PUBLIC" && (
                  <span className="hidden xl:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                    {role}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation (Center) */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm mx-4">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const showCartBadge = link.href === "/cart" && role === "BUYER" && uniqueCartCount > 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${isActive
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                      }`}
                  >
                    {Icon && <Icon size={14} className={isActive ? "text-brand-600" : ""} />}
                    <span className="text-[11px] uppercase tracking-wider whitespace-nowrap">{link.label}</span>
                    {showCartBadge && (
                      <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md border-2 border-white">
                        {uniqueCartCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions Section (Right) */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0 min-w-[300px] justify-end">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-3 py-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 rounded-xl transition-all w-56 group border border-slate-200/50 hover:border-slate-300 focus:outline-none"
              >
                <SearchIcon size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                <span className="text-xs font-medium">Search products...</span>
                <div className="flex items-center gap-1 ml-auto">
                  <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-sm group-hover:text-slate-600 transition-colors">
                    ⌘K
                  </kbd>
                </div>
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-all duration-300 group"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
                        {getInitials(user)}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-950 truncate max-w-[100px]">
                      {getUserDisplayName(user)}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* User Info Header */}
                      <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
                            {getInitials(user)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-bold text-sm truncate">
                              {getUserDisplayName(user)}
                            </p>
                            <p className="text-slate-500 text-xs truncate mt-0.5">
                              {user.email}
                            </p>
                            <div className="flex gap-1.5 mt-2">
                              {user.role === "ADMIN" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                  <Crown size={10} /> Admin
                                </span>
                              )}
                              {user.role === "SELLER" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 text-brand-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                  <Package size={10} /> Seller
                                </span>
                              )}
                              {user.role === "BUYER" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                  <ShoppingBag size={10} /> Buyer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logout */}
                      <div className="p-2 border-t border-slate-200 bg-slate-50/50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-white hover:text-red-700 rounded-xl transition-all duration-300 text-sm font-bold w-full"
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
                    className="px-4 py-2 text-slate-600 hover:text-slate-950 font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-slate-950/20 hover:shadow-slate-950/40 hover:-translate-y-0.5"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Actions */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <SearchIcon size={20} />
              </button>
              <button
                className="p-2.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-200"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {
        mobileOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
        )
      }

      {/* Mobile Menu */}
      <aside
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-50 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-200 shadow-sm">
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
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {Icon && <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />}
                  <span className="text-sm uppercase tracking-wider">{link.label}</span>
                  {showCartBadge && (
                    <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-5 flex items-center justify-center shadow-lg border-2 border-white">
                      {uniqueCartCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full px-4 py-4 bg-white hover:bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-all duration-300 border border-slate-200 shadow-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3.5 text-center text-slate-700 hover:bg-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all border border-slate-200 shadow-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full px-4 py-3.5 text-center bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 shadow-lg"
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