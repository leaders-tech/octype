/*
This file is the tiny, fake "model" behind the website demo: it finds a gray suggestion for the typed text.
There is no AI on the website. Suggestions come only from sentences written for the scene on screen (scenes.ts),
so they always fit the chat, email, or note the visitor sees.
Edit this file when the demo should match typed text differently or accept text in bigger or smaller steps.
Do not copy this file. Add demo phrases to scenes.ts instead.
*/

/** Short neutral replies that fit any scene; each scene adds its own sentences before these. */
export const COMMON_SENTENCES = [
  "Thanks!",
  "Thank you!",
  "Sounds good to me.",
  "Let me check and get back to you.",
  "Looking forward to it!",
  "No worries at all.",
  "What do you think?",
];

export const COMMON_WORDS = [
  "about",
  "absolutely",
  "actually",
  "address",
  "after",
  "afternoon",
  "again",
  "already",
  "also",
  "always",
  "amazing",
  "another",
  "answer",
  "anything",
  "appreciate",
  "around",
  "available",
  "awesome",
  "back",
  "because",
  "before",
  "being",
  "believe",
  "better",
  "between",
  "book",
  "business",
  "calendar",
  "call",
  "change",
  "check",
  "coffee",
  "come",
  "company",
  "could",
  "couple",
  "dinner",
  "definitely",
  "details",
  "different",
  "document",
  "does",
  "doing",
  "done",
  "during",
  "each",
  "early",
  "email",
  "enough",
  "especially",
  "evening",
  "even",
  "every",
  "everything",
  "exactly",
  "excited",
  "feedback",
  "feel",
  "few",
  "find",
  "first",
  "follow",
  "forward",
  "free",
  "friday",
  "friend",
  "from",
  "getting",
  "give",
  "going",
  "good",
  "great",
  "happy",
  "have",
  "hello",
  "help",
  "here",
  "hope",
  "house",
  "idea",
  "important",
  "information",
  "interesting",
  "just",
  "keep",
  "know",
  "last",
  "later",
  "learn",
  "leave",
  "left",
  "less",
  "let",
  "like",
  "little",
  "long",
  "look",
  "looking",
  "lunch",
  "make",
  "maybe",
  "meeting",
  "message",
  "minutes",
  "monday",
  "month",
  "morning",
  "much",
  "need",
  "never",
  "next",
  "nice",
  "night",
  "nothing",
  "now",
  "office",
  "okay",
  "only",
  "other",
  "people",
  "perfect",
  "person",
  "place",
  "plan",
  "please",
  "possible",
  "pretty",
  "probably",
  "problem",
  "project",
  "question",
  "quick",
  "really",
  "reason",
  "remember",
  "reply",
  "right",
  "same",
  "saturday",
  "schedule",
  "second",
  "send",
  "should",
  "something",
  "sometimes",
  "soon",
  "sorry",
  "sounds",
  "start",
  "still",
  "sunday",
  "sure",
  "take",
  "talk",
  "team",
  "thank",
  "thanks",
  "that",
  "their",
  "there",
  "these",
  "thing",
  "think",
  "this",
  "those",
  "through",
  "thursday",
  "time",
  "today",
  "together",
  "tomorrow",
  "tonight",
  "tuesday",
  "update",
  "very",
  "wait",
  "want",
  "weekend",
  "wednesday",
  "week",
  "welcome",
  "well",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "without",
  "wonderful",
  "work",
  "working",
  "would",
  "write",
  "yesterday",
  "your",
];

type Word = { text: string; lower: string; start: number; end: number };

