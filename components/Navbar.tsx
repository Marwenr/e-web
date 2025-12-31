'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SearchIcon, ShoppingBagIcon, UserIcon } from "./svg";
import { Badge } from "./ui";
import { MiniCart } from "./cart";
import { useAuthStore, useCartStore } from "@/store";

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { cart, initialize } = useCartStore();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const cartCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-background">
      <nav className="container-custom mx-auto flex h-16 items-center">
        {/* Left Navigation Links */}
        <div className="flex flex-1 items-center gap-8">
          <Link
            href="/shop"
            className="text-body-md font-medium text-foreground transition-colors hover:text-foreground-secondary"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-body-md font-medium text-foreground transition-colors hover:text-foreground-secondary"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-body-md font-medium text-foreground transition-colors hover:text-foreground-secondary"
          >
            Contact
          </Link>
        </div>

        {/* Centered Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="text-h3 font-bold text-foreground">
            MeubleTN
          </Link>
        </div>

        {/* Right Icons & Actions */}
        <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
          <button
            type="button"
            aria-label="Search"
            className="text-foreground transition-colors hover:text-foreground-secondary"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            onClick={() => setIsMiniCartOpen(true)}
            aria-label="Shopping cart"
            className="relative text-foreground transition-colors hover:text-foreground-secondary"
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
          <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
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
