import { createFileRoute, Link } from "@tanstack/react-router";
import { Captions, Scissors, SwatchBook, Type } from "lucide-react";
import { Shell } from "@/components/etagere/shell";

export const Route = createFileRoute("/")({ component: Home });

const PLUGINS = [
  {
    href: "/titres",
    name: "Titres animés",
    ready: true,
    blurb: "Un bandeau avec ton nom, déjà en mouvement.",
    icon: Type,
  },
  {
    href: "/gout",
    name: "Le goût",
    ready: true,
    blurb: "Quoi garder, quoi couper, et où poser le titre.",
    icon: Scissors,
  },
  {
    href: null,
    name: "Sous-titres",
    ready: false,
    blurb: "Les paroles, écrites au rythme de la voix.",
    icon: Captions,
  },
  {
    href: null,
    name: "Mon style",
    ready: false,
    blurb: "Tes habitudes, pour que chaque outil te ressemble.",
    icon: SwatchBook,
  },
] as const;

function Home() {
  return (
    <Shell>
      <p className="text-sm text-amber">Tes outils vidéo, au même endroit</p>
      <h1 className="mt-2 max-w-xl text-4xl text-cream sm:text-5xl">
        Une étagère. Tu prends seulement ce qu’il te faut.
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted">
        Deux outils marchent déjà. Les titres s’animent tout de suite. Le goût te propose un montage, et il
        retient tes oui et tes non sur cet appareil. Rien n’est envoyé ailleurs.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {PLUGINS.map((plugin) => {
          const Icon = plugin.icon;
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stage text-amber">
                  <Icon aria-hidden size={20} />
                </span>
                <span className={`text-xs ${plugin.ready ? "text-amber" : "text-muted"}`}>
                  {plugin.ready ? "Prêt" : "Bientôt"}
                </span>
              </div>
              <h2 className="mt-4 text-2xl text-cream">{plugin.name}</h2>
              <p className="mt-1 text-sm text-muted">{plugin.blurb}</p>
            </>
          );

          return (
            <li key={plugin.name}>
              {plugin.href ? (
                <Link
                  to={plugin.href}
                  className="flex h-full flex-col rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-amber"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex h-full flex-col rounded-2xl border border-line bg-panel p-4 opacity-70">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
