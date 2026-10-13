import type { Deck, DeckColumn } from "@rakazo/core";
import type { DeckImageBytes } from "./presentation-images.js";
import type { DeckStyle } from "@rakazo/contracts";
import PptxGenJSImport from "pptxgenjs";

export const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const FONT = "Calibri";
const THEMES: Record<DeckStyle, { background: string; text: string; muted: string; accent: string }> = {
  clean: { background: "FFFFFF", text: "17191C", muted: "59616B", accent: "344054" },
  editorial: { background: "FBF6EE", text: "29231F", muted: "6D6258", accent: "873D3D" },
  dark: { background: "171A20", text: "F5F5F5", muted: "C4CBD4", accent: "93C5FD" },
};

// pptxgenjs ships an ES build but CJS-style typings, so under NodeNext the default import is typed
// as the module object while at runtime it is the class. Accept either shape.
const PptxGenJS = ((PptxGenJSImport as unknown as { default?: unknown }).default ??
  PptxGenJSImport) as typeof PptxGenJSImport.default;
type PptxSlide = ReturnType<InstanceType<typeof PptxGenJS>["addSlide"]>;

function addBullets(
  slide: PptxSlide,
  bullets: string[],
  options: { x: number; y: number; w: number; h: number; color: string; fontSize?: number },
) {
  if (bullets.length === 0) return;
  slide.addText(
    bullets.map((bullet) => ({ text: bullet, options: { bullet: true, breakLine: true } })),
    {
      ...options,
      fontFace: FONT,
      fontSize: options.fontSize ?? 20,
      valign: "top",
      paraSpaceAfter: 8,
      fit: "shrink",
    },
  );
}

function addColumn(
  slide: PptxSlide,
  column: DeckColumn | undefined,
  x: number,
  theme: (typeof THEMES)[DeckStyle],
) {
  if (!column) return;
  if (column.heading) {
    slide.addText(column.heading, {
      x,
      y: 1.55,
      w: 5.25,
      h: 0.45,
      fontFace: FONT,
      fontSize: 18,
      bold: true,
      color: theme.accent,
      fit: "shrink",
    });
  }
  addBullets(slide, column.bullets, {
    x,
    y: 2.12,
    w: 5.25,
    h: 3.9,
    color: theme.text,
    fontSize: 17,
  });
}

/** Render one editable presentation from the canonical deck model. */
export async function renderDeckPptx(
  deck: Deck,
  images: ReadonlyMap<string, DeckImageBytes> = new Map(),
): Promise<Uint8Array> {
  const pptx = new PptxGenJS();
  const theme = THEMES[deck.style ?? "clean"];
  pptx.layout = "LAYOUT_16x9";
  pptx.title = deck.title;
  pptx.defineSlideMaster({
    title: "RAKAZO_CONTENT",
    background: { color: theme.background },
    objects: [],
  });

  const cover = pptx.addSlide({ masterName: "RAKAZO_CONTENT" });
  cover.addText(deck.title, {
    x: 0.85,
    y: 2.2,
    w: 11.2,
    h: 1.4,
    fontFace: FONT,
    fontSize: 38,
    bold: true,
    color: theme.text,
    align: "left",
    valign: "middle",
    fit: "shrink",
  });

  for (const slide of deck.slides) {
    const page = pptx.addSlide({ masterName: "RAKAZO_CONTENT" });
    const layout = slide.layout ?? "title_bullets";
    if (layout === "section") {
      page.addText(slide.title, {
        x: 0.9,
        y: 2.45,
        w: 11.5,
        h: 1.1,
        fontFace: FONT,
        fontSize: 36,
        bold: true,
        color: theme.accent,
        valign: "middle",
        fit: "shrink",
      });
    } else {
      page.addText(slide.title, {
        x: 0.85,
        y: 0.45,
        w: 11.5,
        h: 0.85,
        fontFace: FONT,
        fontSize: 27,
        bold: true,
        color: theme.text,
        valign: "middle",
        fit: "shrink",
      });
      if (layout === "quote") {
        page.addText(`“${slide.quote ?? ""}”`, {
          x: 1.1,
          y: 1.75,
          w: 11,
          h: 2.7,
          fontFace: FONT,
          fontSize: 30,
          italic: true,
          color: theme.text,
          valign: "middle",
          fit: "shrink",
        });
        if (slide.attribution) {
          page.addText(slide.attribution, {
            x: 1.1,
            y: 4.8,
            w: 11,
            h: 0.5,
            fontFace: FONT,
            fontSize: 16,
            color: theme.muted,
            align: "right",
            fit: "shrink",
          });
        }
      } else if (layout === "image" && slide.image) {
        const image = images.get(slide.image.artifactId);
        const hasText = slide.bullets.length > 0;
        if (image) {
          // The picture stays raster; the text beside it stays editable.
          page.addImage({
            data: `${image.mimeType};base64,${Buffer.from(image.bytes).toString("base64")}`,
            x: 0.95,
            y: 1.55,
            w: hasText ? 5.6 : 11.1,
            h: 4.7,
            sizing: { type: "contain", w: hasText ? 5.6 : 11.1, h: 4.7 },
            altText: slide.image.alt,
          });
        }
        if (hasText) {
          addBullets(page, slide.bullets, {
            x: 6.95,
            y: 1.65,
            w: 5.25,
            h: 4.6,
            color: theme.text,
            fontSize: 18,
          });
        }
      } else if (layout === "two_column") {
        addColumn(page, slide.leftColumn, 0.95, theme);
        addColumn(page, slide.rightColumn, 6.95, theme);
      } else if (layout === "chart" && slide.chart) {
        page.addChart(
          pptx.ChartType[slide.chart.type],
          slide.chart.series.map((series) => ({
            name: series.name,
            labels: slide.chart!.categories,
            values: series.values,
          })),
          {
            x: 1.05,
            y: 1.55,
            w: 11.1,
            h: 4.9,
            ...(slide.chart.title ? { title: slide.chart.title, showTitle: true } : {}),
            showLegend: slide.chart.type === "pie" || slide.chart.series.length > 1,
            legendPos: "b",
            chartColors: [theme.accent, theme.text, theme.muted, "8A929E"],
            showPercent: slide.chart.type === "pie",
            showValue: slide.chart.type === "pie",
            catAxisLabelFontFace: FONT,
            catAxisLabelFontSize: 10,
            catAxisLabelColor: theme.muted,
            valAxisLabelFontFace: FONT,
            valAxisLabelFontSize: 10,
            valAxisLabelColor: theme.muted,
            valGridLine: { color: theme.muted, size: 0.5, style: "solid" },
            ...(slide.chart.type === "bar" ? { barDir: "col", barGrouping: "clustered" } : {}),
            altText: `${slide.title}: ${slide.chart.type} chart with ${slide.chart.categories.length} categories`,
          },
        );
      } else {
        addBullets(page, slide.bullets, {
          x: 1.05,
          y: 1.65,
          w: 11.1,
          h: 4.6,
          color: theme.text,
        });
      }
    }
    if (slide.notes) page.addNotes(slide.notes);
  }

  const output = await pptx.write({ outputType: "uint8array" });
  return output as Uint8Array;
}
