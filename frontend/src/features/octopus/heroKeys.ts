/*
This file lets the hero headline tell the octopus which key to press, so the Tab on screen and the Tab the octopus
presses happen together.
Edit this file when the headline should trigger other keys.
Do not copy this file. Import pressHeroKey / onHeroKey instead.
*/

export type HeroKey = "tab" | "delete";

/** How long the arm needs to travel to the key; the headline waits this long before it shows the press. */
export const HERO_KEY_TRAVEL_MS = 170;

const bus = new EventTarget();

export function pressHeroKey(key: HeroKey, holdMs = 0): void {
  bus.dispatchEvent(new CustomEvent("press", { detail: { key, holdMs } }));
}

export function onHeroKey(listener: (key: HeroKey, holdMs: number) => void): () => void {
  const handler = (event: Event) => {
    const { key, holdMs } = (event as CustomEvent<{ key: HeroKey; holdMs: number }>).detail;
    listener(key, holdMs);
  };
  bus.addEventListener("press", handler);
  return () => bus.removeEventListener("press", handler);
}
