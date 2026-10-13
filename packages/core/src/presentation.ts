import type { DeckChart as DeckChartData, DeckLayout, DeckStyle } from "@rakazo/contracts";
import { DECK_LAYOUTS, DECK_STYLES } from "@rakazo/contracts";

/**
 * Format-neutral slide deck. A deck is stored as a versioned JSON artifact and rendered or
 * exported by adapters; nothing here depends on a file format or a provider.
 */
export const DECK_MIME = "application/vnd.rakazo.deck+json";
export const DECK_VERSION = 2 as const;

export const DECK_LIMITS = {
  slides: 60,
  title: 200,
  bullets: 12,
  bullet: 500,
  notes: 2_000,
  quote: 1_200,
  attribution: 200,
  columnBullets: 6,
  chartCategories: 12,
  chartSeries: 4,
} as const;

export interface DeckColumn {
  heading?: string;
  bullets: string[];
}

export type DeckChart = DeckChartData;

export interface DeckSlide {
  title: string;
  bullets: string[];
  notes?: string;
  layout?: DeckLayout;
  quote?: string;
  attribution?: string;
  leftColumn?: DeckColumn;
  rightColumn?: DeckColumn;
  chart?: DeckChart;
}

export interface Deck {
  version?: typeof DECK_VERSION;
  title: string;
  style?: DeckStyle;
  slides: DeckSlide[];
}

// Control characters other than tab and newline are not allowed in XML text; one would make the
// exported file unreadable.
function stripControlCharacters(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0)!;
    if ((code < 0x20 && code !== 0x09 && code !== 0x0a) || code === 0x7f) continue;
    out += char;
  }
  return out;
}

const text = (value: unknown, max: number) =>
  typeof value === "string"
    ? stripControlCharacters(value.replace(/\r\n?/g, "\n")).trim().slice(0, max)
    : "";

function parseColumn(
  value: unknown,
  slideNumber: number,
  side: "left" | "right",
): { column: DeckColumn | null } | { error: string } {
  if (value === undefined || value === null) return { column: null };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: `Slide ${slideNumber} has invalid ${side} column content.` };
  }
  const raw = value as { heading?: unknown; bullets?: unknown };
  const heading = text(raw.heading, DECK_LIMITS.title).replace(/\n/g, " ");
  const rawBullets = Array.isArray(raw.bullets) ? raw.bullets : [];
  if (rawBullets.length > DECK_LIMITS.columnBullets) {
    return {
      error: `Slide ${slideNumber} ${side} column can have at most ${DECK_LIMITS.columnBullets} bullets.`,
    };
  }
  const bullets = rawBullets
    .map((bullet) => text(bullet, DECK_LIMITS.bullet).replace(/\n/g, " "))
    .filter(Boolean);
  return { column: heading || bullets.length ? { ...(heading ? { heading } : {}), bullets } : null };
}

function parseChart(value: unknown, slideNumber: number): { chart: DeckChart | null } | { error: string } {
  if (value === undefined || value === null) return { chart: null };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: `Slide ${slideNumber} has invalid chart data.` };
  }
  const raw = value as {
    type?: unknown;
    title?: unknown;
    categories?: unknown;
    series?: unknown;
  };
  if (raw.type !== "bar" && raw.type !== "line" && raw.type !== "pie") {
    return { error: `Slide ${slideNumber} has an unsupported chart type.` };
  }
  if (!Array.isArray(raw.categories) || raw.categories.length === 0 || raw.categories.length > DECK_LIMITS.chartCategories) {
    return { error: `Slide ${slideNumber} chart needs 1–${DECK_LIMITS.chartCategories} categories.` };
  }
  if (!Array.isArray(raw.series) || raw.series.length === 0 || raw.series.length > DECK_LIMITS.chartSeries) {
    return { error: `Slide ${slideNumber} chart needs 1–${DECK_LIMITS.chartSeries} data series.` };
  }
  const categories = raw.categories
    .map((category) => text(category, 100).replace(/\n/g, " "));
  if (categories.some((category) => !category)) {
    return { error: `Slide ${slideNumber} chart categories cannot be empty.` };
  }
  const series: DeckChart["series"] = [];
  for (const entry of raw.series) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return { error: `Slide ${slideNumber} has invalid chart series.` };
    }
    const row = entry as { name?: unknown; values?: unknown };
    const name = text(row.name, 100).replace(/\n/g, " ");
    if (!name || !Array.isArray(row.values) || row.values.length !== categories.length) {
      return { error: `Slide ${slideNumber} chart series need a name and one value per category.` };
    }
    if (
      row.values.some(
        (value) =>
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          Math.abs(value) > Number.MAX_SAFE_INTEGER,
      )
    ) {
      return { error: `Slide ${slideNumber} chart values must be finite safe numbers.` };
    }
    const values = row.values as number[];
    if (raw.type === "pie" && values.some((value) => value < 0)) {
      return { error: `Slide ${slideNumber} pie chart values cannot be negative.` };
    }
    series.push({ name, values: [...values] });
  }
  if (raw.type === "pie" && (series.length !== 1 || series[0]!.values.every((value) => value === 0))) {
    return { error: `Slide ${slideNumber} pie charts need one series with a value above zero.` };
  }
  const title = text(raw.title, DECK_LIMITS.title).replace(/\n/g, " ");
  return {
    chart: {
      type: raw.type,
      ...(title ? { title } : {}),
      categories,
      series,
    },
  };
}

