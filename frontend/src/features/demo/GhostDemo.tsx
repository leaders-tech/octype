/*
This file is the interactive "try it" demo: a pretend Mac app with a text field that shows gray Octype suggestions.
Edit this file when demo keys, streaming, autoplay, or the pretend desktop change.
Do not copy this file. Add demo apps in scenes.ts and their on-screen context in DemoScreens.tsx.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { REACH_DOWN_MS, TentacleCanvas, type ReachState, type TentacleLayout } from "../tentacles/TentacleCanvas";
import { SCENE_SOURCES, SCENES, type DemoStep } from "./scenes";
import { DemoContext } from "./DemoScreens";
import { nextChunk, nextWordEnd, suggest } from "./suggest";

type KeyName = "word" | "all" | "alt" | "esc";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const keyLayout: TentacleLayout = ({ width, height }, host) => {
  const key = host.querySelector<HTMLElement>('[data-tentacle-anchor="tab"]');
  if (!key || width < 360) return [];
  const hostBox = host.getBoundingClientRect();
  const box = key.getBoundingClientRect();
  const kx = box.left - hostBox.left + box.width / 2;
  const ky = box.top - hostBox.top + box.height / 2;
  // The arm comes up from below, left of the Tab key, and rests beside it until it is time to press.
  const base = { x: Math.max(12, kx - 150), y: height + 20 };
  const rest = { x: kx - box.width / 2 - 34, y: ky + 4 };
  return [
    {
      base,
      angle: Math.atan2(rest.y - base.y, rest.x - base.x),
      length: Math.hypot(rest.x - base.x, rest.y - base.y) * 1.15,
      width: 24,
      curl: -0.95,
      sway: 0.55,
      speed: 0.9,
      phase: 1.2,
      tone: "front",
    },
  ];
};

export function GhostDemo() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = SCENES[sceneIndex];
  const [typed, setTyped] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [reveal, setReveal] = useState({ for: "", end: 0 });
  const [pressed, setPressed] = useState<KeyName | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const tabKeyRef = useRef<HTMLButtonElement>(null);
  const allKeyRef = useRef<HTMLButtonElement>(null);
  const reachRef = useRef<ReachState | null>(null);

  const ghost = dismissed ? "" : suggest(typed, SCENE_SOURCES[scene.id]);
  const full = typed + ghost;
  const visibleGhost = ghost && reveal.for === full ? full.slice(typed.length, Math.max(typed.length, reveal.end)) : "";

  const live = useRef({ typed, visibleGhost });
  live.current = { typed, visibleGhost };

  // Stream a new suggestion in word by word, the way Octype does.
  useEffect(() => {
    if (!ghost) return;
    let end = live.current.typed.length;
    setReveal({ for: full, end });
    const timer = setInterval(() => {
      end = nextWordEnd(full, Math.max(end, live.current.typed.length));
      setReveal({ for: full, end });
      if (end >= full.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
    // `ghost` is derived from `full`; restarting only when the whole target text changes is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const flash = useCallback((key: KeyName) => {
    setPressed(key);
    setTimeout(() => setPressed((current) => (current === key ? null : current)), 170);
  }, []);

  const accept = useCallback(
    (key: KeyName) => {
      const { typed: now, visibleGhost: shown } = live.current;
      flash(key);
      if (key === "esc") {
        if (shown) setDismissed(true);
        return;
      }
      if (!shown) return;
      setTyped(now + (key === "all" ? shown : nextChunk(shown)));
    },
    [flash],
  );

  const send = useCallback(() => {
    const text = live.current.typed.trim();
    if (!text) return;
    setSent((list) => [...list.slice(-1), text]);
    setTyped("");
    setDismissed(false);
  }, []);

  const takeOver = () => {
    if (!autoplay) return;
    setAutoplay(false);
    setTyped("");
    setSent([]);
    setDismissed(false);
  };

  const chooseScene = (index: number) => {
    setSceneIndex(index);
    setTyped("");
    setSent([]);
    setDismissed(false);
  };

  // Keep the caret at the end after Tab inserts text, like a real accept.
  useEffect(() => {
    const field = fieldRef.current;
    if (field && document.activeElement === field) field.setSelectionRange(typed.length, typed.length);
  }, [typed]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Autoplay: type the scene's script, let the octopus press the keys, then move on to the next app.
  useEffect(() => {
    if (!autoplay || !inView) return;
    let cancelled = false;

    const press = async (key: "word" | "all") => {
      const target = key === "word" ? tabKeyRef.current : allKeyRef.current;
      reachRef.current = { target, at: performance.now(), index: 0 };
      await sleep(REACH_DOWN_MS);
      if (!cancelled) accept(key);
    };

    const run = async (step: DemoStep) => {
      if (step.kind === "wait") return sleep(step.ms);
      if (step.kind === "key") return press(step.key);
      for (const ch of step.text) {
        if (cancelled) return;
        setDismissed(false);
        setTyped((t) => t + ch);
        await sleep(ch === "\n" ? 160 : 45 + Math.random() * 70);
      }
    };

    (async () => {
      setTyped("");
      setSent([]);
      for (const step of SCENES[sceneIndex].script) {
        if (cancelled) return;
        await run(step);
      }
      if (cancelled) return;
      if (SCENES[sceneIndex].id === "messages") {
        send();
        await sleep(1800);
      }
      if (!cancelled) setSceneIndex((sceneIndex + 1) % SCENES.length);
    })();

    return () => {
      cancelled = true;
    };
  }, [autoplay, inView, sceneIndex, accept, send]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const shown = live.current.visibleGhost;
    if (event.key === "Tab" && shown) {
      event.preventDefault();
      accept(event.shiftKey ? "all" : "word");
    } else if (event.key === "ArrowRight" && event.altKey && shown) {
      event.preventDefault();
      accept("alt");
    } else if (event.key === "Escape" && shown) {
      event.preventDefault();
      accept("esc");
    } else if (event.key === "Enter" && !event.shiftKey && scene.id === "messages") {
      event.preventDefault();
      send();
    }
  };

  const onKeyButton = (key: KeyName) => {
    if (autoplay) takeOver();
    else accept(key === "alt" ? "word" : key);
    fieldRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="demo" ref={rootRef}>
      <div className="demo-tabs" role="tablist" aria-label="Demo apps">
        {SCENES.map((s, i) => (
          <button key={s.id} role="tab" aria-selected={i === sceneIndex} className="demo-tab" onClick={() => chooseScene(i)}>
            {s.tab}
          </button>
        ))}
        <span className={autoplay ? "demo-status" : "demo-status is-you"}>
          {autoplay ? "Autoplay — click the text field to try it yourself" : "Your turn: type, then press Tab"}
        </span>
      </div>

      <div className="demo-stage-wrap">
        <div className="demo-desktop">
          <div className="menubar" aria-hidden="true">
            <b>{scene.tab}</b>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span className="menubar-spacer" />
            <img src="/octopus-mono.svg" alt="" className="menubar-octopus" />
            <span>Mon 9:41</span>
          </div>

          <div className={`mac-window scene-${scene.id}`}>
            <div className="mac-titlebar">
              <span className="lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="mac-title">{scene.id === "messages" ? "Maya" : scene.id === "mail" ? "Re: Onboarding redesign" : "Notes"}</span>
            </div>

            <DemoContext scene={scene.id} sent={sent}>
              <div className="ghost-field">
                <div className="ghost-mirror" aria-hidden="true">
                  <span className="ghost-typed">{typed}</span>
                  <span className="ghost-text" data-testid="ghost">
                    {visibleGhost}
                  </span>
                  {"​"}
                </div>
                <textarea
                  ref={fieldRef}
                  aria-label={`${scene.tab} demo text field`}
                  value={typed}
                  placeholder={autoplay ? "" : scene.placeholder}
                  spellCheck={false}
                  onFocus={takeOver}
                  onChange={(event) => {
                    setTyped(event.target.value);
                    setDismissed(false);
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>
            </DemoContext>
          </div>
          <p className="demo-hint">{scene.hint}</p>
        </div>

        <div className="demo-keys" aria-label="Keys">
          <button
            ref={tabKeyRef}
            data-tentacle-anchor="tab"
            className={pressed === "word" ? "keycap is-pressed" : "keycap"}
            onClick={() => onKeyButton("word")}
          >
            <kbd>Tab</kbd>
            <span>next word</span>
          </button>
          <button ref={allKeyRef} className={pressed === "all" ? "keycap is-pressed" : "keycap"} onClick={() => onKeyButton("all")}>
            <kbd>⇧ Tab</kbd>
            <span>whole suggestion</span>
          </button>
          <button className={pressed === "alt" ? "keycap is-pressed" : "keycap"} onClick={() => onKeyButton("alt")}>
            <kbd>⌥ →</kbd>
            <span>next word</span>
          </button>
          <button className={pressed === "esc" ? "keycap is-pressed" : "keycap"} onClick={() => onKeyButton("esc")}>
            <kbd>Esc</kbd>
            <span>dismiss</span>
          </button>
        </div>
        <TentacleCanvas layout={keyLayout} reach={reachRef} className="tentacles-demo" />
      </div>
    </div>
  );
}
