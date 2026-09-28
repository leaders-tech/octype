/*
This file answers common questions about Octype.
Edit this file when an answer changes or a new question comes up often.
Copy one question object when you add another answer.
*/

import { SOURCE_URL } from "../features/release/useLatestRelease";

const QUESTIONS: [string, React.ReactNode][] = [
  ["Is Octype really free?", "Yes. There's no account, no subscription and no word limit. It runs on your own Mac, so there's no server bill to pass on."],
  [
    "Why does macOS say it can't verify Octype?",
    "Octype isn't notarized by Apple yet. The first time, open System Settings → Privacy & Security and click Open Anyway. After that it opens normally.",
  ],
  [
    "Which apps does it work in?",
    "Almost any text field: native Mac apps, Safari and Chrome, Electron apps like Slack and Claude. For Telegram, which hides its text, Octype reads the screen with on-device OCR if you grant Screen Recording.",
  ],
  ["Does it need the internet?", "Only once, to download the model from Hugging Face. After that everything happens offline on your Mac."],
  [
    "How much memory does it use?",
    "3–5 GB while the model is loaded. Octype can free that memory after 30 idle minutes and reload in about a second when you type again.",
  ],
  [
    "Can I see the code?",
    <>
      Yes, the source is on <a href={SOURCE_URL}>GitHub</a>. You can build Octype yourself with Xcode.
    </>,
  ],
];

export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="section-head">
        <p className="kicker">Questions</p>
        <h2>Good to know</h2>
      </div>
      <div className="faq">
        {QUESTIONS.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
