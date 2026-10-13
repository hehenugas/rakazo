import type { Deck } from "@rakazo/core";
import PptxGenJSImport from "pptxgenjs";

export const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const FONT = "Calibri";

// pptxgenjs ships an ES build but CJS-style typings, so under NodeNext the default import is typed
// as the module object while at runtime it is the class. Accept either shape.
const PptxGenJS = ((PptxGenJSImport as unknown as { default?: unknown }).default ??
  PptxGenJSImport) as typeof PptxGenJSImport.default;

/**
 * Render a deck to a PowerPoint file. Titles and bullets are real text placeholders-style boxes
 * (not images), so everything stays editable in PowerPoint, Keynote, and Google Slides.
 * The layout is plain on purpose: a title slide, then one title + bullet list per slide.
 */
export async function renderDeckPptx(deck: Deck): Promise<Uint8Array> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = deck.title;
  pptx.defineSlideMaster({
    title: "RAKAZO_CONTENT",
    background: { color: "FFFFFF" },
    objects: [],
  });

  const cover = pptx.addSlide();
  cover.addText(deck.title, {
    x: 0.7,
    y: 2.2,
    w: 8.6,
    h: 1.4,
    fontFace: FONT,
    fontSize: 38,
    bold: true,
    color: "1A1A1A",
    align: "left",
    valign: "middle",
    fit: "shrink",
  });

  for (const slide of deck.slides) {
    const page = pptx.addSlide({ masterName: "RAKAZO_CONTENT" });
    page.addText(slide.title, {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.9,
      fontFace: FONT,
      fontSize: 28,
      bold: true,
      color: "1A1A1A",
      valign: "middle",
      fit: "shrink",
    });
    if (slide.bullets.length > 0) {
      page.addText(
        slide.bullets.map((bullet) => ({
          text: bullet,
          options: { bullet: true, breakLine: true },
        })),
        {
          x: 0.8,
          y: 1.5,
          w: 8.4,
          h: 3.7,
          fontFace: FONT,
          fontSize: 20,
          color: "333333",
          valign: "top",
          paraSpaceAfter: 8,
          fit: "shrink",
        },
      );
    }
    if (slide.notes) page.addNotes(slide.notes);
  }

  const output = await pptx.write({ outputType: "uint8array" });
  return output as Uint8Array;
}
