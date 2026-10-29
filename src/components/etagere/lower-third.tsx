import type { TitleStyle } from "@/lib/etagere/model";

const STYLE_LABEL: Record<TitleStyle, string> = {
  nuit: "Nuit",
  papier: "Papier",
  signal: "Signal",
};

export function LowerThird({
  line1,
  line2,
  style,
  playKey,
}: {
  line1: string;
  line2: string;
  style: TitleStyle;
  playKey: number;
}) {
  const name = line1.trim() || "Ton nom";
  const role = line2.trim() || "Ton rôle";
  const words = name.split(/\s+/).filter(Boolean);

  return (
    <div
      key={playKey}
      className={`relative aspect-video overflow-hidden rounded-2xl border border-line ${
        style === "papier" ? "bg-cream text-ink" : "bg-stage text-cream"
      }`}
      aria-label={`Aperçu du titre, style ${STYLE_LABEL[style]}`}
    >
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <div className="et-mark-line" />
        <div className="et-mark-ring" />
        <div className="et-mark-ring-lg" />
      </div>

      {style === "nuit" && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="et-wipe mb-3 h-1 w-16 bg-amber" />
          <p className="et-rise font-display text-3xl leading-none sm:text-5xl" style={{ animationDelay: "0.12s" }}>
            {name}
          </p>
          <p className="et-rise mt-2 text-sm text-muted sm:text-base" style={{ animationDelay: "0.28s" }}>
            {role}
          </p>
        </div>
      )}

      {style === "papier" && (
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto">
          <div className="et-rise et-card max-w-sm rounded-xl bg-cream px-4 py-3" style={{ animationDelay: "0.05s" }}>
            <div className="et-wipe mb-2 h-0.5 w-10 bg-amber" />
            <p className="font-display text-2xl leading-none text-ink sm:text-4xl">{name}</p>
            <p className="mt-1 text-sm text-amber-ink">{role}</p>
          </div>
        </div>
      )}

      {style === "signal" && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8">
          <p className="font-display text-4xl leading-[0.9] sm:text-6xl">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="et-word" style={{ animationDelay: `${index * 0.08}s` }}>
                {word}
              </span>
            ))}
          </p>
          <p className="et-rise et-kicker mt-3 text-sm text-amber" style={{ animationDelay: "0.35s" }}>
            {role}
          </p>
        </div>
      )}
    </div>
  );
}

export const TITLE_STYLES: { id: TitleStyle; name: string; hint: string }[] = [
  { id: "nuit", name: "Nuit", hint: "Bandeau sombre" },
  { id: "papier", name: "Papier", hint: "Carte claire" },
  { id: "signal", name: "Signal", hint: "Gros titre" },
];
