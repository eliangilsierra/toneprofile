import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { SongCandidate } from "@/lib/api/types";
import { renderWithProviders } from "@/test/render";
import { SongSearch } from "./song-search";

function Harness() {
  const [song, setSong] = useState<SongCandidate | null>(null);
  return <SongSearch value={song} onChange={setSong} />;
}

describe("SongSearch", () => {
  it("searches the catalogue and selects a result with the keyboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    const combobox = screen.getByRole("combobox");
    await user.type(combobox, "northern");
    const option = await screen.findByRole("option", { name: /Northern Lights/ });
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(combobox).toHaveAttribute("aria-activedescendant", option.id);

    await user.keyboard("{Enter}");
    expect(await screen.findByText("Selected song")).toBeInTheDocument();
    expect(screen.getByText(/Glass Harbor/)).toBeInTheDocument();
  });

  it("tells the user when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.type(screen.getByRole("combobox"), "zzzz");
    await waitFor(() => expect(screen.getByText(/No songs found/)).toBeInTheDocument());
  });
});
