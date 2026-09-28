/*
This file tests the pretend Octype app window: page switching and the main switches.
Edit this file when the pretend window gets new pages or controls.
Copy a test pattern here when you add another page to AppWindow.tsx.
*/

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppWindow } from "./AppWindow";

describe("AppWindow", () => {
  it("starts on Overview and can turn Octype off", () => {
    render(<AppWindow />);
    expect(screen.getByRole("heading", { name: "Octype is on" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Enabled" }));
    expect(screen.getByRole("heading", { name: "Octype is off" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause for 1 Hour" })).toBeDisabled();
  });

  it("pauses and resumes", () => {
    render(<AppWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Pause for 1 Hour" }));
    expect(screen.getByRole("heading", { name: /Paused until/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByRole("heading", { name: "Octype is on" })).toBeInTheDocument();
  });

  it("switches pages from the sidebar", () => {
    render(<AppWindow />);
    fireEvent.click(screen.getByRole("button", { name: "Statistics" }));
    expect(screen.getByText("Accept rate")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Model" }));
    expect(screen.getByLabelText("Qwen3 4B Base (best quality)")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Personalization" }));
    expect(screen.getByLabelText("About me")).toBeInTheDocument();
  });
});
