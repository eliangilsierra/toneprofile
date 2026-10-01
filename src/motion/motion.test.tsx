import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWitnessed } from "./hooks";
import { signalHop } from "./presets";
import { staggers } from "./tokens";
import { sharedName } from "./view-transitions";

describe("motion helpers", () => {
  it("celebrates only a state reached while watching", () => {
    // Watched live: running → ready.
    const live = renderHook(({ reached }) => useWitnessed(reached), { initialProps: { reached: false } });
    expect(live.result.current).toBe(false);
    live.rerender({ reached: true });
    expect(live.result.current).toBe(true);

    // Reopened: already ready on first render.
    const reopened = renderHook(({ reached }) => useWitnessed(reached), { initialProps: { reached: true } });
    expect(reopened.result.current).toBe(false);

    // Unknown while loading: the first *known* value counts.
    const loading = renderHook(({ reached, known }) => useWitnessed(reached, known), { initialProps: { reached: false, known: false } });
    loading.rerender({ reached: true, known: true });
    expect(loading.result.current).toBe(false);
  });

  it("delays blocks along the signal path", () => {
    expect(signalHop(0)).toBe(0);
    expect(signalHop(3)).toBeCloseTo(3 * staggers.signalHop);
    expect(signalHop(-1, 0.2)).toBe(0.2);
  });

  it("builds valid view-transition names", () => {
    expect(sharedName("title", "gen_example_northern-lights_en")).toBe("title-gen_example_northern-lights_en");
    expect(sharedName("preset", "pr/x y", "1")).toBe("preset-pr_x_y-1");
  });
});
