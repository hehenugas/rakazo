import type { ConnectionCatalogItem } from "@rakazo/contracts";
import { describe, expect, it } from "vitest";
import { pluginMatches } from "./command-palette-plugins";

const item = (name: string, slug: string): ConnectionCatalogItem => ({
  connectorId: "composio",
  slug,
  name,
  logo: null,
  connected: false,
  noAuth: false,
});

const catalog = [
  item("Gmail", "gmail"),
  item("Google Calendar", "googlecalendar"),
  item("Slack", "slack"),
];

describe("pluginMatches", () => {
  it("returns nothing until the user types", () => {
    expect(pluginMatches(catalog, "")).toEqual([]);
    expect(pluginMatches(catalog, "   ")).toEqual([]);
  });

  it("matches name or slug case-insensitively", () => {
    expect(pluginMatches(catalog, "GMAIL").map((entry) => entry.slug)).toEqual(["gmail"]);
    expect(pluginMatches(catalog, "calendar").map((entry) => entry.slug)).toEqual([
      "googlecalendar",
    ]);
    expect(pluginMatches(catalog, "go").map((entry) => entry.slug)).toEqual(["googlecalendar"]);
  });

  it("caps the number of results", () => {
    const many = Array.from({ length: 20 }, (_, index) => item(`App ${index}`, `app-${index}`));
    expect(pluginMatches(many, "app")).toHaveLength(6);
    expect(pluginMatches(many, "app", 3)).toHaveLength(3);
  });
});
