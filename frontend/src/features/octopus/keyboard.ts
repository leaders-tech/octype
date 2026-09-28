/*
This file lays out and draws the flat Mac keyboard the hero octopus types on.
Edit this file when the keyboard should have other keys, labels, proportions, or colors.
Do not copy this file. The octopus scene (heroScene.ts) decides where the keyboard goes.
*/

export type Key = { id: string; label: string; x: number; y: number; w: number; h: number; letter: boolean };
export type Keyboard = { x: number; y: number; w: number; h: number; keys: Key[] };
export type KeyboardColors = { body: string; line: string; key: string; edge: string; label: string; pressed: string; pressedLabel: string };

/** Five rows, each 15 units wide, like a Mac laptop keyboard without the function row. */
const ROWS: [string, number, string?][][] = [
  [..."`1234567890-=".split("").map((c): [string, number] => [c, 1]), ["delete", 2, "delete"]],
  [["tab", 1.5, "tab"], ..."qwertyuiop[]".split("").map((c): [string, number] => [c, 1]), ["\\", 1.5]],
  [["caps", 1.75, "⇪"], ..."asdfghjkl;'".split("").map((c): [string, number] => [c, 1]), ["return", 2.25, "return"]],
  [["shift-l", 2.25, "⇧"], ..."zxcvbnm,./".split("").map((c): [string, number] => [c, 1]), ["shift-r", 2.75, "⇧"]],
  [
    ["fn", 1, "fn"],
    ["control", 1, "⌃"],
    ["option-l", 1, "⌥"],
    ["command-l", 1.25, "⌘"],
    ["space", 6.25, ""],
    ["command-r", 1.25, "⌘"],
    ["option-r", 1, "⌥"],
    ["left", 0.75, "◀"],
    ["updown", 0.75, "▲"],
    ["right", 0.75, "▶"],
  ],
];

export function layoutKeyboard(x: number, y: number, w: number, h: number): Keyboard {
  const pad = w * 0.022;
  const gap = Math.max(2, w * 0.0075);
  const rowH = (h - pad * 2 - gap * 4) / 5;
  const keys: Key[] = [];

  ROWS.forEach((row, r) => {
    const unit = (w - pad * 2 - gap * (row.length - 1)) / 15;
    let kx = x + pad;
    const ky = y + pad + r * (rowH + gap);
    for (const [id, units, label] of row) {
      const kw = unit * units;
      const letter = id.length === 1;
      keys.push({ id, label: label ?? (letter ? id.toUpperCase() : id), x: kx, y: ky, w: kw, h: rowH, letter });
      kx += kw + gap;
    }
  });
  return { x, y, w, h, keys };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawKeyboard(ctx: CanvasRenderingContext2D, kb: Keyboard, colors: KeyboardColors, pressed: Set<string>): void {
  const bodyRadius = kb.w * 0.028;
  roundRect(ctx, kb.x, kb.y, kb.w, kb.h, bodyRadius);
  ctx.fillStyle = colors.body;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = colors.line;
  ctx.stroke();

  const rowH = kb.keys[0]?.h ?? 10;
  const radius = Math.max(2, rowH * 0.2);
  const depth = Math.max(1.5, rowH * 0.07);
  const fontSize = Math.max(7, Math.min(13, rowH * 0.3));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const key of kb.keys) {
    const down = pressed.has(key.id);
    const top = key.y + (down ? depth : 0);
    // A darker slab under each key gives it a shallow, pressable edge.
    roundRect(ctx, key.x, key.y + depth, key.w, key.h - depth, radius);
    ctx.fillStyle = colors.edge;
    ctx.fill();
    roundRect(ctx, key.x, top, key.w, key.h - depth, radius);
    ctx.fillStyle = down ? colors.pressed : colors.key;
    ctx.fill();

    if (key.label) {
      ctx.font = `${key.letter ? 500 : 600} ${key.letter ? fontSize : fontSize * 0.82}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.fillStyle = down ? colors.pressedLabel : colors.label;
      ctx.fillText(key.label, key.x + key.w / 2, top + (key.h - depth) / 2 + 0.5);
    }
  }
}
