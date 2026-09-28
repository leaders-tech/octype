/*
This file draws what is on screen in each pretend demo app (the chat, the email, the note) around the text field.
Edit this file when a demo app should show different context or layout.
Copy one branch of DemoContext when you add another demo app to scenes.ts.
*/

import type { ReactNode } from "react";
import { ABOUT_ME, type Scene } from "./scenes";

type Props = { scene: Scene["id"]; sent: string[]; children: ReactNode };

export function DemoContext({ scene, sent, children }: Props) {
  if (scene === "messages") {
    return (
      <div className="screen-messages">
        <div className="chat">
          <p className="chat-meta">Today 9:38</p>
          <p className="bubble in">Are we still on for dinner tomorrow?</p>
          <p className="bubble in">I found a new ramen place near the office 🍜</p>
          {sent.map((text, i) => (
            <p key={`${i}-${text}`} className="bubble out">
              {text}
            </p>
          ))}
        </div>
        <div className="chat-input">{children}</div>
      </div>
    );
  }

  if (scene === "mail") {
    return (
      <div className="screen-mail">
        <div className="mail-head">
          <p>
            <span>To:</span> Sam Rivera
          </p>
          <p>
            <span>Subject:</span> Re: Onboarding redesign
          </p>
        </div>
        <div className="mail-body">{children}</div>
        <blockquote className="mail-quote">
          On Monday, Sam Rivera wrote:
          <br />
          Here is the latest version of the onboarding flow. Let me know what you think!
        </blockquote>
        <p className="about-chip">
          <span>About me</span> {ABOUT_ME}
        </p>
      </div>
    );
  }

  return (
    <div className="screen-notes">
      <ul className="notes-list" aria-hidden="true">
        <li>
          <b>Groceries</b>
          <span>Oat milk, lemons, basil…</span>
        </li>
        <li className="is-active">
          <b>Lisbon trip</b>
          <span>Now</span>
        </li>
        <li>
          <b>Book club</b>
          <span>Ideas for October…</span>
        </li>
      </ul>
      <div className="notes-editor">{children}</div>
    </div>
  );
}
