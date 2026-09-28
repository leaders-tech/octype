/*
This file recreates the Octype app window (Overview, Statistics, Model, Personalization) with sample numbers.
Edit this file when the real app's window changes and the website picture should match it again.
Copy one page function when you add another page to the pretend window.
*/

import { useState } from "react";

type Page = "overview" | "statistics" | "model" | "personalization";

const PAGES: { id: Page; title: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    title: "Overview",
    icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    id: "statistics",
    title: "Statistics",
    icon: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6M20 16v-9" />,
  },
  {
    id: "model",
    title: "Model",
    icon: <path d="M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />,
  },
  {
    id: "personalization",
    title: "Personalization",
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  },
];

const WEEK = [
  { day: "Mon", words: 1120 },
  { day: "Tue", words: 980 },
  { day: "Wed", words: 1310 },
  { day: "Thu", words: 1045 },
  { day: "Fri", words: 1190 },
  { day: "Sat", words: 430 },
  { day: "Sun", words: 855 },
];

const TOP_APPS = [
  { name: "Slack", words: 2140, color: "#8e5bd9" },
  { name: "Mail", words: 1610, color: "#3b82f6" },
  { name: "Telegram", words: 1180, color: "#38bdf8" },
  { name: "Notes", words: 890, color: "#eab308" },
  { name: "Safari", words: 610, color: "#14b8a6" },
];

const MODELS = [
  { id: "8b", name: "Qwen3 8B Base (smartest, more memory)" },
  { id: "4b", name: "Qwen3 4B Base (best quality)" },
  { id: "1.7b", name: "Qwen3 1.7B Base (fastest)" },
];

function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={on ? "mac-switch is-on" : "mac-switch"} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

function StatCard({ title, value, caption }: { title: string; value: string; caption?: string }) {
  return (
    <div className="mac-stat">
      <span className="mac-stat-title">{title}</span>
      <strong>{value}</strong>
      {caption ? <span className="mac-caption">{caption}</span> : null}
    </div>
  );
}

function Overview() {
  const [enabled, setEnabled] = useState(true);
  const [pausedUntil, setPausedUntil] = useState<Date | null>(null);
  const time = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const title = !enabled ? "Octype is off" : pausedUntil ? `Paused until ${time(pausedUntil)}` : "Octype is on";

  return (
    <div className="mac-page">
      <div className="mac-group mac-status">
        <img src="/icon.png" alt="" width={56} height={56} />
        <div>
          <h4>{title}</h4>
          <p className="mac-secondary">Qwen3 4B Base · Ready</p>
        </div>
        <div className="mac-status-actions">
          <label>
            Enabled <Toggle on={enabled} onChange={setEnabled} label="Enabled" />
          </label>
          {pausedUntil ? (
            <button type="button" className="mac-button" onClick={() => setPausedUntil(null)}>
              Resume
            </button>
          ) : (
            <button type="button" className="mac-button" disabled={!enabled} onClick={() => setPausedUntil(new Date(Date.now() + 3600_000))}>
              Pause for 1 Hour
            </button>
          )}
        </div>
      </div>
      <h5>Today</h5>
      <div className="mac-grid-3">
        <StatCard title="Words saved" value="1,284" />
        <StatCard title="Time saved" value="38 min" />
        <StatCard title="Suggestions accepted" value="412" />
      </div>
      <div className="mac-group mac-keys">
        <span className="mac-group-title">Keys</span>
        <p>
          <kbd>Tab</kbd> accept the next word
        </p>
        <p>
          <kbd>⇧ Tab</kbd> accept the whole suggestion
        </p>
        <p>
          <kbd>⌥ →</kbd> accept the next word
        </p>
        <p>
          <kbd>Esc</kbd> dismiss
        </p>
      </div>
    </div>
  );
}

