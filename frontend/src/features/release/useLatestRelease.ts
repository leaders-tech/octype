/*
This file asks the backend for the newest Octype release so download buttons point straight at the .dmg.
Edit this file when the release endpoint or the fallback download link changes.
Copy the hook pattern here when another part of the page needs data from the backend on load.
*/

import { useEffect, useState } from "react";
import { postJson } from "../../shared/api";
import type { Release } from "../../shared/types";

export const RELEASES_PAGE = "https://github.com/levbern/Octype/releases/latest";
export const SOURCE_URL = "https://github.com/levbern/Octype";

export const FALLBACK_RELEASE: Release = {
  version: null,
  published_at: null,
  page_url: RELEASES_PAGE,
  dmg_url: null,
  dmg_size: null,
  source: "fallback",
};

export function useLatestRelease(): Release {
  const [release, setRelease] = useState<Release>(FALLBACK_RELEASE);

  useEffect(() => {
    let active = true;
    postJson<{ release: Release }>("/release/latest")
      .then((data) => {
        if (active) setRelease(data.release);
      })
      .catch((error: unknown) => {
        // The page still works with the GitHub releases link, so only note the problem for debugging.
        console.warn("Could not load the latest Octype release:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  return release;
}

export function downloadHref(release: Release): string {
  return release.dmg_url ?? release.page_url;
}

export function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  return `${Math.max(1, Math.round(bytes / 1_000_000))} MB`;
}
