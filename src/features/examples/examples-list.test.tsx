import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/mocks/node";
import { renderWithProviders } from "@/test/render";
import { ExamplesList } from "./examples-list";

describe("ExamplesList", () => {
  it("shows the curated examples with honest badges, in the UI language", async () => {
    renderWithProviders(<ExamplesList />, { locale: "es" });
    expect(screen.getByRole("status")).toBeInTheDocument();

    const list = await screen.findByRole("list", { name: "Ejemplos" });
    const cards = within(list).getAllByRole("link");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute("href", "/es/examples/northern-lights");
    expect(within(cards[1]!).getByText("Solo investigación")).toBeInTheDocument();
    expect(within(cards[2]!).getByText("Menor confianza")).toBeInTheDocument();
    expect(within(cards[2]!).getByRole("meter", { name: "Confianza general" })).toHaveAttribute("aria-valuenow");
  });

  it("turns an API failure into a recoverable problem state", async () => {
    server.use(
      http.get("*/api/v1/examples", () =>
        HttpResponse.json(
          { type: "about:blank", title: "Internal", status: 500, code: "internal", retryable: false },
          { status: 500, headers: { "Content-Type": "application/problem+json" } },
        ),
      ),
    );
    renderWithProviders(<ExamplesList />);
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
