/*
This file explains in three steps how Octype comes up with a suggestion.
Edit this file when the explanation of the engine changes.
Copy one step block when you add another step.
*/

const STEPS = [
  {
    title: "It reads the room",
    text: "Octype looks at the field you're typing in and, if you allow it, the text around it: the chat you're replying to, the email thread, the page title.",
  },
  {
    title: "A local model thinks",
    text: "Qwen3 runs through llama.cpp on your Mac's own chip. With the 4B model the first word shows up in about 25 milliseconds.",
  },
  {
    title: "You press Tab",
    text: "The suggestion streams in word by word. Take a word, take it all, or keep typing. Nothing is inserted until you say so.",
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="section-head">
        <p className="kicker">How it works</p>
        <h2>Eight arms, one job: finish your sentence.</h2>
      </div>
      <ol className="steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="step">
            <span className="step-number">{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
