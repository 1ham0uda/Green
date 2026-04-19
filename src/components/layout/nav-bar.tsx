"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { CartLink } from "./cart-link";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: Icon.Home },
  { href: "/search", label: "Search", icon: Icon.Search },
  { href: "/plants", label: "Plants", icon: Icon.Leaf },
  { href: "/competitions", label: "Competitions", icon: Icon.Trophy },
  { href: "/marketplace", label: "Marketplace", icon: Icon.ShoppingBag },
];

export function NavBar() {
  const { user, signOut, initialized } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "border-b border-surface-border bg-surface/80 backdrop-blur-xl backdrop-saturate-150"
            : "bg-surface/60 backdrop-blur-md"
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft transition-transform group-hover:scale-105">
              <Icon.Leaf size={18} />
            </span>
            <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
              Green
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const Ico = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-brand-700"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Ico size={16} />
                    <span className="hidden lg:inline">{link.label}</span>
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-brand-50"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <div className="hidden sm:block">
                  <CartLink />
                </div>
                <div className="hidden sm:block">
                  <NotificationBell />
                </div>
              </>
            )}

            {!initialized ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-surface-subtle" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-1.5 py-1 pr-3 transition hover:bg-surface-hover"
                >
                  <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                  <span className="hidden text-sm font-medium text-ink sm:inline">
                    @{user.handle}
                  </span>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-float"
                      >
                        <div className="border-b border-surface-border p-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.photoURL}
                              name={user.displayName}
                              size="md"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">
                                {user.displayName}
                              </p>
                              <p className="truncate text-xs text-ink-muted">
                                @{user.handle}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-1">
                          <MenuItem href={`/u/${user.handle}`} icon={<Icon.User size={16} />}>
                            My profile
                          </MenuItem>
                          <MenuItem href="/settings/profile" icon={<Icon.Settings size={16} />}>
                            Settings
                          </MenuItem>
                          <MenuItem href="/orders" icon={<Icon.ShoppingBag size={16} />}>
                            Orders
                          </MenuItem>
                          {user.role === "admin" && (
                            <MenuItem href="/admin" icon={<Icon.Shield size={16} />}>
                              Admin panel
                            </MenuItem>
                          )}
                          <div className="my-1 h-px bg-surface-border" />
                          <button
                            type="button"
                            onClick={() => void signOut()}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                          >
                            <Icon.LogOut size={16} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      {user && <MobileBottomNav pathname={pathname ?? ""} />}
    </>
  );
}

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-hover hover:text-ink"
    >
      <span className="text-ink-subtle">{icon}</span>
      {children}
    </Link>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  const links = [
    { href: "/feed", label: "Feed", icon: Icon.Home },
    { href: "/search", label: "Search", icon: Icon.Search },
    { href: "/posts/new", label: "Post", icon: Icon.Plus, featured: true },
    { href: "/marketplace", label: "Shop", icon: Icon.ShoppingBag },
    { href: "/notifications", label: "Activity", icon: Icon.Bell },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-surface/90 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => {
          const Ico = link.icon;
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          if (link.featured) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-center -mt-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-float transition-transform active:scale-95">
                  <Ico size={22} />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-brand-700" : "text-ink-subtle"
              )}
            >
              <Ico size={22} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
