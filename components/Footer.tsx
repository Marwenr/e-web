import React from "react";
import Link from "next/link";
import { Container } from "./ui";
import { InstagramIcon, FacebookIcon, TwitterIcon, YouTubeIcon } from "./svg";

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-900 text-white">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Info */}
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-h3 font-bold text-white">
                MeubleTN
              </Link>
              <p className="text-body-sm text-neutral-300">
                Discover timeless pieces for effortless style.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-white transition-colors hover:border-white hover:bg-white hover:text-primary-900"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-white transition-colors hover:border-white hover:bg-white hover:text-primary-900"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-white transition-colors hover:border-white hover:bg-white hover:text-primary-900"
                >
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500 text-white transition-colors hover:border-white hover:bg-white hover:text-primary-900"
                >
                  <YouTubeIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Information */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-body-lg font-semibold text-white">
                Information
              </h3>
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/shipping-policy"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Shipping Policy
                </Link>
                <Link
                  href="/returns-refunds"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Returns & Refunds
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </nav>
            </div>

            {/* Company */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-body-lg font-semibold text-white">Company</h3>
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/about"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  About us
                </Link>
                <Link
                  href="/contact"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Contact
                </Link>
                <Link
                  href="/blogs"
                  className="text-body-sm text-neutral-300 transition-colors hover:text-white"
                >
                  Blogs
                </Link>
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-body-lg font-semibold text-white">Contact</h3>
              <div className="flex flex-col space-y-3 text-body-sm text-neutral-300">
                <p className="text-neutral-300 ">123 Fashion Street</p>
                <p className="text-neutral-300 ">New York, NY 10001</p>
                <p className="text-neutral-300 ">
                  <a
                    href="tel:+1234567890"
                    className="transition-colors text-neutral-300 hover:text-white"
                  >
                    +1 (234) 567-890
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:info@meubletn.com"
                    className="transition-colors text-neutral-300 hover:text-white"
                  >
                    info@meubletn.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-neutral-700 pt-8">
            <p className="text-body-sm text-neutral-400">
              Copyright © 2024, MeubleTN
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
