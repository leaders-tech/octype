/*
This file is the dark privacy band that explains why nothing you type leaves your Mac.
Edit this file when privacy promises or the privacy arms change.
Do not copy this file. There is one privacy section.
*/

import { privacyLayout } from "../features/tentacles/layouts";
import { TentacleCanvas } from "../features/tentacles/TentacleCanvas";

const PROMISES = [
  ["On-device model", "Qwen3 runs through llama.cpp on your Mac. No servers, no account, no API keys."],
  ["Passwords skipped", "Octype never reads or suggests in password fields."],
  ["Off where you want", "Turn it off for any app from the menu bar, or pause it for an hour."],
  ["Numbers, not words", "Statistics count words and seconds. Your text is never stored for them."],
];

export function Privacy() {
  return (
    <section className="privacy" id="privacy">
      <TentacleCanvas layout={privacyLayout} className="tentacles-privacy" />
      <div className="privacy-inner">
        <p className="kicker">Privacy</p>
        <h2>Nothing you type leaves your Mac.</h2>
        <p className="privacy-lead">
          Autocomplete sees everything you write, so it should live where your writing lives. The internet is used once, to download the model from Hugging
          Face. After that Octype works offline.
        </p>
        <ul className="promises">
          {PROMISES.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
