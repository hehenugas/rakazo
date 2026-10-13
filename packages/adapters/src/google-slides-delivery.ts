import type {
  AdapterContext,
  ConnectorProvider,
  ConnectorTool,
  GoogleSlidesDeliveryResult,
} from "@rakazo/adapter-kit";
import type { Deck } from "@rakazo/core";

const GOOGLE_SLIDES_CREATE_MARKDOWN = "googleslidescreateslidesmarkdown";

export function supportsGoogleSlidesMarkdownTool(tool: ConnectorTool | undefined): boolean {
  return Boolean(toolInputKeys(tool));
}

export function googleSlidesMarkdownTool(tools: ConnectorTool[]): ConnectorTool | undefined {
  return tools.find((tool) => {
    const normalized = tool.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const properties = tool.inputSchema.properties;
    return normalized === GOOGLE_SLIDES_CREATE_MARKDOWN && Boolean(properties && typeof properties === "object");
  });
}

export function deckToGoogleSlidesMarkdown(deck: Deck): string {
  const slides = deck.slides.map((slide) => {
    const parts = [`# ${slide.title}`];
    if (slide.layout === "quote" && slide.quote) {
      parts.push(`> ${slide.quote}`);
      if (slide.attribution) parts.push(`> — ${slide.attribution}`);
    } else if (slide.layout === "two_column") {
      for (const column of [slide.leftColumn, slide.rightColumn]) {
        if (!column) continue;
        if (column.heading) parts.push(`## ${column.heading}`);
        parts.push(...column.bullets.map((bullet) => `- ${bullet}`));
      }
    } else if (slide.layout === "image" && slide.image) {
      // The Markdown import carries no pictures; keep the description so the slide still reads.
      parts.push(`_Image: ${slide.image.alt}_`);
      parts.push(...slide.bullets.map((bullet) => `- ${bullet}`));
    } else if (slide.layout === "chart" && slide.chart) {
      parts.push(`_${slide.chart.type} chart${slide.chart.title ? `: ${slide.chart.title}` : ""}_`);
      parts.push(`| Category | ${slide.chart.series.map((series) => series.name.replace(/\|/g, "\\|")).join(" | ")} |`);
      parts.push(`| --- | ${slide.chart.series.map(() => "---:").join(" | ")} |`);
      for (const [index, category] of slide.chart.categories.entries()) {
        const values = slide.chart.series.map((series) => String(series.values[index]));
        parts.push(`| ${category.replace(/\|/g, "\\|")} | ${values.join(" | ")} |`);
      }
    } else {
      parts.push(...slide.bullets.map((bullet) => `- ${bullet}`));
    }
    return parts.join("\n\n");
  });
  return [`# ${deck.title}`, ...slides].join("\n\n---\n\n");
}

function toolInputKeys(tool: ConnectorTool | undefined) {
  if (!tool) return null;
  const properties = tool.inputSchema.properties as Record<string, unknown> | undefined;
  if (!properties) return null;
  const titleKey = ["title", "presentation_title"].find((key) => key in properties);
  const markdownKey = ["markdown_text", "markdown", "content"].find((key) => key in properties);
  if (!titleKey || !markdownKey) return null;
  const required = Array.isArray(tool.inputSchema.required)
    ? tool.inputSchema.required.filter((value): value is string => typeof value === "string")
    : [];
  if (required.some((key) => key !== titleKey && key !== markdownKey)) return null;
  return { titleKey, markdownKey };
}

function createArguments(tool: ConnectorTool, input: { title: string; markdown: string }) {
  const keys = toolInputKeys(tool);
  if (!keys) return null;
  return { [keys.titleKey]: input.title, [keys.markdownKey]: input.markdown };
}

function findString(value: unknown, keys: string[], seen = new Set<object>()): string | undefined {
  if (!value || typeof value !== "object" || seen.has(value)) return undefined;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findString(item, keys, seen);
      if (found) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  for (const nested of Object.values(record)) {
    const found = findString(nested, keys, seen);
    if (found) return found;
  }
  return undefined;
}

function successful(value: unknown): boolean | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = successful(item);
      if (nested !== undefined) return nested;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.successful === "boolean") return record.successful;
  if (typeof record.success === "boolean") return record.success;
  for (const nested of Object.values(record)) {
    const found = successful(nested);
    if (found !== undefined) return found;
  }
  return undefined;
}

function fileReceipt(value: unknown) {
  const fileId =
    findString(value, ["presentationId", "presentation_id", "fileId", "file_id"]) ??
    (() => {
      const url = findString(value, ["url", "presentationUrl", "presentation_url", "webViewLink"]);
      if (!url) return undefined;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" || parsed.hostname !== "docs.google.com") return undefined;
        return parsed.pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      } catch {
        return undefined;
      }
    })();
  if (!fileId || !/^[a-zA-Z0-9_-]{5,200}$/.test(fileId)) return null;
  return {
    fileId,
    url: `https://docs.google.com/presentation/d/${encodeURIComponent(fileId)}/edit`,
  };
}

export async function createGoogleSlidesFromMarkdown(
  provider: ConnectorProvider,
  context: AdapterContext,
  tool: ConnectorTool | undefined,
  input: { title: string; markdown: string },
): Promise<GoogleSlidesDeliveryResult | null> {
  if (!tool) return null;
  const args = createArguments(tool, input);
  if (!args) return null;
  let result: unknown;
  for await (const event of provider.execute(
    {
      tool: tool.name,
      args,
      executionId: context.operationId,
      route: tool.route,
    },
    context,
  )) {
    if (event.type === "error") {
      return { status: "unknown", message: "Google Slides did not confirm the result." };
    }
    if (event.type === "result") result = event.data;
  }
  if (result === undefined) {
    return { status: "unknown", message: "Google Slides did not return a file receipt." };
  }
  if (successful(result) === false) {
    return { status: "failed", message: "Google Slides could not create the presentation." };
  }
  const receipt = fileReceipt(result);
  return receipt
    ? { status: "delivered", receipt }
    : { status: "unknown", message: "Google Slides did not return a file receipt." };
}
