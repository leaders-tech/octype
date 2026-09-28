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

type Outline = { left: Vec[]; right: Vec[]; normals: Vec[] };

/** The two edges of the arm: the centre line pushed out by half the width on each side. */
export function outline(spec: TentacleSpec, points: Vec[]): Outline {
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
  return { left, right, normals };
}

/** Suckers sit on the inside of the curl, where a real octopus keeps them. */
export function suckers(spec: TentacleSpec, points: Vec[], normals: Vec[]): { x: number; y: number; r: number }[] {
  const n = points.length;
  const side = spec.curl >= 0 ? 1 : -1;
  const dots: { x: number; y: number; r: number }[] = [];
  for (let i = 6; i < n - 5; i += 3) {
    const w = widthAt(spec, i / (n - 1));
    const r = w * 0.16;
    if (r < 1.1) continue;
    dots.push({ x: points[i].x + normals[i].x * side * w * 0.26, y: points[i].y + normals[i].y * side * w * 0.26, r });
  }
  return dots;
}

/** Fill the arm as one smooth tapered shape with a round tip, then dot the suckers. */
export function drawTentacle(ctx: CanvasRenderingContext2D, spec: TentacleSpec, points: Vec[], palette: TentaclePalette): void {
  const { left, right, normals } = outline(spec, points);
  const n = points.length;

  ctx.beginPath();
  traceSmooth(ctx, left, true);
  const tip = points[n - 1];
  const tipNormal = normals[n - 1];
  const start = Math.atan2(tipNormal.y, tipNormal.x);
  // The left edge is +normal, which is 90° past the tangent, so sweeping back through the tangent rounds the front of the tip.
  ctx.arc(tip.x, tip.y, widthAt(spec, 1) / 2, start, start - Math.PI, true);
  traceSmooth(ctx, right.slice().reverse(), false);
  ctx.closePath();
  ctx.fillStyle = spec.tone === "front" ? palette.front : palette.back;
  ctx.fill();

  ctx.fillStyle = spec.tone === "front" ? palette.frontSucker : palette.backSucker;
  for (const dot of suckers(spec, points, normals)) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** An arm along any centre line as an SVG path, for small static drawings like list bullets. */
export function tentacleSvg(spec: TentacleSpec, points: Vec[]): { d: string; dots: { x: number; y: number; r: number }[]; viewBox: string } {
  const { left, right, normals } = outline(spec, points);
  const f = (v: number) => v.toFixed(2);
  const smooth = (pts: Vec[]) => {
    let d = "";
    for (let i = 1; i < pts.length - 1; i++) {
      d += ` Q${f(pts[i].x)} ${f(pts[i].y)} ${f((pts[i].x + pts[i + 1].x) / 2)} ${f((pts[i].y + pts[i + 1].y) / 2)}`;
    }
    const last = pts[pts.length - 1];
    return `${d} L${f(last.x)} ${f(last.y)}`;
  };
  const back = right.slice().reverse();
  const r = widthAt(spec, 1) / 2;
  const d = `M${f(left[0].x)} ${f(left[0].y)}${smooth(left)} A${f(r)} ${f(r)} 0 0 0 ${f(back[0].x)} ${f(back[0].y)}${smooth(back)} Z`;
  const edge = [...left, ...right];
  const pad = spec.width / 2;
  const minX = Math.min(...edge.map((p) => p.x)) - pad;
  const minY = Math.min(...edge.map((p) => p.y)) - pad;
  const size = Math.max(Math.max(...edge.map((p) => p.x)) + pad - minX, Math.max(...edge.map((p) => p.y)) + pad - minY);
  return { d, dots: suckers(spec, points, normals), viewBox: `${f(minX)} ${f(minY)} ${f(size)} ${f(size)}` };
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

function cssVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/** Arm colors come from CSS variables, so light and dark mode live in index.css. */
export function readPalette(el: Element): TentaclePalette {
  return {
    front: cssVar(el, "--tentacle-front", "#ec7482"),
    back: cssVar(el, "--tentacle-back", "#cc5670"),
    frontSucker: cssVar(el, "--tentacle-front-sucker", "rgba(255,255,255,0.3)"),
    backSucker: cssVar(el, "--tentacle-back-sucker", "rgba(255,255,255,0.18)"),
  };
}

/** Eases one arm's lean toward the pointer, stronger the closer the pointer is to the middle of the arm. */
export function updateLean(lean: { amount: number; point: Vec }, spec: TentacleSpec, pointer: Vec | null): void {
  const mid = { x: spec.base.x + Math.cos(spec.angle) * spec.length * 0.6, y: spec.base.y + Math.sin(spec.angle) * spec.length * 0.6 };
  const target = pointer ? Math.max(0, 1 - Math.hypot(pointer.x - mid.x, pointer.y - mid.y) / (spec.length * 1.4)) * 0.9 : 0;
  lean.amount += (target - lean.amount) * 0.05;
  if (pointer) {
    lean.point.x += (pointer.x - lean.point.x) * 0.08;
    lean.point.y += (pointer.y - lean.point.y) * 0.08;
  }
}
