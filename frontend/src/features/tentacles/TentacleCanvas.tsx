/*
This file draws a set of animated octopus arms on a canvas that fills its parent section.
Edit this file when arms should react differently to the pointer, to key presses, or to screen changes.
Copy the <TentacleCanvas layout={...} /> usage when you add arms to another section.
*/

import { useEffect, useRef } from "react";
import { drawTentacle, pose, type TentaclePalette, type TentacleSpec, type Vec } from "./tentacle";

export type TentacleLayout = (size: { width: number; height: number }, host: HTMLElement) => TentacleSpec[];

/** Set `at` to performance.now() and the arm at `index` reaches out and taps `target`. */
export type ReachState = { target: HTMLElement | null; at: number; index: number };

type Props = {
  layout: TentacleLayout;
  interactive?: boolean;
  reach?: React.RefObject<ReachState | null>;
  className?: string;
};

export const REACH_DOWN_MS = 170;
const REACH_TOTAL_MS = 460;

function reachAmount(elapsed: number): number {
  if (elapsed < 0 || elapsed > REACH_TOTAL_MS) return 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  if (elapsed < REACH_DOWN_MS) return ease(elapsed / REACH_DOWN_MS);
  return 1 - ease((elapsed - REACH_DOWN_MS) / (REACH_TOTAL_MS - REACH_DOWN_MS));
}

function readPalette(el: HTMLElement): TentaclePalette {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    front: get("--tentacle-front", "#ec7482"),
    back: get("--tentacle-back", "#cc5670"),
    frontSucker: get("--tentacle-front-sucker", "rgba(255,255,255,0.3)"),
    backSucker: get("--tentacle-back-sucker", "rgba(255,255,255,0.18)"),
  };
}

export function TentacleCanvas({ layout, interactive = false, reach, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    let specs: TentacleSpec[] = [];
    let palette = readPalette(canvas);
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let pointer: Vec | null = null;
    const leans: { amount: number; point: Vec }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      specs = layoutRef.current({ width, height }, host);
      leans.length = 0;
      for (const spec of specs) leans.push({ amount: 0, point: { x: spec.base.x, y: spec.base.y - spec.length } });
      draw(performance.now());
    };

    const draw = (now: number) => {
      const time = reducedMotion.matches ? 2.4 : now / 1000;
      ctx.clearRect(0, 0, width, height);
      const canvasRect = reach?.current?.target ? canvas.getBoundingClientRect() : null;

      const order = specs.map((_, i) => i).sort((a, b) => Number(specs[a].tone === "front") - Number(specs[b].tone === "front"));
      for (const i of order) {
        const spec = specs[i];
        const lean = leans[i];
        if (interactive && !reducedMotion.matches) {
          const mid = { x: spec.base.x + Math.cos(spec.angle) * spec.length * 0.6, y: spec.base.y + Math.sin(spec.angle) * spec.length * 0.6 };
          const target = pointer ? Math.max(0, 1 - Math.hypot(pointer.x - mid.x, pointer.y - mid.y) / (spec.length * 1.4)) * 0.9 : 0;
          lean.amount += (target - lean.amount) * 0.05;
          if (pointer) {
            lean.point.x += (pointer.x - lean.point.x) * 0.08;
            lean.point.y += (pointer.y - lean.point.y) * 0.08;
          }
        }

        let reachOption: { target: Vec; amount: number } | undefined;
        const r = reach?.current;
        if (r && r.target && r.index === i && canvasRect) {
          const amount = reachAmount(now - r.at);
          if (amount > 0) {
            const box = r.target.getBoundingClientRect();
            reachOption = { target: { x: box.left + box.width / 2 - canvasRect.left, y: box.top + box.height * 0.62 - canvasRect.top }, amount };
          }
        }

        const points = pose(spec, time + i * 0.37, {
          lean: lean.amount > 0.01 ? { point: lean.point, amount: lean.amount } : undefined,
          reach: reachOption,
        });
        drawTentacle(ctx, spec, points, palette);
      }
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || reducedMotion.matches || !visible || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer = x > -80 && y > -80 && x < rect.width + 80 && y < rect.height + 80 ? { x, y } : null;
    };
    const onPointerLeave = () => {
      pointer = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onScheme = () => {
      palette = readPalette(canvas);
      draw(performance.now());
    };
    const onMotion = () => {
      stop();
      start();
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersection.observe(canvas);

    if (interactive) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);
    darkScheme.addEventListener("change", onScheme);
    reducedMotion.addEventListener("change", onMotion);
    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      darkScheme.removeEventListener("change", onScheme);
      reducedMotion.removeEventListener("change", onMotion);
    };
  }, [interactive, reach]);

  return <canvas ref={canvasRef} className={className ? `tentacles ${className}` : "tentacles"} aria-hidden="true" />;
}
