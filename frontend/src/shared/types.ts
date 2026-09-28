/*
This file keeps the small shared TypeScript types for API results and the latest release.
Edit this file when backend JSON shapes change.
Copy a type pattern here when you add another shared API type.
*/

export type ApiOk<T> = {
  ok: true;
  data: T;
};

export type ApiFail = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiOk<T> | ApiFail;

export type Release = {
  version: string | null;
  published_at: string | null;
  page_url: string;
  dmg_url: string | null;
  dmg_size: number | null;
  source: "github" | "fallback";
};
