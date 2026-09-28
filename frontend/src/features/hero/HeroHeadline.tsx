/*
This file animates the hero headline like Octype itself: a gray suggestion streams in, then Tab accepts it word by word.
Edit this file when the headline phrases or their timing change.
Do not copy this file. The real demo lives in features/demo.
*/

import { useEffect, useState } from "react";
import { nextWordEnd } from "../demo/suggest";
import { HERO_KEY_TRAVEL_MS, pressHeroKey } from "../octopus/heroKeys";

const HEADLINE_PHRASES = ["everything you type.", "every app on your Mac.", "every chat and email."];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState(0);
  const [shown, setShown] = useState(0);
  const [tab, setTab] = useState(false);
  const phrase = HEADLINE_PHRASES[index];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAccepted(HEADLINE_PHRASES[0].length);
      setShown(HEADLINE_PHRASES[0].length);
      return;
    }
    let cancelled = false;
    const run = async () => {
      let i = 0;
      while (!cancelled) {
        const text = HEADLINE_PHRASES[i];
        setIndex(i);
        setAccepted(0);
        setShown(0);
        await sleep(500);
        // Stream the suggestion in, one word at a time.
        for (let end = 0; end < text.length && !cancelled; ) {
          end = nextWordEnd(text, end);
          setShown(end);
          await sleep(110);
        }
        await sleep(1000);
        // Accept it with Tab, word by word.
        for (let end = 0; end < text.length && !cancelled; ) {
          end = nextWordEnd(text, end);
          // The octopus reaches for Tab first; the word turns solid when its arm lands on the key.
          pressHeroKey("tab");
          await sleep(HERO_KEY_TRAVEL_MS);
          if (cancelled) return;
          setTab(true);
          setAccepted(end);
          await sleep(140);
          setTab(false);
          await sleep(300);
        }
        await sleep(2600);
        // Backspace it away before the next phrase, with the octopus holding delete.
        pressHeroKey("delete", text.length * 20);
        await sleep(HERO_KEY_TRAVEL_MS);
        for (let end = text.length; end >= 0 && !cancelled; end--) {
          setAccepted(end);
          setShown(end);
          await sleep(20);
        }
        i = (i + 1) % HEADLINE_PHRASES.length;
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <h1 className="hero-title" aria-label={`Autocomplete for ${HEADLINE_PHRASES[0]}`}>
      <span aria-hidden="true">
        Autocomplete for
        <br />
        {/* Invisible copies of every phrase give the line the size of the longest one, so switching phrases never moves the page. */}
        <span className="hero-line">
          {HEADLINE_PHRASES.map((p) => (
            <span key={p} className="hero-sizer">
              {p}
              <kbd className="hero-tab">Tab</kbd>
            </span>
          ))}
          <span className="hero-live">
            <span className="hero-typed">{phrase.slice(0, accepted)}</span>
            <span className="hero-caret" />
            <span className="hero-ghost">{phrase.slice(accepted, Math.max(accepted, shown))}</span>
            {/* The rest of the phrase stays invisible but keeps its space, so nothing reflows while it streams in. */}
            <span className="hero-hidden">{phrase.slice(Math.max(accepted, shown))}</span>
            <kbd className={tab ? "hero-tab is-pressed" : "hero-tab"}>Tab</kbd>
          </span>
        </span>
      </span>
    </h1>
  );
}
