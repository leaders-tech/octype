/*
This file is the hero illustration: an octopus sits behind a keyboard, waves six arms and types with two.
It presses Tab when the headline accepts a word, delete when the headline is erased, and taps random letters in between.
Edit this file when the octopus, its arms, its face, or its typing should look or behave differently.
Do not copy this file. Loose arms for other sections use TentacleCanvas with a layout instead.
*/

import { drawTentacle, pose, readPalette, updateLean, type TentaclePalette, type TentacleSpec, type Vec } from "../tentacles/tentacle";
import { pressAmount, readCssColor, type CanvasScene, type SceneFactory } from "../tentacles/useCanvasScene";
import { HERO_KEY_TRAVEL_MS, onHeroKey } from "./heroKeys";
import { drawKeyboard, layoutKeyboard, type Key, type Keyboard, type KeyboardColors } from "./keyboard";

type Tap = { key: Key; at: number; hold: number };
type Geometry = { cx: number; headCy: number; rx: number; ry: number; kb: Keyboard };

const random = (min: number, max: number) => min + Math.random() * (max - min);
/** Eyes stay dark navy in both themes, like the app icon's outlines would be. */
const EYE = "#1d2233";

function readKeyboardColors(el: Element): KeyboardColors {
  return {
    body: readCssColor(el, "--kb-body", "#f2ebe4"),
    line: readCssColor(el, "--kb-line", "rgba(29,34,51,0.08)"),
    key: readCssColor(el, "--kb-key", "#fbf8f4"),
    edge: readCssColor(el, "--kb-edge", "rgba(29,34,51,0.12)"),
    label: readCssColor(el, "--kb-label", "rgba(29,34,51,0.35)"),
    pressed: readCssColor(el, "--coral", "#ec7482"),
    pressedLabel: "#1d2233",
  };
}

/** Mirror a left-side angle to the right side. */
const mirror = (angle: number) => Math.PI - angle;

