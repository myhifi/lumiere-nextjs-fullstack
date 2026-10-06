import { INTENT_KEYWORDS, type IntentKey } from "./knowledge-base";

// ═══════════════════════════════════════════════════
// 🎯 Intent Matcher — pure function
// ═══════════════════════════════════════════════════
// When two intents tie on score (e.g. "cancel my
// reservation" hits both), we resolve by this explicit
// priority list — NOT by the order of keys in the
// knowledge base. Specific actions beat broader topics.

const MIN_SCORE = 1;

// Lower index = higher priority on tie
const PRIORITY: IntentKey[] = [
  "cancel",
  "allergies",
  "halal",
  "vegetarian",
  "events",
  "parking",
  "location",
  "hours",
  "reservation",
  "menu",
];

const PRIORITY_INDEX = new Map<IntentKey, number>(
  PRIORITY.map((k, i) => [k, i])
);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectIntent(rawQuery: string): IntentKey | null {
  const query = normalize(rawQuery);
  if (!query) return null;

  let bestIntent: IntentKey | null = null;
  let bestScore = 0;

  for (const [intentKey, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const intent = intentKey as IntentKey;

    let score = 0;
    const seen = new Set<string>();
    for (const keyword of keywords) {
      const kw = normalize(keyword);
      if (!kw || seen.has(kw)) continue;
      seen.add(kw);

      const isLatin = /^[a-z0-9 ]+$/.test(kw);
      const matched = isLatin
        ? new RegExp(`\\b${escapeRegex(kw)}\\b`).test(query)
        : query.includes(kw);

      if (matched) score += kw.length >= 4 ? 2 : 1;
    }

    const currentPriority =
      bestIntent !== null
        ? PRIORITY_INDEX.get(bestIntent) ?? Number.MAX_SAFE_INTEGER
        : Number.MAX_SAFE_INTEGER;
    const candidatePriority =
      PRIORITY_INDEX.get(intent) ?? Number.MAX_SAFE_INTEGER;

    const isBetter =
      score > bestScore ||
      (score === bestScore && score > 0 && candidatePriority < currentPriority);

    if (isBetter) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore >= MIN_SCORE ? bestIntent : null;
}