"use client";

import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navItems = [
  { name: "Map", href: "/map" },
  { name: "Sightings", href: "/#sightings" },
  { name: "About", href: "/#about" },
  { name: "Stats", href: "/#stats" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur border-b border-lilac-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-lilac-200 grid place-items-center shadow-soft border border-lilac-300 overflow-hidden">
            <img src="/nyc-cat-logo.png" alt="NYC Cat Tracker" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-wide text-lilac-800">NYC CAT TRACKER</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-lilac-700 text-sm">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="hover:text-lilac-900 transition">
              {item.name}
            </Link>
          ))}
          <Link
            href="/#report"
            className="rounded-full bg-lilac-300 text-lilac-900 px-4 py-2 text-sm font-medium shadow-soft hover:bg-lilac-400 transition"
          >
            Report a cat
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-lilac-800 hover:bg-lilac-100"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-lilac-100 bg-cream-50/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-lilac-800 hover:bg-lilac-100"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/#report"
              onClick={() => setOpen(false)}
              className="block text-center rounded-full bg-lilac-300 px-4 py-2 text-base font-medium text-lilac-900 shadow-soft hover:bg-lilac-400"
            >
              Report a cat
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
