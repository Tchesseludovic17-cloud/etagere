export type TitleStyle = "nuit" | "papier" | "signal";
export type Verdict = "yes" | "no";

export type Beat = {
  id: string;
  at: number;
  who: string;
  text: string;
};

export type Suggestion = {
  id: string;
  tone: "cut" | "keep" | "title";
  at: number;
  until: number;
  title: string;
  why: string;
};

export const DEFAULT_SCRIPT = `0:00 — Awa
Aujourd'hui on parle de comment couper une interview sans que ça se voie.

0:08 — Awa
Euh… attends, je recommence.

0:12 — Awa
Une bonne coupe, c'est quand on garde la réaction, pas la question.

0:22 — Invité
Moi je laisse toujours deux secondes de silence. Ça laisse l'idée atterrir.

0:31 — Awa
Voilà. C'est ça, le goût.`;

const CLOCK = /^(\d{1,2}):(\d{2})\s*[—–-]\s*(.+)$/;
const FALSE_START = /euh|heu|hum+|recommenc|attends|on reprend|je reprends/i;

export function parseScript(raw: string): Beat[] {
  const lines = raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const beats: Beat[] = [];
  let pending: { at: number; who: string } | null = null;
  let auto = 0;

  for (const line of lines) {
    const match = line.match(CLOCK);
    if (match) {
      pending = {
        at: Number(match[1]) * 60 + Number(match[2]),
        who: match[3].trim(),
      };
      continue;
    }
    const at = pending ? pending.at : auto;
    const who = pending ? pending.who : "Voix";
    if (!pending) auto += 8;
    beats.push({ id: `b${beats.length}`, at, who, text: line });
    pending = null;
  }

  return beats;
}

function endOf(beats: Beat[], index: number) {
  return beats[index + 1]?.at ?? beats[index].at + 6;
}

function short(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 78 ? `${clean.slice(0, 75)}…` : clean;
}

export function suggest(beats: Beat[], titleName: string): Suggestion[] {
  if (beats.length === 0) return [];
  const out: Suggestion[] = [];

  beats.forEach((beat, index) => {
    if (!FALSE_START.test(beat.text)) return;
    out.push({
      id: `cut-${index}`,
      tone: "cut",
      at: beat.at,
      until: endOf(beats, index),
      title: "Couper ce passage",
      why: `« ${short(beat.text)} » est un faux départ. On peut s'en passer.`,
    });
  });

  let best = -1;
  let bestScore = 0;
  beats.forEach((beat, index) => {
    if (FALSE_START.test(beat.text)) return;
    const score = beat.text.split(/\s+/).length;
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });

  if (best >= 0) {
    const beat = beats[best];
    out.push({
      id: `keep-${best}`,
      tone: "keep",
      at: beat.at,
      until: endOf(beats, best),
      title: "Garder cette phrase",
      why: "C'est la phrase la plus claire. C'est elle qui doit rester.",
    });
  }

  const silence = beats.findIndex((beat) => /silence|respire|pause/i.test(beat.text));
  if (silence >= 0) {
    const until = endOf(beats, silence);
    out.push({
      id: `air-${silence}`,
      tone: "keep",
      at: Math.max(beats[silence].at, until - 2),
      until,
      title: "Laisser respirer",
      why: "Un court silence après une idée. Ça laisse le temps de comprendre.",
    });
  }

  const name = titleName.trim() || "Ton titre";
  const spot = beats[0].at + 1;
  out.push({
    id: "title-spot",
    tone: "title",
    at: spot,
    until: spot + 4,
    title: `Poser « ${name} » ici`,
    why: "Au début, avant la phrase importante, pour ne pas cacher le visage au mauvais moment.",
  });

  return out.sort((a, b) => a.at - b.at);
}

export function formatClock(seconds: number) {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function memorySentence(verdicts: Record<string, Verdict>) {
  const entries = Object.entries(verdicts);
  if (entries.length === 0) {
    return "Rien n'est décidé. Dis oui ou non : je m'en souviendrai sur cet appareil.";
  }
  const air = entries.find(([id]) => id.startsWith("air-"));
  if (air?.[1] === "no") {
    return "Tu as retiré le silence. La prochaine fois, je proposerai de le couper.";
  }
  if (air?.[1] === "yes") {
    return "Tu gardes les silences. Je les proposerai encore.";
  }
  const nos = entries.filter(([, verdict]) => verdict === "no").length;
  const yes = entries.length - nos;
  return `${yes} oui, ${nos} non. Je m'en sers la prochaine fois, sur cet appareil.`;
}

export function planText(
  suggestions: Suggestion[],
  verdicts: Record<string, Verdict>,
  titleName: string,
) {
  const lines = [
    `Plan — ${titleName.trim() || "sans titre"}`,
    "",
  ];
  for (const item of suggestions) {
    const verdict = verdicts[item.id];
    const mark = verdict === "yes" ? "oui" : verdict === "no" ? "non" : "à voir";
    lines.push(
      `${formatClock(item.at)}–${formatClock(item.until)}  ${item.title}  (${mark})`,
    );
    lines.push(item.why);
    lines.push("");
  }
  lines.push("Tout reste sur cet appareil.");
  return lines.join("\n");
}

export function spanOf(suggestions: Suggestion[], beats: Beat[]) {
  const ends = [
    ...suggestions.map((item) => item.until),
    ...beats.map((beat) => beat.at + 4),
  ];
  return Math.max(12, ...ends);
}