function Statistics() {
  const max = Math.max(...WEEK.map((d) => d.words));
  return (
    <div className="mac-page">
      <div className="mac-segmented" aria-hidden="true">
        <span className="is-on">7 Days</span>
        <span>30 Days</span>
      </div>
      <div className="mac-grid-2">
        <StatCard title="Words saved" value="6,930" caption="in the last 7 days" />
        <StatCard title="Time saved" value="3 hr, 12 min" caption="≈ 41,580 characters you didn't type" />
        <StatCard title="Accept rate" value="64%" caption="1,902 of 2,971 suggestions used" />
        <StatCard title="Your typing speed" value="52 WPM" caption="measured from your typing" />
      </div>
      <div className="mac-group">
        <span className="mac-group-title">Words saved</span>
        <div className="mac-chart" role="img" aria-label="Words saved per day this week, highest on Wednesday">
          {WEEK.map((d) => (
            <div key={d.day} className="mac-bar">
              <i style={{ height: `${(d.words / max) * 100}%` }} title={`${d.words} words`} />
              <span>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mac-group">
        <span className="mac-group-title">Top apps</span>
        {TOP_APPS.map((app) => (
          <p key={app.name} className="mac-row">
            <span>
              <i className="app-dot" style={{ background: app.color }} />
              {app.name}
            </span>
            <span className="mac-secondary">{app.words.toLocaleString("en-US")} words</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function Model() {
  const [model, setModel] = useState("4b");
  const [freeMemory, setFreeMemory] = useState(true);
  return (
    <div className="mac-page">
      <div className="mac-group">
        <span className="mac-group-title">Model</span>
        {MODELS.map((m) => (
          <label key={m.id} className="mac-row mac-radio">
            <input type="radio" name="octype-model" checked={model === m.id} onChange={() => setModel(m.id)} />
            {m.name}
          </label>
        ))}
        <p className="mac-row">
          <span>Status</span>
          <span className="mac-secondary">Ready</span>
        </p>
      </div>
      <p className="mac-caption">Models run entirely on this Mac. Missing models download automatically from Hugging Face.</p>
      <div className="mac-group">
        <p className="mac-row">
          <span>Free memory when idle for 30 minutes</span>
          <Toggle on={freeMemory} onChange={setFreeMemory} label="Free memory when idle" />
        </p>
        <p className="mac-caption">Unloads the model (3–5 GB). It reloads on your next keystroke in about a second.</p>
      </div>
    </div>
  );
}

function Personalization() {
  const [about, setAbout] = useState("Alex Chen, product designer at Northwind in Lisbon. alex@northwind.co. I write short, friendly messages.");
  const [learn, setLearn] = useState(true);
  return (
    <div className="mac-page">
      <div className="mac-group">
        <span className="mac-group-title">About me</span>
        <textarea className="mac-textarea" aria-label="About me" value={about} maxLength={1000} onChange={(e) => setAbout(e.target.value)} />
        <p className="mac-row">
          <span className="mac-caption">Name, work, email, city, how you like to write. Used to complete things like your signature or contact details.</span>
          <span className="mac-caption">{about.length}/1000</span>
        </p>
      </div>
      <div className="mac-group">
        <p className="mac-row">
          <span>Learn from my writing</span>
          <Toggle on={learn} onChange={setLearn} label="Learn from my writing" />
        </p>
        <p className="mac-caption">
          Remembers up to 30 recent sentences you type (never in password fields or disabled apps) and shows a few to the model as examples of your style.
          Stored only on this Mac.
        </p>
      </div>
    </div>
  );
}

export function AppWindow() {
  const [page, setPage] = useState<Page>("overview");
  const current = PAGES.find((p) => p.id === page)!;

  return (
    <div className="app-window" aria-label="Octype app window preview">
      <aside className="app-sidebar">
        <span className="lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <nav aria-label="App pages">
          {PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={p.id === page ? "is-selected" : undefined}
              aria-current={p.id === page ? "page" : undefined}
              onClick={() => setPage(p.id)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {p.icon}
              </svg>
              {p.title}
            </button>
          ))}
        </nav>
      </aside>
      <section className="app-content">
        <header className="app-toolbar">
          <h3>{current.title}</h3>
        </header>
        {page === "overview" && <Overview />}
        {page === "statistics" && <Statistics />}
        {page === "model" && <Model />}
        {page === "personalization" && <Personalization />}
      </section>
    </div>
  );
}
