"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { CartLink } from "./cart-link";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const NAV_LINKS = [
  { href: "/feed",          label: "Feed" },
  { href: "/search",        label: "Search" },
  { href: "/plants",        label: "Plants" },
  { href: "/competitions",  label: "Competitions" },
  { href: "/marketplace",   label: "Marketplace" },
  { href: "/groups",        label: "Groups" },
];

export function NavBar() {
  const { user, signOut, initialized } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-200",
          scrolled
            ? "border-b border-surface-border bg-surface/90 backdrop-blur-xl"
            : "bg-surface-muted/80 backdrop-blur-md"
        )}
      >
        <div className="container flex h-14 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-baseline gap-0.5 transition-opacity hover:opacity-75"
          >
            <span className="font-serif text-[22px] font-normal tracking-[-0.02em] text-ink">
              Green
            </span>
            <span className="font-serif text-[22px] text-brand-500">.</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 font-sans text-[13px] font-medium transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-surface-subtle"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <div className="hidden sm:block">
                  <CartLink />
                </div>
                {/* Bell visible on sm+ screens; mobile users access via dropdown */}
                <div className="hidden sm:block">
                  <NotificationBell />
                </div>
              </>
            )}

            {!initialized ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-surface-subtle" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  className="relative flex items-center gap-2 rounded-full border border-surface-border bg-surface px-2 py-1 pr-3 transition hover:bg-surface-hover"
                >
                  <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                  <span className="hidden font-sans text-[13px] font-medium text-ink sm:inline">
                    @{user.handle}
                  </span>
                  {/* Unread notification dot — mobile only (bell is hidden on mobile) */}
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-surface sm:hidden">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-elevated"
                      >
                        {/* Profile header */}
                        <div className="border-b border-surface-border px-4 py-3">
                          <p className="font-sans text-[13px] font-medium text-ink">
                            {user.displayName}
                          </p>
                          <p className="font-sans text-xs text-ink-muted">
                            @{user.handle}
                          </p>
                        </div>
                        <div className="p-1">
                          <MenuItem href={`/u/${user.handle}`} icon={<Icon.User size={15} />}>
                            My profile
                          </MenuItem>
                          {/* Notifications — visible on mobile only (hidden sm: the bell covers desktop) */}
                          <div className="sm:hidden">
                            <MenuItemWithBadge
                              href="/notifications"
                              icon={<Icon.Bell size={15} />}
                              badge={unreadCount}
                            >
                              Notifications
                            </MenuItemWithBadge>
                          </div>
                          <MenuItem href="/saved" icon={<Icon.Bookmark size={15} />}>
                            Saved posts
                          </MenuItem>
                          <MenuItem href="/competitions" icon={<Icon.Trophy size={15} />}>
                            Competitions
                          </MenuItem>
                          <MenuItem href="/orders" icon={<Icon.ShoppingBag size={15} />}>
                            Orders
                          </MenuItem>
                          {(user.role === "business" || user.role === "admin") && (
                            <>
                              <MenuItem href="/vendor/orders" icon={<Icon.Package size={15} />}>
                                Vendor dashboard
                              </MenuItem>
                              <MenuItem href="/vendor/returns" icon={<Icon.RotateCcw size={15} />}>
                                Returns
                              </MenuItem>
                              <MenuItem href="/vendor/ads" icon={<Icon.Megaphone size={15} />}>
                                Ads manager
                              </MenuItem>
                            </>
                          )}
                          {user.role === "admin" && (
                            <MenuItem href="/admin" icon={<Icon.Shield size={15} />}>
                              Admin panel
                            </MenuItem>
                          )}
                          <MenuItem href="/settings/profile" icon={<Icon.Settings size={15} />}>
                            Settings
                          </MenuItem>
                          <div className="my-1 h-px bg-surface-border" />
                          <button
                            type="button"
                            onClick={() => void signOut()}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left font-sans text-[13px] text-red-700 transition hover:bg-red-50"
                          >
                            <Icon.LogOut size={15} />
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
                <Link href="/login" className="btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary btn-sm">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
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
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-sans text-[13px] text-ink-muted transition hover:bg-surface-hover hover:text-ink"
    >
      <span className="text-ink-subtle">{icon}</span>
      {children}
    </Link>
  );
}

function MenuItemWithBadge({
  href,
  icon,
  badge,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  badge: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-sans text-[13px] text-ink-muted transition hover:bg-surface-hover hover:text-ink"
    >
      <span className="text-ink-subtle">{icon}</span>
      <span className="flex-1">{children}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  const links = [
    { href: "/feed",        label: "Feed",   icon: Icon.Home },
    { href: "/search",      label: "Search", icon: Icon.Search },
    { href: "/posts/new",   label: "Post",   icon: Icon.Plus, featured: true },
    { href: "/groups",      label: "Groups", icon: Icon.Users },
    { href: "/marketplace", label: "Shop",   icon: Icon.ShoppingBag },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-surface/95 backdrop-blur-xl md:hidden">
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
                className="flex items-center justify-center"
              >
                <span className="flex h-11 w-11 -translate-y-3 items-center justify-center rounded-full bg-ink text-ink-inverted shadow-elevated transition-transform active:scale-95">
                  <Ico size={20} />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 font-sans text-[9px] font-medium uppercase tracking-eyebrow transition-colors",
                active ? "text-ink" : "text-ink-subtle"
              )}
            >
              <Ico
                size={20}
                className={active ? "stroke-[1.8]" : "stroke-[1.5]"}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
