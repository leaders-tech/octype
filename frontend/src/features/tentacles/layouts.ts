/*
This file decides where the octopus arms grow in each section and how big they are.
Edit this file when arms should start somewhere else, be longer or shorter, or when a section gets arms.
Copy one layout function when you add arms to another section.
*/

import type { TentacleLayout } from "./TentacleCanvas";
import type { TentacleSpec } from "./tentacle";

/** Hero: an octopus hides just below the fold and fans its arms out and up, like the app icon. */
export const heroLayout: TentacleLayout = ({ width, height }, host) => {
  const narrow = width < 720;
  const count = narrow ? 6 : 8;
  const center = { x: width / 2, y: height + (narrow ? 40 : 70) };
  const radius = Math.min(width * 0.16, 190);
  const thickness = Math.max(16, Math.min(width * 0.026, 36));
  const spread = narrow ? 1.05 : 1.2;

  // Arms stay below the hero text in the middle, and may climb higher at the empty sides.
  const content = host.querySelector(".hero-meta");
  const contentBottom = content ? content.getBoundingClientRect().bottom - host.getBoundingClientRect().top + 28 : height * 0.6;
  const riseCenter = Math.max(120, center.y - contentBottom);
  const riseEdge = Math.max(riseCenter, height * (narrow ? 0.45 : 0.62));
  const specs: TentacleSpec[] = [];

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1); // 0 = far left, 1 = far right
    const side = u < 0.5 ? -1 : 1;
    const outward = Math.abs(u - 0.5) * 2; // 0 in the middle, 1 at the edges
    const angle = -Math.PI / 2 + (u - 0.5) * 2 * spread;
    const base = { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius * 0.55 };
    const rise = riseCenter + (riseEdge - riseCenter) * Math.pow(outward, 1.3) - (center.y - base.y);
    const across = width * (narrow ? 0.52 : 0.46);
    const length = Math.min(rise / Math.max(0.3, Math.abs(Math.sin(angle))), across / Math.max(0.3, Math.abs(Math.cos(angle))));
    specs.push({
      base,
      angle,
      length: Math.max(90, length * (0.92 + 0.08 * Math.sin(i * 2.1))),
      width: thickness * (0.88 + 0.24 * outward),
      curl: side * (0.95 + 0.25 * outward),
      sway: 0.9 + 0.35 * Math.sin(i * 1.7),
      speed: 0.75 + 0.1 * ((i * 7) % 3),
      phase: i * 1.3,
      tone: i % 2 === (count === 8 ? 1 : 0) ? "front" : "back",
    });
  }
  return specs;
};

/** Privacy band: arms curl in from both sides, holding your words close. */
export const privacyLayout: TentacleLayout = ({ width, height }) => {
  if (width < 900) return [];
  const length = Math.min(width * 0.2, 300);
  const thickness = Math.min(width * 0.022, 30);
  const rows = [0.3, 0.72];
  return rows.flatMap((row, i) => [
    {
      base: { x: -20, y: height * row },
      angle: -0.25 + i * 0.4,
      length: length * (1 - i * 0.12),
      width: thickness,
      curl: i === 0 ? 1.05 : -1.05,
      sway: 1,
      speed: 0.7,
      phase: i * 2,
      tone: i === 0 ? "front" : "back",
    },
    {
      base: { x: width + 20, y: height * (row + 0.06) },
      angle: Math.PI + 0.25 - i * 0.4,
      length: length * (0.9 + i * 0.1),
      width: thickness,
      curl: i === 0 ? -1.05 : 1.05,
      sway: 1,
      speed: 0.8,
      phase: 1 + i * 2,
      tone: i === 0 ? "back" : "front",
    },
  ]);
};
