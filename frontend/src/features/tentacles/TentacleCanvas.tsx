/*
This file draws a set of animated octopus arms on a canvas that fills its parent section.
Edit this file when loose arms should react differently to the pointer or to key presses.
Copy the <TentacleCanvas layout={...} /> usage when you add arms to another section.
*/

import { useCallback, useRef } from "react";
import { drawTentacle, pose, readPalette, updateLean, type TentacleSpec, type Vec } from "./tentacle";
import { pressAmount, useCanvasScene, type SceneFactory } from "./useCanvasScene";

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

export function TentacleCanvas({ layout, interactive = false, reach, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createScene = useCallback<SceneFactory>(
    (canvas, host) => {
      let specs: TentacleSpec[] = [];
      let palette = readPalette(canvas);
      let width = 0;
      let height = 0;
      const leans: { amount: number; point: Vec }[] = [];

      return {
        resize(w, h) {
          width = w;
          height = h;
          specs = layout({ width, height }, host);
          leans.length = 0;
          for (const spec of specs) leans.push({ amount: 0, point: { x: spec.base.x, y: spec.base.y - spec.length } });
        },
        retheme() {
          palette = readPalette(canvas);
        },
        draw(ctx, { now, time, pointer }) {
          ctx.clearRect(0, 0, width, height);
          const r = reach?.current;
          const canvasRect = r?.target ? canvas.getBoundingClientRect() : null;
          const order = specs.map((_, i) => i).sort((a, b) => Number(specs[a].tone === "front") - Number(specs[b].tone === "front"));

          for (const i of order) {
            const spec = specs[i];
            if (interactive) updateLean(leans[i], spec, pointer);

            let reachOption: { target: Vec; amount: number } | undefined;
            if (r && r.target && r.index === i && canvasRect) {
              const amount = pressAmount(now - r.at, 0, REACH_DOWN_MS);
              if (amount > 0) {
                const box = r.target.getBoundingClientRect();
                reachOption = { target: { x: box.left + box.width / 2 - canvasRect.left, y: box.top + box.height * 0.62 - canvasRect.top }, amount };
              }
            }

            const lean = leans[i];
            const points = pose(spec, time + i * 0.37, {
              lean: lean.amount > 0.01 ? { point: lean.point, amount: lean.amount } : undefined,
              reach: reachOption,
            });
            drawTentacle(ctx, spec, points, palette);
          }
        },
      };
    },
    [layout, interactive, reach],
  );

  useCanvasScene(canvasRef, createScene, interactive);

  return <canvas ref={canvasRef} className={className ? `tentacles ${className}` : "tentacles"} aria-hidden="true" />;
}
