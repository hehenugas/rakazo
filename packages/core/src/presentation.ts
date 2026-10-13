/**
 * Format-neutral slide deck. A deck is stored as a JSON artifact (versioned like any artifact) and
 * rendered or exported by adapters; nothing here depends on a file format or a provider.
 */

export const DECK_MIME = "application/vnd.rakazo.deck+json";

export const DECK_LIMITS = {
  slides: 60,
  title: 200,
  bullets: 12,
  bullet: 500,
  notes: 2_000,
} as const;

export interface DeckSlide {
  title: string;
  bullets: string[];
  notes?: string;
}

export interface Deck {
  title: string;
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

/** Validate untrusted deck input (from a model tool call or stored JSON) into a clean `Deck`. */
export function parseDeck(input: unknown): { deck: Deck } | { error: string } {
  if (!input || typeof input !== "object")
    return { error: "A deck with a title and slides is required." };
  const raw = input as { title?: unknown; slides?: unknown };
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
    const slide = (entry ?? {}) as { title?: unknown; bullets?: unknown; notes?: unknown };
    const slideTitle = text(slide.title, DECK_LIMITS.title).replace(/\n/g, " ");
    if (!slideTitle) return { error: `Slide ${index + 1} needs a title.` };
    const rawBullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    if (rawBullets.length > DECK_LIMITS.bullets) {
      return { error: `Slide ${index + 1} can have at most ${DECK_LIMITS.bullets} bullets.` };
    }
    const bullets = rawBullets
      .map((bullet) => text(bullet, DECK_LIMITS.bullet).replace(/\n/g, " "))
      .filter(Boolean);
    const notes = text(slide.notes, DECK_LIMITS.notes);
    slides.push({ title: slideTitle, bullets, ...(notes ? { notes } : {}) });
  }
  return { deck: { title, slides } };
}

/** File name for a deck artifact; the same title always maps to the same name (so edits version). */
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
    bullets: slide.bullets
      .slice(0, DECK_PREVIEW_BULLETS)
      .map((bullet) => bullet.slice(0, DECK_PREVIEW_BULLET_LENGTH)),
  }));
}
