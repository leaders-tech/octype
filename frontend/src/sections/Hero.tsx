/*
This file is the first screen: the animated headline, what Octype is, the download button, and the typing octopus.
Edit this file when the main pitch or the hero buttons change.
Do not copy this file. There is one hero for the whole page.
*/

import { HeroHeadline } from "../features/hero/HeroHeadline";
import { downloadHref, formatSize } from "../features/release/useLatestRelease";
import { HeroOctopus } from "../features/octopus/HeroOctopus";
import type { Release } from "../shared/types";

export function Hero({ release }: { release: Release }) {
  const size = formatSize(release.dmg_size);
  return (
    <section className="hero" id="top">
      <HeroOctopus />
      <div className="hero-inner">
        <p className="pill">
          <span className="pill-dot" /> Free for Mac{release.version ? ` · v${release.version}` : ""} · runs 100% on your Mac
        </p>
        <HeroHeadline />
        <p className="hero-lead">
          Octype suggests your next words right at the cursor, in any app on your Mac. Press <kbd>Tab</kbd> to take them. A language model runs entirely on your
          Mac, so nothing you type ever leaves it.
        </p>
        <div className="hero-actions">
          <a className="button" href={downloadHref(release)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
            </svg>
            Download for Mac
          </a>
          <a className="button button-ghost" href="#try">
            Try it here
          </a>
        </div>
        <p className="hero-meta">Apple Silicon · macOS 15 or newer{size ? ` · ${size} app` : ""} + 2.5 GB model</p>
      </div>
    </section>
  );
}
