/*
This file runs an animated canvas scene: sizing for sharp pixels, pausing when off screen or in a background tab,
following the pointer, reacting to light/dark switches, and drawing one still frame when motion is reduced.
Edit this file when every canvas animation on the page should behave differently.
Copy the useCanvasScene(ref, createScene) call when you add another canvas animation.
*/

import { useEffect, type RefObject } from "react";
import type { Vec } from "./tentacle";

export type SceneFrame = {
  now: number;
  /** Seconds, frozen when the visitor prefers reduced motion. */
  time: number;
  reduced: boolean;
  /** Pointer position in canvas pixels, or null when it is far away. */
  pointer: Vec | null;
};

export type CanvasScene = {
  resize(width: number, height: number): void;
  draw(ctx: CanvasRenderingContext2D, frame: SceneFrame): void;
  /** Called after a light/dark switch so the scene can read its colors again. */
  retheme?(): void;
  dispose?(): void;
};

export type SceneFactory = (canvas: HTMLCanvasElement, host: HTMLElement) => CanvasScene;

/** A tap: rise quickly, stay down for `hold` ms, lift slowly. Returns 0..1. */
export function pressAmount(elapsed: number, hold = 0, down = 170, up = 290): number {
  if (elapsed < 0 || elapsed > down + hold + up) return 0;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  if (elapsed < down) return ease(elapsed / down);
  if (elapsed < down + hold) return 1;
  return 1 - ease((elapsed - down - hold) / up);
}

export function readCssColor(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

export function useCanvasScene(ref: RefObject<HTMLCanvasElement | null>, createScene: SceneFactory, trackPointer = false): void {
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const scene = createScene(canvas, host);
    let frame = 0;
    let visible = false;
    let pointer: Vec | null = null;

    const draw = (now: number) => {
      const reduced = reducedMotion.matches;
      scene.draw(ctx, { now, time: reduced ? 2.4 : now / 1000, reduced, pointer: reduced ? null : pointer });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(rect.width, rect.height);
      draw(performance.now());
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
      scene.retheme?.();
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

    if (trackPointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);
    darkScheme.addEventListener("change", onScheme);
    reducedMotion.addEventListener("change", onMotion);
    resize();

    return () => {
      stop();
      scene.dispose?.();
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      darkScheme.removeEventListener("change", onScheme);
      reducedMotion.removeEventListener("change", onMotion);
    };
  }, [ref, createScene, trackPointer]);
}