export const createHeroScene: SceneFactory = (canvas, host) => {
  let width = 0;
  let height = 0;
  let geo: Geometry | null = null;
  let backArms: TentacleSpec[] = [];
  let frontArms: TentacleSpec[] = [];
  let palette: TentaclePalette = readPalette(canvas);
  let kbColors = readKeyboardColors(canvas);
  const leans: { amount: number; point: Vec }[] = [];
  const taps: (Tap | null)[] = [null, null];
  let lastEventAt = -Infinity;
  let nextRandomAt = 0;
  let nextArm = 0;
  let blinkAt = performance.now() + random(2000, 4000);
  const gaze = { x: 0, y: 0 };

  const tapKey = (key: Key, at: number, hold = 0) => {
    if (!geo) return;
    const arm = key.x + key.w / 2 < geo.cx ? 0 : 1;
    taps[arm] = { key, at, hold };
  };

  const stopListening = onHeroKey((id, holdMs) => {
    const key = geo?.kb.keys.find((k) => k.id === id);
    const now = performance.now();
    lastEventAt = now + holdMs;
    if (key) tapKey(key, now, holdMs);
  });

  const layout = () => {
    const narrow = width < 720;
    const meta = host.querySelector(".hero-meta");
    const contentBottom = meta ? meta.getBoundingClientRect().bottom - host.getBoundingClientRect().top + 24 : height * 0.6;
    const margin = narrow ? 20 : 34;
    const zone = Math.max(160, height - contentBottom - margin);
    const kbW = Math.min(width * (narrow ? 0.9 : 0.56), 680, zone / 0.58);
    const kbH = kbW * 0.3;
    const cx = width / 2;
    const kb = layoutKeyboard(cx - kbW / 2, height - margin - kbH, kbW, kbH);
    const rx = kbW * 0.15;
    const ry = rx * 1.12;
    geo = { cx, headCy: kb.y - ry * 0.5, rx, ry, kb };

    // Six arms grow from under the body, behind the keyboard, and wave out to the sides and up.
    const thick = rx * 0.36;
    const base = (side: number): Vec => ({ x: cx + side * rx * 0.35, y: kb.y + ry * 0.08 });
    const rise = base(1).y - contentBottom;
    const lefts = [
      { angle: -Math.PI + 0.1, length: Math.min(width * 0.3, 440), width: thick, curl: 1.0, sway: 0.8, tone: "back" as const },
      { angle: -Math.PI + 0.62, length: Math.min(width * 0.4, (rise / Math.sin(0.62)) * 0.95), width: thick, curl: 1.1, sway: 1.1, tone: "front" as const },
      {
        angle: -Math.PI / 2 - 0.42,
        length: Math.max(ry * 1.9, (rise / Math.cos(0.42)) * 0.92),
        width: thick * 0.85,
        curl: 0.95,
        sway: 1.2,
        tone: "back" as const,
      },
    ];
    backArms = [];
    lefts.forEach((arm, i) => {
      for (const side of [-1, 1]) {
        backArms.push({
          base: base(side),
          angle: side < 0 ? arm.angle : mirror(arm.angle),
          length: arm.length * (side < 0 ? 1 : 0.96),
          width: arm.width,
          // Tips roll down and outward, like the arms on the app icon.
          curl: side * arm.curl,
          sway: arm.sway,
          speed: 0.7 + 0.08 * i + (side > 0 ? 0.05 : 0),
          phase: i * 1.7 + (side > 0 ? 2.3 : 0),
          tone: arm.tone,
        });
      }
    });

    // Two arms drape over the keyboard and do the typing.
    frontArms = [-1, 1].map((side) => ({
      base: { x: cx + side * rx * 0.5, y: kb.y - ry * 0.12 },
      angle: side < 0 ? Math.PI - 0.5 : 0.5,
      length: kbW * 0.4,
      width: thick * 0.9,
      curl: side * 0.75,
      sway: 0.4,
      speed: 0.8,
      phase: side < 0 ? 0.4 : 2.1,
      tone: "front" as const,
    }));

    leans.length = 0;
    for (const spec of backArms) leans.push({ amount: 0, point: { x: spec.base.x, y: spec.base.y - spec.length } });
  };

  const drawBody = (ctx: CanvasRenderingContext2D, now: number, reduced: boolean) => {
    if (!geo) return;
    const { cx, headCy, rx, ry } = geo;
    ctx.fillStyle = palette.front;
    ctx.beginPath();
    ctx.ellipse(cx, headCy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // A soft shine on the top of the head.
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.38, headCy - ry * 0.55, rx * 0.26, ry * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Blush.
    ctx.fillStyle = palette.back;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * rx * 0.58, headCy + ry * 0.34, rx * 0.13, ry * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes: blink now and then; look down at the keys while typing.
    if (!reduced && now > blinkAt + 150) blinkAt = now + random(2600, 5200);
    const blinking = !reduced && now > blinkAt && now < blinkAt + 150;
    const eyeW = rx * 0.12;
    const eyeH = blinking ? ry * 0.02 : ry * 0.15;
    for (const side of [-1, 1]) {
      const ex = cx + side * rx * 0.34 + gaze.x * rx * 0.05;
      const ey = headCy + ry * 0.12 + gaze.y * ry * 0.05;
      ctx.fillStyle = EYE;
      ctx.beginPath();
      ctx.ellipse(ex, ey, eyeW, Math.max(1.2, eyeH), 0, 0, Math.PI * 2);
      ctx.fill();
      if (!blinking) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(ex - eyeW * 0.3 + gaze.x * eyeW * 0.2, ey - eyeH * 0.4 + gaze.y * eyeH * 0.15, eyeW * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const scene: CanvasScene = {
    resize(w, h) {
      width = w;
      height = h;
      layout();
    },
    retheme() {
      palette = readPalette(canvas);
      kbColors = readKeyboardColors(canvas);
    },
    dispose() {
      stopListening();
    },
    draw(ctx, { now, time, reduced, pointer }) {
      ctx.clearRect(0, 0, width, height);
      if (!geo) return;
      const { kb, cx, headCy } = geo;

      // Between headline presses, type a random letter every second or so.
      if (!reduced && now > nextRandomAt && now > lastEventAt + 700) {
        nextRandomAt = now + random(650, 1500);
        const side = nextArm;
        nextArm = 1 - nextArm;
        const letters = kb.keys.filter((k) => k.letter && /[a-z]/.test(k.id) && k.x + k.w / 2 < cx === (side === 0));
        if (letters.length && !taps[side]) tapKey(letters[Math.floor(Math.random() * letters.length)], now);
      }

      const pressed = new Set<string>();
      const reach = taps.map((tap, i) => {
        if (!tap) return undefined;
        const amount = pressAmount(now - tap.at, tap.hold, HERO_KEY_TRAVEL_MS, 260);
        if (amount === 0 && now - tap.at > HERO_KEY_TRAVEL_MS) {
          taps[i] = null;
          return undefined;
        }
        if (amount > 0.8) pressed.add(tap.key.id);
        return { target: { x: tap.key.x + tap.key.w / 2, y: tap.key.y + tap.key.h * 0.45 }, amount };
      });

      // Follow the pointer with the eyes, or look down at the keys.
      const look = pointer
        ? { x: Math.max(-1, Math.min(1, (pointer.x - cx) / (width * 0.35))), y: Math.max(-1, Math.min(1, (pointer.y - headCy) / (height * 0.4))) }
        : { x: 0, y: reach.some(Boolean) ? 1 : 0.4 };
      gaze.x += (look.x - gaze.x) * 0.12;
      gaze.y += (look.y - gaze.y) * 0.12;

      const order = backArms.map((_, i) => i).sort((a, b) => Number(backArms[a].tone === "front") - Number(backArms[b].tone === "front"));
      for (const i of order) {
        const spec = backArms[i];
        if (!reduced) updateLean(leans[i], spec, pointer);
        const lean = leans[i];
        const points = pose(spec, time + i * 0.37, { lean: lean.amount > 0.01 ? { point: lean.point, amount: lean.amount } : undefined });
        drawTentacle(ctx, spec, points, palette);
      }

      drawBody(ctx, now, reduced);
      drawKeyboard(ctx, kb, kbColors, pressed);

      frontArms.forEach((spec, i) => {
        drawTentacle(ctx, spec, pose(spec, time + i * 1.3, { reach: reach[i] }), palette);
      });
    },
  };
  return scene;
};
