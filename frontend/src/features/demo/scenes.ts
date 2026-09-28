/*
This file lists the pretend apps in the website demo: what is on screen, what Octype may suggest, and the autoplay script.
Edit this file when you want different demo apps, messages, or suggestions.
Copy one scene object when you add another demo app tab.
*/

export type DemoStep = { kind: "type"; text: string } | { kind: "key"; key: "word" | "all" } | { kind: "wait"; ms: number };

export type Scene = {
  id: "messages" | "mail" | "notes";
  tab: string;
  placeholder: string;
  candidates: string[];
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
