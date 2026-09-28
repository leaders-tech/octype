/*
This file lists Octype's main features as a grid of cards.
Edit this file when a feature is added, removed, or described differently.
Copy one feature object when you add another card.
*/

const FEATURES = [
  {
    title: "Works everywhere",
    text: "Native apps, browsers, Electron apps like Slack and Claude, and even Telegram through on-device text recognition.",
    icon: <path d="M4 5h16v11H4zM9 20h6M12 16v4" />,
  },
  {
    title: "Uses what's on screen",
    text: "Suggestions fit the conversation because Octype can see the message you're answering.",
    icon: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  },
  {
    title: "Writes like you",
    text: "Optionally learns from sentences you finish, and uses your About me for names and details.",
    icon: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
  },
  {
    title: "Fast",
    text: "Suggestions stream word by word. The first word appears in about 25 ms on Apple Silicon.",
    icon: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  },
  {
    title: "Measures itself",
    text: "See how many words and minutes Octype saved you today, this week and all time.",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  },
  {
    title: "Free and unlimited",
    text: "No account, no subscription, no word limits. It runs on your Mac, so there's nothing to meter.",
    icon: <path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.3 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z" />,
  },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="section-head">
        <p className="kicker">Features</p>
        <h2>Small app. Long reach.</h2>
      </div>
      <div className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {f.icon}
            </svg>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
