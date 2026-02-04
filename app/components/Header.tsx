"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-teal-800 hover:text-teal-700"
        >
          FinanceFinder
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/search"
            className="text-sm font-medium text-stone-600 hover:text-teal-700"
          >
            Find Experts
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-stone-400">...</span>
          ) : session ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-stone-600 hover:text-teal-700"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-teal-700"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
