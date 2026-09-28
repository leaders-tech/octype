/*
This file decides where the loose octopus arms grow in a section and how big they are.
Edit this file when arms should start somewhere else, be longer or shorter, or when a section gets arms.
Copy one layout function when you add arms to another section.
*/

import type { TentacleLayout } from "./TentacleCanvas";

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
