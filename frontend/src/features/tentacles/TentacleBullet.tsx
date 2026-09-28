/*
This file draws a tiny octopus arm rolled into a spiral as an SVG list bullet, using the same outline and sucker
code as the big animated arms.
Edit this file when the bullet spiral should roll tighter, looser, or face another way.
Copy the <TentacleBullet seed={i} /> usage when another list wants arm bullets.
*/

import { useMemo } from "react";
import { SEGMENTS, tentacleSvg, type TentacleSpec, type Vec } from "./tentacle";

const TURNS = 1.45;
const RADIUS = 20;

/** A short straight arm that rolls clockwise into a shrinking spiral, rotated a little differently per bullet. */
function spiralArm(rotation: number): Vec[] {
  const tailCount = Math.round(SEGMENTS * 0.28);
  const coilCount = SEGMENTS - tailCount;
  const coil: Vec[] = [];
  for (let i = 0; i <= coilCount; i++) {
    const u = i / coilCount;
    const angle = u * TURNS * Math.PI * 2;
    const r = RADIUS * (1 - 0.8 * u);
    coil.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }
  // The tail leaves the coil against its starting direction, like the arm it grows from.
  const tail: Vec[] = [];
  for (let j = tailCount; j >= 1; j--) {
    const k = j / tailCount;
    tail.push({ x: RADIUS + k * RADIUS * 0.35, y: -k * RADIUS * 1.25 });
  }
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return [...tail, ...coil].map((p) => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }));
}

const SPEC: TentacleSpec = { base: { x: 0, y: 0 }, angle: 0, length: 0, width: 11, curl: 1, sway: 0, speed: 0, phase: 0, tone: "front" };

export function TentacleBullet({ seed = 0 }: { seed?: number }) {
  const { d, dots, viewBox } = useMemo(() => tentacleSvg(SPEC, spiralArm(Math.PI + 0.35 * Math.sin(seed * 2.1))), [seed]);
  return (
    <svg className="tentacle-bullet" viewBox={viewBox} aria-hidden="true">
      <path d={d} fill="currentColor" />
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} />
      ))}
    </svg>
  );
}
