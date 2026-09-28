/*
This file is the tiny, fake "model" behind the website demo: it finds a gray suggestion for the typed text.
Edit this file when the demo should suggest differently or accept text in bigger or smaller steps.
Do not copy this file. Add new demo phrases to scenes.ts instead.
Octype itself runs a real language model on the Mac; this file only imitates how that feels.
*/

export const COMMON_SENTENCES = [
  "Thank you so much for your help!",
  "Thanks for the update!",
  "Thanks, that works for me.",
  "Let me check and get back to you.",
  "Let me know if you have any questions.",
  "Looking forward to it!",
  "Sounds good to me.",
  "Sorry for the late reply.",
  "Could you send me the details?",
  "Can we talk about it tomorrow?",
  "I'll send it over by the end of the day.",
  "I think that's a great idea.",
  "Have a great weekend!",
  "Happy birthday! Hope you have an amazing day.",
  "What do you think?",
  "No worries at all.",
  "See you soon!",
  "Octype is typing this for me.",
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
  "birthday",
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

/** Returns the gray text to show after `typed`, or "" when there is nothing good to suggest. */
export function suggest(typed: string, candidates: readonly string[], sentences: readonly string[] = COMMON_SENTENCES): string {
  if (!typed.trim()) return "";
  const lower = typed.toLowerCase();

  // 1. A whole message this scene expects, e.g. a reply to the chat on screen.
  for (const candidate of candidates) {
    if (candidate.length > typed.length && candidate.toLowerCase().startsWith(lower)) {
      return candidate.slice(typed.length);
    }
  }

  // 2. A common sentence that starts like the one being typed now.
  const sentence = typed.match(/(?:^|[.!?\n]\s+|\n)([^.!?\n]*)$/)?.[1] ?? "";
  if (sentence.trim()) {
    const sentenceLower = sentence.toLowerCase();
    for (const candidate of sentences) {
      if (candidate.length > sentence.length && candidate.toLowerCase().startsWith(sentenceLower)) {
        return candidate.slice(sentence.length);
      }
    }
  }

  // 3. Finish the current word.
  const word = typed.match(/(?:^|[^A-Za-z'])([A-Za-z']{2,})$/)?.[1];
  if (word) {
    const wordLower = word.toLowerCase();
    const match = COMMON_WORDS.find((w) => w.length > word.length && w.startsWith(wordLower));
    if (match) return match.slice(word.length);
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
