/*
This file tests the interactive demo: gray suggestions appear, and Tab, Shift+Tab, Esc and Enter behave like Octype.
Edit this file when demo keys or the demo flow change.
Copy a test pattern here when you add another demo interaction.
*/

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GhostDemo } from "./GhostDemo";

async function startTyping() {
  const user = userEvent.setup();
  render(<GhostDemo />);
  const field = screen.getByLabelText("Messages demo text field");
  await user.click(field);
  return { user, field: field as HTMLTextAreaElement };
}

describe("GhostDemo", () => {
  it("streams a suggestion in and accepts one word with Tab", async () => {
    const { user, field } = await startTyping();
    expect(screen.getByText("Your turn: type, then press Tab")).toBeInTheDocument();

    await user.type(field, "Yes! R");
    await waitFor(() => expect(screen.getByTestId("ghost")).toHaveTextContent("amen sounds perfect. Should we meet at 7 at the office?"));

    await user.keyboard("{Tab}");
    expect(field.value).toBe("Yes! Ramen");
    expect(screen.getByTestId("ghost")).toHaveTextContent("sounds perfect.");
  });

  it("accepts everything with Shift+Tab and sends with Enter", async () => {
    const { user, field } = await startTyping();
    await user.type(field, "Sounds g");
    await waitFor(() => expect(screen.getByTestId("ghost")).toHaveTextContent("reat, see you there at 7!"));

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(field.value).toBe("Sounds great, see you there at 7!");

    await user.keyboard("{Enter}");
    expect(field.value).toBe("");
    expect(screen.getByText("Sounds great, see you there at 7!")).toHaveClass("bubble", "out");
  });

  it("hides the suggestion with Esc until you type again", async () => {
    const { user, field } = await startTyping();
    await user.type(field, "Of c");
    await waitFor(() => expect(screen.getByTestId("ghost")).not.toBeEmptyDOMElement());

    await user.keyboard("{Escape}");
    expect(screen.getByTestId("ghost")).toBeEmptyDOMElement();

    await user.type(field, "o");
    await waitFor(() => expect(screen.getByTestId("ghost")).toHaveTextContent("urse!"));
  });

  it("switches to the Mail demo", async () => {
    render(<GhostDemo />);
    fireEvent.click(screen.getByRole("tab", { name: "Mail" }));
    expect(screen.getByLabelText("Mail demo text field")).toBeInTheDocument();
    expect(screen.getByText("About me")).toBeInTheDocument();
  });
});
