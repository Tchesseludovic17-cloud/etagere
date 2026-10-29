import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/etagere/shell";
import {
  formatClock,
  memorySentence,
  parseScript,
  planText,
  spanOf,
  suggest,
  type Suggestion,
} from "@/lib/etagere/model";
import { useEtagere } from "@/lib/etagere/store";

export const Route = createFileRoute("/gout")({ component: Gout });

function Gout() {
  const title = useEtagere((state) => state.title);
  const script = useEtagere((state) => state.script);
  const setScript = useEtagere((state) => state.setScript);
  const verdicts = useEtagere((state) => state.verdicts);
  const setVerdict = useEtagere((state) => state.setVerdict);
  const resetScript = useEtagere((state) => state.resetScript);
  const [copied, setCopied] = useState(false);

  const beats = useMemo(() => parseScript(script), [script]);
  const suggestions = useMemo(() => suggest(beats, title.line1), [beats, title.line1]);
  const total = spanOf(suggestions, beats);
  const memory = memorySentence(verdicts);

  async function copyPlan() {
    const text = planText(suggestions, verdicts, title.line1);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Shell>
      <p className="text-sm text-amber">Le goût</p>
      <h1 className="mt-2 text-4xl text-cream">Quoi garder, quoi enlever.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Colle ton texte, ou garde l’exemple. Chaque proposition se refuse. Le titre « {title.line1 || "sans nom"} »{" "}
        vient de{" "}
        <Link to="/titres" className="text-cream underline decoration-line underline-offset-4">
          Titres
        </Link>
        .
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-panel p-4">
        <p className="text-sm text-muted">{memory}</p>
        <Timeline total={total} suggestions={suggestions} verdicts={verdicts} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted">
          Le texte de la vidéo
          <textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            rows={12}
            className="min-h-64 rounded-2xl border border-line bg-ink px-3 py-3 text-base leading-relaxed text-cream"
          />
          <button
            type="button"
            onClick={resetScript}
            className="h-11 self-start rounded-full border border-line px-4 text-sm text-cream"
          >
            Revenir à l’exemple
          </button>
        </label>

        <div className="flex flex-col gap-3">
          {suggestions.length === 0 ? (
            <p className="rounded-2xl border border-line bg-panel p-4 text-muted">
              Écris au moins une phrase. Une ligne peut commencer par un temps, comme 0:12 — Awa.
            </p>
          ) : (
            suggestions.map((item) => (
              <SuggestionCard
                key={item.id}
                item={item}
                verdict={verdicts[item.id]}
                onVerdict={(verdict) => setVerdict(item.id, verdict)}
              />
            ))
          )}
          <button
            type="button"
            onClick={() => void copyPlan()}
            disabled={suggestions.length === 0}
            className="h-11 rounded-full bg-amber px-5 text-sm font-medium text-amber-ink disabled:opacity-40"
          >
            {copied ? "Plan copié" : "Copier le plan"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Timeline({
  total,
  suggestions,
  verdicts,
}: {
  total: number;
  suggestions: Suggestion[];
  verdicts: Record<string, "yes" | "no">;
}) {
  return (
    <div className="mt-4" aria-hidden>
      <div className="relative h-8 overflow-hidden rounded-full bg-ink">
        {suggestions.map((item) => {
          const refused = verdicts[item.id] === "no";
          const left = (item.at / total) * 100;
          const width = Math.max(2, ((item.until - item.at) / total) * 100);
          const tone =
            item.tone === "cut" ? "bg-line" : item.tone === "title" ? "bg-cream" : "bg-amber";
          return (
            <span
              key={item.id}
              className={`absolute top-2 h-4 rounded-full ${tone} ${refused ? "opacity-30" : ""}`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
        <span>0:00</span>
        <span>{formatClock(total)}</span>
      </div>
    </div>
  );
}

function SuggestionCard({
  item,
  verdict,
  onVerdict,
}: {
  item: Suggestion;
  verdict: "yes" | "no" | undefined;
  onVerdict: (verdict: "yes" | "no") => void;
}) {
  return (
    <article className="rounded-2xl border border-line bg-panel p-4">
      <p className="text-xs tabular-nums text-amber">
        {formatClock(item.at)} – {formatClock(item.until)}
      </p>
      <h2 className="mt-1 text-xl text-cream">{item.title}</h2>
      <p className="mt-1 text-sm text-muted">{item.why}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          aria-pressed={verdict === "yes"}
          onClick={() => onVerdict("yes")}
          className={`h-11 flex-1 rounded-full text-sm ${
            verdict === "yes" ? "bg-amber text-amber-ink" : "border border-line text-cream"
          }`}
        >
          Oui
        </button>
        <button
          type="button"
          aria-pressed={verdict === "no"}
          onClick={() => onVerdict("no")}
          className={`h-11 flex-1 rounded-full text-sm ${
            verdict === "no" ? "bg-cream text-ink" : "border border-line text-cream"
          }`}
        >
          Pas ça
        </button>
      </div>
    </article>
  );
}
