/*
This file lists the pretend apps in the website demo: what is on screen, what Octype may suggest, and the autoplay script.
Edit this file when you want different demo apps, messages, or suggestions.
Copy one scene object when you add another demo app tab.
*/

import { COMMON_SENTENCES } from "./suggest";

export type DemoStep = { kind: "type"; text: string } | { kind: "key"; key: "word" | "all" } | { kind: "wait"; ms: number };

export type Scene = {
  id: "messages" | "mail" | "notes";
  tab: string;
  placeholder: string;
  /** Whole messages this scene expects; the autoplay script types the start of one of them. */
  candidates: string[];
  /** More sentences that fit what is on screen, so free typing gets suggestions that make sense here. */
  sentences: string[];
  script: DemoStep[];
  hint: string;
};

const words = (count: number): DemoStep[] =>
  Array.from({ length: count }, () => [{ kind: "key", key: "word" } as const, { kind: "wait", ms: 420 } as const]).flat();

export const ABOUT_ME = "Alex Chen, product designer at Northwind. alex@northwind.co";

export const SCENES: Scene[] = [
  {
    id: "messages",
    tab: "Messages",
    placeholder: "Reply to Maya…",
    hint: "Octype reads the chat you're replying to.",
    candidates: [
      "Yes, absolutely! What time works for you?",
      "Yes! Ramen sounds perfect. Should we meet at 7 at the office?",
      "Sounds great, see you there at 7!",
      "Sorry, something came up. Can we move it to Friday?",
      "Of course! Send me the address and I'll book a table.",
      "I'm in! Is it the place next to the bookstore?",
    ],
    sentences: [
      "Still on! Can't wait to try it.",
      "Sure! What time works for you?",
      "Ok, see you at the office at 7!",
      "Hey! Yes, dinner tomorrow sounds great.",
      "Hi! Tomorrow works for me.",
      "Definitely! I've been craving ramen all week.",
      "Sounds good! Can we make it 7:30? I have a meeting until 7.",
      "Can't wait! I'll meet you in the lobby at 7.",
      "Tomorrow works. What's the name of the place?",
      "Perfect, I'll book a table for two.",
      "Absolutely, see you tomorrow!",
      "I might be a bit late. Is 7:30 okay?",
      "Do they have vegetarian ramen?",
      "No way, I was about to suggest ramen too!",
      "What time should we meet?",
      "Where exactly is it?",
      "How about we meet at the office at 7?",
      "Should I invite Leo too?",
      "Let's go right after work.",
      "Thanks for finding it! See you tomorrow.",
      "Is it the one with the long line outside?",
      "Great, I'll bring my appetite!",
    ],
    script: [
      { kind: "wait", ms: 700 },
      { kind: "type", text: "Yes! R" },
      { kind: "wait", ms: 900 },
      ...words(3),
      { kind: "wait", ms: 300 },
      { kind: "key", key: "all" },
      { kind: "wait", ms: 2600 },
    ],
  },
  {
    id: "mail",
    tab: "Mail",
    placeholder: "Write your reply…",
    hint: "Your name and details come from About me.",
    candidates: [
      "Hi Sam,\n\nThanks for the update! The new onboarding flow looks great. I'll review the designs today and send my notes by Friday.\n\nBest,\nAlex Chen\nProduct Designer, Northwind",
      "Hi Sam,\n\nThanks for sending this over. Could we find 30 minutes on Thursday to go through it together?\n\nBest,\nAlex Chen\nProduct Designer, Northwind",
    ],
    sentences: [
      "Thanks for the update!",
      "Thanks for sending this over.",
      "The new onboarding flow looks great.",
      "I love the new welcome screen.",
      "The progress bar makes the flow much clearer.",
      "I'll review the designs today and send my notes by Friday.",
      "Could we find 30 minutes on Thursday to go through it together?",
      "A few small notes on the second step:",
      "I'd keep the skip button on the first screen.",
      "Can you share the Figma link?",
      "Great work on this, Sam!",
      "Let me know if you need anything from me.",
      "Looking forward to seeing the final version.",
      "You can reach me at alex@northwind.co.",
      "Best,\nAlex Chen\nProduct Designer, Northwind",
      "Cheers,\nAlex",
      "Thanks,\nAlex Chen",
    ],
    script: [
      { kind: "wait", ms: 700 },
      { kind: "type", text: "Hi Sam,\n\nThanks for the u" },
      { kind: "wait", ms: 900 },
      ...words(5),
      { kind: "wait", ms: 300 },
      { kind: "key", key: "all" },
      { kind: "wait", ms: 3000 },
    ],
  },
  {
    id: "notes",
    tab: "Notes",
    placeholder: "Start writing…",
    hint: "It works in any text field: notes, docs, browsers, Slack.",
    candidates: [
      "Lisbon trip\n\nThings to pack: passport, charger, sunscreen and a light jacket for the evenings.",
      "Lisbon trip\n\nDay 1: walk around Alfama, ride tram 28 and watch the sunset from the Miradouro.",
    ],
    sentences: [
      "Things to pack: passport, charger, sunscreen and a light jacket for the evenings.",
      "Day 1: walk around Alfama, ride tram 28 and watch the sunset from the Miradouro.",
      "Day 2: day trip to Sintra, Pena Palace in the morning.",
      "Day 3: LX Factory, then pastéis de nata in Belém.",
      "Book the Sintra train tickets in advance.",
      "Try the bacalhau at a small local tasca.",
      "Flights: Friday 8:40, back on Monday evening.",
      "Hotel: near Praça do Comércio, check-in after 3 pm.",
      "Budget: about 600 euros for four days.",
      "Buy a Viva Viagem card for the metro and trams.",
      "Restaurants to try: Cervejaria Ramiro, Time Out Market.",
      "Remember to bring comfortable shoes, the hills are steep.",
    ],
    script: [
      { kind: "wait", ms: 700 },
      { kind: "type", text: "Lisbon trip\n\nDay" },
      { kind: "wait", ms: 900 },
      ...words(4),
      { kind: "wait", ms: 300 },
      { kind: "key", key: "all" },
      { kind: "wait", ms: 2600 },
    ],
  },
];

/** Everything a scene may suggest from, best matches first. */
export const SCENE_SOURCES: Record<Scene["id"], string[]> = Object.fromEntries(
  SCENES.map((scene) => [scene.id, [...scene.candidates, ...scene.sentences, ...COMMON_SENTENCES]]),
) as Record<Scene["id"], string[]>;
