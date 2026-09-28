/*
This file holds the math that poses and draws one octopus arm (a "tentacle") on a 2D canvas.
Edit this file when the arm shape, its motion, its curl, or its suckers should look different.
Do not copy this file. Add new arm layouts in the component that uses it instead.
*/

export type Vec = { x: number; y: number };

export type TentacleSpec = {
  /** Where the arm grows from, in canvas CSS pixels. Usually just outside the canvas edge. */
  base: Vec;
  /** Direction the arm points at rest, in radians (-PI/2 is straight up). */
  angle: number;
  length: number;
  /** Thickness at the base, in CSS pixels. */
  width: number;
  /** Tip curl: the sign picks the direction, the size how tight it rolls up (about 0.6 to 1.2). */
  curl: number;
  /** How much the arm waves (about 0.6 to 1.6). */
  sway: number;
  speed: number;
  phase: number;
  tone: "front" | "back";
};

export type TentaclePalette = {
  front: string;
  back: string;
  frontSucker: string;
  backSucker: string;
};

export type PoseOptions = {
  /** 0..1 — how strongly the arm leans toward `lean.point`. */
  lean?: { point: Vec; amount: number };
  /** 0..1 — how far the tip reaches out to grab `reach.target`. */
  reach?: { target: Vec; amount: number };
};

export const SEGMENTS = 48;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Width of the arm at position t (0 = base, 1 = tip). */
export function widthAt(spec: TentacleSpec, t: number): number {
  return Math.max(1.2, spec.width * (0.13 + 0.87 * Math.pow(1 - t, 0.8)));
}

/**
 * Forward kinematics: walk from the base, bending a little at every joint.
 * A travelling sine wave makes the arm swim; a curvature that grows toward the tip rolls it into a spiral.
 */
export function pose(spec: TentacleSpec, time: number, options: PoseOptions = {}): Vec[] {
  const reachAmount = options.reach?.amount ?? 0;
  const leanAmount = options.lean?.amount ?? 0;
  const step = spec.length / SEGMENTS;
  const s = time * spec.speed;

  let leanTurn = 0;
  if (options.lean && leanAmount > 0) {
    const toPoint = Math.atan2(options.lean.point.y - spec.base.y, options.lean.point.x - spec.base.x);
    leanTurn = Math.max(-0.9, Math.min(0.9, wrapAngle(toPoint - spec.angle))) * leanAmount;
  }

  // Reaching or leaning toward something unrolls the tip, like an arm stretching out.
  const curlScale = (1 - 0.75 * reachAmount) * (1 - 0.45 * leanAmount) * (0.9 + 0.1 * Math.sin(s * 0.9 + spec.phase));
  let angle = spec.angle + 0.16 * spec.sway * Math.sin(s * 0.6 + spec.phase) + leanTurn * 0.35;

  const points: Vec[] = [{ ...spec.base }];
  let x = spec.base.x;
  let y = spec.base.y;
  for (let i = 1; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const wave = spec.sway * Math.sin(t * 5.2 - s * 1.7 + spec.phase) * (0.5 + 0.9 * t);
    const curl = spec.curl * curlScale * 4.2 * smoothstep(0.52, 0.8, t) * (1 / (1.1 - t));
    const lean = leanTurn * 0.65 * (t < 0.7 ? 1 : 0.3);
    angle += (wave + curl + lean) / SEGMENTS;
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    points.push({ x, y });
  }

  if (options.reach && reachAmount > 0) {
    const reached = fabrik(points, options.reach.target);
    return points.map((p, i) => ({
      x: p.x + (reached[i].x - p.x) * reachAmount,
      y: p.y + (reached[i].y - p.y) * reachAmount,
    }));
  }
  return points;
}

/** FABRIK inverse kinematics: drag the tip to `target` while the base stays put and segment lengths stay the same. */
export function fabrik(points: Vec[], target: Vec, iterations = 12): Vec[] {
  const pts = points.map((p) => ({ ...p }));
  const n = pts.length;
  const lengths: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    lengths.push(Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y));
  }
  const base = { ...pts[0] };

  for (let k = 0; k < iterations; k++) {
    pts[n - 1] = { ...target };
    for (let i = n - 2; i >= 0; i--) {
      placeAt(pts[i], pts[i + 1], lengths[i]);
    }
    pts[0] = { ...base };
    for (let i = 1; i < n; i++) {
      placeAt(pts[i], pts[i - 1], lengths[i - 1]);
    }
  }
  return pts;
}

function placeAt(point: Vec, anchor: Vec, length: number): void {
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const d = Math.hypot(dx, dy) || 1;
  point.x = anchor.x + (dx / d) * length;
  point.y = anchor.y + (dy / d) * length;
}

/** Fill the arm as one smooth tapered shape with a round tip, then dot suckers along the inner side of the curl. */
export function drawTentacle(ctx: CanvasRenderingContext2D, spec: TentacleSpec, points: Vec[], palette: TentaclePalette): void {
  const n = points.length;
  const left: Vec[] = [];
  const right: Vec[] = [];
  const normals: Vec[] = [];

  for (let i = 0; i < n; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const half = widthAt(spec, i / (n - 1)) / 2;
    normals.push({ x: nx, y: ny });
    left.push({ x: points[i].x + nx * half, y: points[i].y + ny * half });
    right.push({ x: points[i].x - nx * half, y: points[i].y - ny * half });
  }

  ctx.beginPath();
  traceSmooth(ctx, left, true);
  const tip = points[n - 1];
  const tipRadius = widthAt(spec, 1) / 2;
  const tipNormal = normals[n - 1];
  const start = Math.atan2(tipNormal.y, tipNormal.x);
  // The left edge is +normal, which is 90° past the tangent, so sweeping back through the tangent rounds the front of the tip.
  ctx.arc(tip.x, tip.y, tipRadius, start, start - Math.PI, true);
  traceSmooth(ctx, right.slice().reverse(), false);
  ctx.closePath();
  ctx.fillStyle = spec.tone === "front" ? palette.front : palette.back;
  ctx.fill();

  // Suckers sit on the inside of the curl, where a real octopus keeps them.
  const side = spec.curl >= 0 ? 1 : -1;
  ctx.fillStyle = spec.tone === "front" ? palette.frontSucker : palette.backSucker;
  for (let i = 6; i < n - 5; i += 3) {
    const t = i / (n - 1);
    const w = widthAt(spec, t);
    const r = w * 0.16;
    if (r < 1.1) continue;
    const p = points[i];
    const nrm = normals[i];
    ctx.beginPath();
    ctx.arc(p.x + nrm.x * side * w * 0.26, p.y + nrm.y * side * w * 0.26, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function traceSmooth(ctx: CanvasRenderingContext2D, pts: Vec[], moveFirst: boolean): void {
  if (moveFirst) ctx.moveTo(pts[0].x, pts[0].y);
  else ctx.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
}
