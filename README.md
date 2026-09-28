<p align="center"><img src="frontend/public/icon.png" width="120" alt="Octype icon"></p>

# Octype website

The landing site for [Octype](https://github.com/levbern/Octype) — inline autocomplete for everything you type on
your Mac. A gray suggestion appears at the cursor in any app; press **Tab** to take the next word. A local language
model (Qwen3 via llama.cpp) runs entirely on the Mac, so nothing you type leaves it.

The page explains what Octype does and lets visitors try it:

- **Typing octopus** — under the hero an octopus sits behind a keyboard: six procedural canvas arms (forward
  kinematics + FABRIK reach) wave and lean toward the pointer, two type. It presses Tab exactly when the headline
  accepts a word, and its eyes follow the pointer. Loose arms also curl in around the privacy section, one presses
  Tab in the demo, and the list bullets are tiny rolled-up arms drawn with the same code.
- **Try it** — a pretend Mac desktop (Messages, Mail, Notes) with a real text field: gray suggestions stream in word
  by word; `Tab`, `⇧ Tab`, `⌥ →` and `Esc` work like in the app. Autoplay runs until you click the field.
  No AI runs on the site: suggestions come from sentences written for each scene (`features/demo/scenes.ts`),
  matched by sentence start, by the last few typed words, then by word completion.
- **The app** — the Octype window (Overview, Statistics, Model, Personalization) rebuilt for the web with sample data.
- **Download** — buttons point straight at the newest `.dmg`, looked up by the backend from GitHub releases.

Built from the `leaders-tech/templatePWA` template and deployed to TLF PaaS on every push.

## Structure

```
backend/                 aiohttp: /api/health and /api/release/latest (cached GitHub lookup)
frontend/src/
  app/App.tsx            the page, section by section
  sections/              Nav, Hero, Try it, How it works, The app, Features, Privacy, Install, FAQ, Footer
  features/octopus/      the hero octopus: body, eyes, keyboard, typing (heroScene.ts)
  features/tentacles/    arm math (tentacle.ts), the shared canvas loop, loose arms per section, spiral bullets
  features/demo/         the fake autocomplete demo and its scenes
  features/showcase/     the pretend Octype app window
  features/hero/         the self-completing headline
  features/release/      latest release hook
```

## Commands

```sh
make setup      # install Python + npm deps, create .env files
make back       # backend with auto-reload   (http://localhost:3101)
make front      # frontend dev server        (http://localhost:5101)
make test       # pytest, vitest, Playwright e2e
```

## Deploy

Push to `main` on `leaders-tech/octype`: TLF PaaS builds `docker-compose.yml` (nginx frontend on 8080, backend on
8081, `/api*` routed to the backend) and publishes <https://octype.tlfedu.tech>. The site needs no secrets.
See `docs/tlfpaas-autodeploy.md` for the Docker contract.
