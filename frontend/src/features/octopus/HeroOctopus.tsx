/*
This file puts the typing octopus (heroScene.ts) on a canvas behind the hero text.
Edit this file when the hero canvas needs other props or classes.
Do not copy this file. Use TentacleCanvas for loose arms in other sections.
*/

import { useRef } from "react";
import { useCanvasScene } from "../tentacles/useCanvasScene";
import { createHeroScene } from "./heroScene";

export function HeroOctopus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasScene(canvasRef, createHeroScene, true);
  return <canvas ref={canvasRef} className="tentacles tentacles-hero" aria-hidden="true" />;
}
