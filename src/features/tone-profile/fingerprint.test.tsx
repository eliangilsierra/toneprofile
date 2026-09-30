import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildSpectrum } from "@/mocks/fixtures/spectrum";
import { renderWithProviders } from "@/test/render";
import { bandLevel, Fingerprint } from "./fingerprint";

const spectrum = buildSpectrum({
  bumps: [{ hz: 2000, db: 6, octaves: 0.6 }],
  highCut: { hz: 6000, slope: 12 },
});

describe("Fingerprint", () => {
  it("computes perceptual band levels from 1/3-octave data", () => {
    expect(bandLevel(spectrum, 1500, 4000)).toBeGreaterThan(bandLevel(spectrum, 70, 250));
  });

  it("selects the loudest band first and explains any band on demand", async () => {
    renderWithProviders(<Fingerprint spectrum={spectrum} />);
    expect(screen.getByRole("button", { name: /Bite/ })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: /Body/ }));
    expect(screen.getByRole("button", { name: /Body/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Low end and thump/)).toBeInTheDocument();
  });

  it("offers the same data as a table", () => {
    renderWithProviders(<Fingerprint spectrum={spectrum} />);
    expect(screen.getByRole("table", { hidden: true })).toBeInTheDocument();
    expect(screen.getAllByRole("row", { hidden: true })).toHaveLength(spectrum.bands_hz.length + 1);
  });
});