const WORD = /[\p{L}\p{N}']+/gu;
const SENTENCE_END = /[.!?\n]/;

function words(text: string): Word[] {
  return [...text.matchAll(WORD)].map((m) => ({ text: m[0], lower: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length }));
}

const cache = new WeakMap<readonly string[], { words: Word[][]; vocabulary: string[] }>();

function prepare(sources: readonly string[]) {
  let prepared = cache.get(sources);
  if (!prepared) {
    const vocabulary = new Set<string>();
    const split = sources.map((source) => {
      const ws = words(source);
      for (const w of ws) if (w.lower.length >= 3 && !/\d/.test(w.lower)) vocabulary.add(w.lower);
      return ws;
    });
    for (const w of COMMON_WORDS) vocabulary.add(w);
    prepared = { words: split, vocabulary: [...vocabulary] };
    cache.set(sources, prepared);
  }
  return prepared;
}

/**
 * If `typedWords` match the source's words starting at index `j`, return the rest of the source after them.
 * The last typed word may be unfinished ("Ram" matches "Ramen"). Spaces and punctuation typed after the last word
 * must agree with the source, except that a plain space may stand in for the source's comma or period.
 */
function continueFrom(typed: string, typedWords: Word[], source: string, sourceWords: Word[], j: number): string | null {
  const k = typedWords.length;
  const last = typedWords[k - 1];
  const trail = typed.slice(last.end);
  for (let i = 0; i < k; i++) {
    const s = sourceWords[j + i];
    if (!s) return null;
    const t = typedWords[i];
    const unfinished = i === k - 1 && trail === "";
    if (unfinished ? !s.lower.startsWith(t.lower) : s.lower !== t.lower) return null;
  }
  const matched = sourceWords[j + k - 1];
  if (trail === "") {
    const rest = source.slice(matched.start + last.text.length);
    return rest.trim() ? rest : null;
  }
  const rest = source.slice(matched.end);
  const lead = rest.match(/^[^\p{L}\p{N}']*/u)?.[0] ?? "";
  let out: string | null = null;
  if (!trail.trim()) out = rest.slice(lead.length);
  else if (lead.startsWith(trail)) out = rest.slice(trail.length);
  return out && out.trim() ? out : null;
}

/**
 * Returns the gray text to show after `typed`, or "" when nothing fits. `sources` are the sentences that make sense
 * in the current scene, best first. Tried in order:
 *   1. a source that starts with everything typed so far;
 *   2. a source sentence that starts like the sentence being typed now;
 *   3. a source that contains the last 4, 3 or 2 typed words, continued from there;
 *   4. finishing the current word.
 */
export function suggest(typed: string, sources: readonly string[]): string {
  if (!typed.trim()) return "";

  const lower = typed.toLowerCase();
  for (const source of sources) {
    if (source.length > typed.length && source.toLowerCase().startsWith(lower)) return source.slice(typed.length);
  }

  const typedWords = words(typed);
  if (!typedWords.length) return "";
  const tail = typed.slice(typedWords[typedWords.length - 1].end);
  // A finished sentence ("Sure! ") gives nothing to continue that step 1 did not already try.
  if (SENTENCE_END.test(tail)) return "";

  let first = typedWords.length - 1;
  while (first > 0 && !SENTENCE_END.test(typed.slice(typedWords[first - 1].end, typedWords[first].start))) first--;
  const sentence = typedWords.slice(first);
  const prepared = prepare(sources);

  for (let s = 0; s < sources.length; s++) {
    const sw = prepared.words[s];
    for (let j = 0; j < sw.length; j++) {
      const startsSentence = j === 0 || SENTENCE_END.test(sources[s].slice(sw[j - 1].end, sw[j].start));
      if (!startsSentence) continue;
      const out = continueFrom(typed, sentence, sources[s], sw, j);
      if (out) return out;
    }
  }

  for (let k = Math.min(4, sentence.length); k >= 2; k--) {
    const recent = sentence.slice(-k);
    for (let s = 0; s < sources.length; s++) {
      const sw = prepared.words[s];
      for (let j = 0; j < sw.length; j++) {
        const out = continueFrom(typed, recent, sources[s], sw, j);
        if (out) return out;
      }
    }
  }

  const last = typedWords[typedWords.length - 1];
  if (tail === "" && last.text.length >= 2 && !/\d/.test(last.text)) {
    const match = prepared.vocabulary.find((w) => w.length > last.lower.length && w.startsWith(last.lower));
    if (match) return match.slice(last.lower.length);
  }
  return "";
}

/** The part of the suggestion that Tab takes: leading spaces or line breaks plus one word. */
export function nextChunk(ghost: string): string {
  return ghost.match(/^\s*\S+/)?.[0] ?? ghost;
}

/** Where the next streamed word ends, so suggestions can appear word by word like in the app. */
export function nextWordEnd(text: string, from: number): number {
  const rest = text.slice(from);
  const chunk = rest.match(/^\s*\S+/)?.[0];
  return chunk ? from + chunk.length : text.length;
}
