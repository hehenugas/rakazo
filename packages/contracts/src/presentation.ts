import * as z from "zod";
import { Id } from "./ids.js";

export const DECK_STYLES = ["clean", "editorial", "dark"] as const;
export const DeckStyleSchema = z.enum(DECK_STYLES);
export type DeckStyle = z.infer<typeof DeckStyleSchema>;

export const DECK_LAYOUTS = ["title_bullets", "section", "quote", "two_column", "chart"] as const;
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

export const DeckSlidePreviewSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()),
  layout: DeckLayoutSchema.optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  leftColumn: DeckColumnPreviewSchema.optional(),
  rightColumn: DeckColumnPreviewSchema.optional(),
  chart: DeckChartSchema.optional(),
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
