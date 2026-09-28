/*
This file is the page footer with the logo and outside links.
Edit this file when footer links change.
Do not copy this file. There is one footer.
*/

import { RELEASES_PAGE, SOURCE_URL } from "../features/release/useLatestRelease";

export function Footer() {
  return (
    <footer className="footer">
      <div className="brand">
        <img src="/icon.png" alt="" width={26} height={26} />
        <span>Octype</span>
      </div>
      <p>Autocomplete for everything you type. Made with eight arms.</p>
      <nav aria-label="Links">
        <a href={SOURCE_URL}>GitHub</a>
        <a href={RELEASES_PAGE}>Releases</a>
        <a href="#top">Back to top ↑</a>
      </nav>
    </footer>
  );
}
