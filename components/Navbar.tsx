"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SearchIcon, ShoppingBagIcon, UserIcon } from "./svg";
import { Badge } from "./ui";
import { MiniCart } from "./cart";
import { useAuthStore, useCartStore } from "@/store";

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { cart, initialize } = useCartStore();
  const pathname = usePathname();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isAuthPage = pathname?.startsWith("/auth");
  const isCartPage = pathname === "/cart";
  const isCheckoutPage = pathname === "/checkout";
  const isOrderConfirmationPage = pathname?.match(
    /^\/orders\/[^/]+\/confirmation$/
  );
  const shouldAlwaysShowScrolled =
    isAuthPage || isCartPage || isCheckoutPage || isOrderConfirmationPage;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Skip scroll listener on pages that should always show scrolled state
    if (shouldAlwaysShowScrolled) {
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight * 0.6; // 60vh

      setIsScrolled(scrollPosition > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldAlwaysShowScrolled]);

  // On specific pages (auth, cart, checkout, order confirmation), always treat as scrolled
  const effectiveIsScrolled = shouldAlwaysShowScrolled || isScrolled;

  const cartCount = cart?.itemCount || 0;

  // Check if user is admin
  const adminRoles = ["admin", "staff", "super_admin"];
  const isAdmin =
    isAuthenticated && user && adminRoles.includes(user.role?.toLowerCase());

  return (
    <header
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        effectiveIsScrolled || isHovered ? "bg-background" : "bg-transparent"
      }`}
    >
      <nav className="container-custom flex h-16 items-center">
        {/* Left Navigation Links */}
        <div className="flex flex-1 items-center gap-8">
          <Link
            href="/shop"
            className={`text-body-md font-medium transition-colors ${
              effectiveIsScrolled || isHovered
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className={`text-body-md font-medium transition-colors ${
              effectiveIsScrolled || isHovered
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`text-body-md font-medium transition-colors ${
              effectiveIsScrolled || isHovered
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            Contact
          </Link>
        </div>

        {/* Centered Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/"
            className={`text-h3 font-bold ${
              effectiveIsScrolled || isHovered
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            MeubleTN
          </Link>
        </div>

        {/* Right Icons & Actions */}
        <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
          {isAdmin && (
            <>
              {/* Dashboard Button - Desktop */}
              <Link
                href="/admin"
                className={`hidden sm:inline-flex items-center gap-2 h-8 px-3 text-label font-medium focus-visible:ring-offset-2 ${
                  effectiveIsScrolled || isHovered
                    ? "bg-primary-900 text-white hover:bg-primary-800 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    : "text-primary-900 bg-white hover:bg-primary-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                }`}
              >
                Dashboard
              </Link>
              {/* Dashboard Link - Mobile */}
              <Link
                href="/admin"
                aria-label="Dashboard"
                className="sm:hidden text-body-md font-medium text-primary-900 transition-colors hover:text-primary-800"
              >
                Dashboard
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label="Search"
            className={`transition-colors ${
              effectiveIsScrolled || isHovered
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            onClick={() => setIsMiniCartOpen(true)}
            aria-label="Shopping cart"
            className={`relative transition-colors ${
              effectiveIsScrolled
                ? "text-foreground hover:text-foreground-secondary"
                : "text-primary-50 hover:text-primary-100"
            }`}
          >
            <ShoppingBagIcon />
            {cartCount > 0 && (
              <Badge
                variant="primary"
                size="sm"
                className="absolute -right-2 -top-2"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </button>
          <MiniCart
            isOpen={isMiniCartOpen}
            onClose={() => setIsMiniCartOpen(false)}
          />
          {!isAuthenticated ? (
            <>
              {/* Login Button - Desktop */}
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-2 h-8 px-3 text-label font-medium border-2 border-primary-900 text-primary-900 hover:bg-primary-50 active:bg-primary-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <UserIcon className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              {/* Login Icon - Mobile */}
              <Link
                href="/auth/login"
                aria-label="Sign in"
                className="sm:hidden text-foreground transition-colors hover:text-foreground-secondary"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <>
              {/* User Avatar Button - Desktop */}
              <Link
                href="/user/settings"
                aria-label="User settings"
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-neutral-200 text-foreground transition-colors hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              {/* User Avatar Icon - Mobile */}
              <Link
                href="/user/settings"
                aria-label="User settings"
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-neutral-200 text-foreground transition-colors hover:bg-neutral-300"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
