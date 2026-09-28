/*
This file is the install guide: download button, the four setup steps, and system requirements.
Edit this file when the install steps or requirements change.
Copy one step object when you add another install step.
*/

import { downloadHref, formatSize } from "../features/release/useLatestRelease";
import type { Release } from "../shared/types";

const STEPS = [
  ["Drag to Applications", "Open the .dmg and drag Octype into your Applications folder."],
  ["Allow it once", "Octype isn't from the App Store, so macOS asks first. Open System Settings → Privacy & Security and click Open Anyway."],
  ["Grant Accessibility", "Octype asks for it on first launch. Screen Recording is optional and only needed for Telegram."],
  ["Wait for the model", "Octype downloads its language model (about 2.5 GB) once. Then start typing anywhere."],
];

export function Install({ release }: { release: Release }) {
  const size = formatSize(release.dmg_size);
  return (
    <section className="section" id="install">
      <div className="install">
        <div className="install-card">
          <img src="/icon.png" alt="" width={96} height={96} />
          <h2>Get Octype</h2>
          <p>Free. Unlimited. Private.</p>
          <a className="button" href={downloadHref(release)}>
            Download{release.version ? ` v${release.version}` : ""} for Mac
          </a>
          <p className="install-meta">
            {size ? `${size} · ` : ""}
            <a href={release.page_url}>Release notes</a>
          </p>
          <ul className="requirements">
            <li>Mac with Apple Silicon (M1 or newer)</li>
            <li>macOS 15 or newer</li>
            <li>About 4 GB of free disk space</li>
          </ul>
        </div>
        <ol className="install-steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="step-number">{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
