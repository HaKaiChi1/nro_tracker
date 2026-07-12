import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { ServerSelect } from "./ServerSelect";
import { NavLinks } from "./NavLinks";
import { config } from "@/lib/config";
import { getSelectedServer } from "@/lib/server-selection";

export async function Nav() {
  const server = await getSelectedServer();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🐉 NRO Track
          </Link>
          <ServerSelect servers={config.servers} current={server} />
        </div>

        <NavLinks />

        <ThemeToggle />
      </div>
    </header>
  );
}
