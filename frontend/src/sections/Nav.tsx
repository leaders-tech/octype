/*
This file is the sticky top bar with the logo, section links, and the download button.
Edit this file when the page sections or the top links change.
Do not copy this file. There is one top bar for the whole page.
*/

import type { Release } from "../shared/types";
import { downloadHref } from "../features/release/useLatestRelease";

export function Nav({ release }: { release: Release }) {
  return (
    <header className="nav">
      <a className="brand" href="#top" aria-label="Octype home">
        <img src="/icon.png" alt="" width={30} height={30} />
        <span>Octype</span>
      </a>
      <nav aria-label="Sections">
        <a href="#try">Try it</a>
        <a href="#app">The app</a>
        <a href="#privacy">Privacy</a>
        <a href="#install">Install</a>
      </nav>
      <a className="button button-small" href={downloadHref(release)}>
        Download
      </a>
    </header>
  );
}