/** Validate untrusted deck input (from a model tool call or stored JSON) into a clean `Deck`. */
export function parseDeck(input: unknown): { deck: Deck } | { error: string } {
  if (!input || typeof input !== "object") {
    return { error: "A deck with a title and slides is required." };
  }
  const raw = input as {
    version?: unknown;
    title?: unknown;
    style?: unknown;
    slides?: unknown;
  };
  if (raw.version !== undefined && raw.version !== 1 && raw.version !== DECK_VERSION) {
    return { error: "This deck version is not supported." };
  }
  const style = DECK_STYLES.find((choice) => choice === raw.style) ??
    (raw.style === undefined ? "clean" : null);
  if (!style) return { error: "Choose a supported presentation style." };
  const title = text(raw.title, DECK_LIMITS.title).replace(/\n/g, " ");
  if (!title) return { error: "The deck needs a title." };
  if (!Array.isArray(raw.slides) || raw.slides.length === 0) {
    return { error: "The deck needs at least one slide." };
  }
  if (raw.slides.length > DECK_LIMITS.slides) {
    return { error: `A deck can have at most ${DECK_LIMITS.slides} slides.` };
  }
  const slides: DeckSlide[] = [];
  for (const [index, entry] of raw.slides.entries()) {
    const slide = (entry ?? {}) as {
      title?: unknown;
      bullets?: unknown;
      notes?: unknown;
      layout?: unknown;
      quote?: unknown;
      attribution?: unknown;
      leftColumn?: unknown;
      rightColumn?: unknown;
      chart?: unknown;
    };
    const slideTitle = text(slide.title, DECK_LIMITS.title).replace(/\n/g, " ");
    if (!slideTitle) return { error: `Slide ${index + 1} needs a title.` };
    const layout = DECK_LAYOUTS.find((candidate) => candidate === slide.layout) ??
      (slide.layout === undefined ? "title_bullets" : null);
    if (!layout) return { error: `Slide ${index + 1} has an unsupported layout.` };
    const rawBullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    if (rawBullets.length > DECK_LIMITS.bullets) {
      return { error: `Slide ${index + 1} can have at most ${DECK_LIMITS.bullets} bullets.` };
    }
    const bullets = rawBullets
      .map((bullet) => text(bullet, DECK_LIMITS.bullet).replace(/\n/g, " "))
      .filter(Boolean);
    const notes = text(slide.notes, DECK_LIMITS.notes);
    const quote = text(slide.quote, DECK_LIMITS.quote);
    const attribution = text(slide.attribution, DECK_LIMITS.attribution).replace(/\n/g, " ");
    const leftColumn = parseColumn(slide.leftColumn, index + 1, "left");
    if ("error" in leftColumn) return leftColumn;
    const rightColumn = parseColumn(slide.rightColumn, index + 1, "right");
    if ("error" in rightColumn) return rightColumn;
    const chart = parseChart(slide.chart, index + 1);
    if ("error" in chart) return chart;
    if (layout === "quote" && !quote) {
      return { error: `Slide ${index + 1} needs quote text for the quote layout.` };
    }
    if (layout === "two_column" && !leftColumn.column && !rightColumn.column) {
      return { error: `Slide ${index + 1} needs column content for the two-column layout.` };
    }
    if (layout === "chart" && !chart.chart) {
      return { error: `Slide ${index + 1} needs chart data for the chart layout.` };
    }
    if (layout !== "chart" && chart.chart) {
      return { error: `Slide ${index + 1} chart data requires the chart layout.` };
    }
    if (layout === "chart" && bullets.length > 0) {
      return { error: `Slide ${index + 1} chart slides cannot also include bullets.` };
    }
    slides.push({
      title: slideTitle,
      bullets,
      layout,
      ...(notes ? { notes } : {}),
      ...(quote ? { quote } : {}),
      ...(attribution ? { attribution } : {}),
      ...(leftColumn.column ? { leftColumn: leftColumn.column } : {}),
      ...(rightColumn.column ? { rightColumn: rightColumn.column } : {}),
      ...(chart.chart ? { chart: chart.chart } : {}),
    });
  }
  return { deck: { version: DECK_VERSION, title, style, slides } };
}

/** File name for a deck artifact; the same title always maps to the same name, so edits version. */
export function deckArtifactName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${slug || "deck"}.deck.json`;
}

export const DECK_PREVIEW_SLIDES = 12;
export const DECK_PREVIEW_BULLETS = 4;
export const DECK_PREVIEW_BULLET_LENGTH = 140;

/** The small slice of a deck carried inside a chat message block for the in-chat preview. */
export function deckPreview(deck: Deck) {
  return deck.slides.slice(0, DECK_PREVIEW_SLIDES).map((slide) => ({
    title: slide.title,
    layout: slide.layout,
    bullets: slide.bullets
      .slice(0, DECK_PREVIEW_BULLETS)
      .map((bullet) => bullet.slice(0, DECK_PREVIEW_BULLET_LENGTH)),
    ...(slide.quote ? { quote: slide.quote.slice(0, DECK_PREVIEW_BULLET_LENGTH) } : {}),
    ...(slide.attribution ? { attribution: slide.attribution } : {}),
    ...(slide.leftColumn
      ? {
          leftColumn: {
            ...(slide.leftColumn.heading ? { heading: slide.leftColumn.heading } : {}),
            bullets: slide.leftColumn.bullets.slice(0, 2),
          },
        }
      : {}),
    ...(slide.rightColumn
      ? {
          rightColumn: {
            ...(slide.rightColumn.heading ? { heading: slide.rightColumn.heading } : {}),
            bullets: slide.rightColumn.bullets.slice(0, 2),
          },
        }
      : {}),
    ...(slide.chart
      ? {
          chart: {
            ...slide.chart,
            categories: [...slide.chart.categories],
            series: slide.chart.series.map((series) => ({ ...series, values: [...series.values] })),
          },
        }
      : {}),
  }));
}
