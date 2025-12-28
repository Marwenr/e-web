import React from "react";
import Link from "next/link";
import { SearchIcon, ShoppingBagIcon } from "./svg";

export interface NavbarProps {
  cartCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount = 0 }) => {
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
            ALKORSI
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex flex-1 items-center justify-end gap-6">
          <button
            type="button"
            aria-label="Search"
            className="text-foreground transition-colors hover:text-foreground-secondary"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Shopping cart"
            className="relative text-foreground transition-colors hover:text-foreground-secondary"
          >
            <ShoppingBagIcon />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-900 text-label font-medium text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
