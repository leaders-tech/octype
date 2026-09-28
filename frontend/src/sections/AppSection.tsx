/*
This file shows the Octype app window and the short list of what it lets you control.
Edit this file when the app features worth showing change.
Do not copy this file. The window itself lives in features/showcase.
*/

import { AppWindow } from "../features/showcase/AppWindow";
import { TentacleBullet } from "../features/tentacles/TentacleBullet";

const POINTS = [
  ["Lives in the menu bar", "Pause for an hour, or switch Octype off for the app you're in, right from the octopus icon."],
  ["Counts what you save", "Words and time saved each day, your accept rate, and the apps where it helps the most."],
  ["Pick your model", "1.7B is the fastest, 4B gives the best quality, 8B is the smartest if you have memory to spare."],
  ["Knows who you are", "Add an About me and your signature, email or city get filled in for you."],
];

export function AppSection() {
  return (
    <section className="section" id="app">
      <div className="section-head">
        <p className="kicker">The app</p>
        <h2>A quiet menu bar app with a friendly window.</h2>
        <p>Click around: this is the real Octype window, rebuilt for the web with sample numbers.</p>
      </div>
      <div className="app-showcase">
        <AppWindow />
        <ul className="app-points">
          {POINTS.map(([title, text], i) => (
            <li key={title}>
              <TentacleBullet seed={i} />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
