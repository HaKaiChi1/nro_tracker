import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { NavLinks } from "./NavLinks";

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          💀 NRO Track Boss
        </Link>

        <NavLinks />

        <ThemeToggle />
      </div>
    </header>
  );
}
