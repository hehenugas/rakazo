import * as z from "zod";
import { Id } from "./ids.js";

export const DECK_STYLES = ["clean", "editorial", "dark"] as const;
export const DeckStyleSchema = z.enum(DECK_STYLES);
export type DeckStyle = z.infer<typeof DeckStyleSchema>;

export const DECK_LAYOUTS = ["title_bullets", "section", "quote", "two_column", "chart", "image"] as const;
export const DeckLayoutSchema = z.enum(DECK_LAYOUTS);
export type DeckLayout = z.infer<typeof DeckLayoutSchema>;

export const DeckColumnPreviewSchema = z.object({
  heading: z.string().optional(),
  bullets: z.array(z.string()).max(6),
});

export const DeckChartSeriesSchema = z.object({
  name: z.string(),
  values: z
    .array(z.number().finite().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER))
    .min(1)
    .max(12),
});

export const DeckChartSchema = z.object({
  type: z.enum(["bar", "line", "pie"]),
  title: z.string().optional(),
  categories: z.array(z.string()).min(1).max(12),
  series: z.array(DeckChartSeriesSchema).min(1).max(4),
});
export type DeckChart = z.infer<typeof DeckChartSchema>;

/** Raster formats a deck image may use; SVG is never embedded. */
export const DECK_IMAGE_MIME_TYPES = ["image/png", "image/jpeg"] as const;
export const DECK_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/** An owned image artifact shown on a slide; the bytes stay in artifact storage, not in the deck. */
export const DeckImageSchema = z.object({
  artifactId: Id,
  alt: z.string().max(300),
});
export type DeckImage = z.infer<typeof DeckImageSchema>;

/** What the Google Slides Markdown import cannot carry over from a deck. */
export const DECK_EXPORT_LOSSES = ["notes", "charts", "images"] as const;
export const DeckExportLossSchema = z.enum(DECK_EXPORT_LOSSES);
export type DeckExportLoss = z.infer<typeof DeckExportLossSchema>;

export const DeckSlidePreviewSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()),
  layout: DeckLayoutSchema.optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  leftColumn: DeckColumnPreviewSchema.optional(),
  rightColumn: DeckColumnPreviewSchema.optional(),
  chart: DeckChartSchema.optional(),
  image: DeckImageSchema.optional(),
});

export type DeckSlidePreview = z.infer<typeof DeckSlidePreviewSchema>;

export const PresentationDeliveryStatusSchema = z.object({
  status: z.enum(["pending", "delivered", "failed", "unknown", "unsupported"]),
  url: z.string().url().nullable(),
});
export type PresentationDeliveryStatus = z.infer<typeof PresentationDeliveryStatusSchema>;

export const ConnectionPresentationDeliverySchema = z.object({
  connectionId: Id,
  displayName: z.string(),
});
export type ConnectionPresentationDelivery = z.infer<typeof ConnectionPresentationDeliverySchema>;
