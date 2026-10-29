import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LowerThird, TITLE_STYLES } from "@/components/etagere/lower-third";
import { Shell } from "@/components/etagere/shell";
import { useEtagere } from "@/lib/etagere/store";

export const Route = createFileRoute("/titres")({ component: Titres });

function Titres() {
  const title = useEtagere((state) => state.title);
  const setTitle = useEtagere((state) => state.setTitle);
  const [playKey, setPlayKey] = useState(0);

  return (
    <Shell>
      <p className="text-sm text-amber">Titres animés</p>
      <h1 className="mt-2 text-4xl text-cream">Ton bandeau, en quelques mots.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Écris le nom et le rôle. Choisis un style. L’animation se joue dans le cadre. Tu pourras la poser dans
        Le goût.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <LowerThird line1={title.line1} line2={title.line2} style={title.style} playKey={playKey} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlayKey((value) => value + 1)}
              className="h-11 rounded-full bg-amber px-5 text-sm font-medium text-amber-ink"
            >
              Rejouer
            </button>
            <Link
              to="/gout"
              className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-cream"
            >
              Poser dans Le goût
            </Link>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <label className="flex flex-col gap-2 text-sm text-muted">
            Ligne principale
            <input
              value={title.line1}
              onChange={(event) => setTitle({ line1: event.target.value })}
              maxLength={42}
              className="h-11 rounded-xl border border-line bg-panel px-3 text-base text-cream"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            Sous le nom
            <input
              value={title.line2}
              onChange={(event) => setTitle({ line2: event.target.value })}
              maxLength={48}
              className="h-11 rounded-xl border border-line bg-panel px-3 text-base text-cream"
            />
          </label>
          <fieldset>
            <legend className="text-sm text-muted">Style</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TITLE_STYLES.map((item) => {
                const selected = title.style === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setTitle({ style: item.id });
                      setPlayKey((value) => value + 1);
                    }}
                    className={`flex h-16 flex-col items-start justify-center rounded-xl border px-2 text-left ${
                      selected ? "border-amber bg-cream text-ink" : "border-line bg-panel text-cream"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className={`text-xs ${selected ? "text-amber-ink" : "text-muted"}`}>{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </form>
      </div>
    </Shell>
  );
}
