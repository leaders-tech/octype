/*
This file is the "Try it" section that wraps the interactive demo with a heading and a short honest note.
Edit this file when the demo section text changes.
Do not copy this file. The demo itself lives in features/demo.
*/

import { GhostDemo } from "../features/demo/GhostDemo";

export function TrySection() {
  return (
    <section className="section" id="try">
      <div className="section-head">
        <p className="kicker">Try it</p>
        <h2>Press Tab. Keep your train of thought.</h2>
        <p>
          A gray suggestion appears where you type. Take one word with <kbd>Tab</kbd>, all of it with <kbd>⇧ Tab</kbd>, or just keep typing and it gets out of
          the way.
        </p>
      </div>
      <GhostDemo />
      <p className="footnote">
        No AI runs on this page: the demo picks from replies written for each scene, so it only knows these three conversations. The real Octype writes fresh
        suggestions with a language model on your Mac, using what's on your screen.
      </p>
    </section>
  );
}
