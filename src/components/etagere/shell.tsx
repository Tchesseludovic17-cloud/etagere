import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useEtagere } from "@/lib/etagere/store";

const LINKS = [
  { to: "/titres", label: "Titres" },
  { to: "/gout", label: "Le goût" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.resolve(useEtagere.persist.rehydrate()).then(() => setReady(true));
  }, []);

  return (
    <div className="min-h-dvh bg-ink text-cream" data-ready={ready ? "yes" : "no"}>
      <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-xl leading-none text-cream">
            Étagère
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex h-11 items-center rounded-full px-3 text-sm ${
                    active ? "bg-cream text-ink" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-16">{children}</main>
    </div>
  );
}
