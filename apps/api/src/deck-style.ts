import { ORPCError } from "@orpc/server";
import type { JobPublisher } from "@rakazo/adapter-kit";
import {
  type Actor,
  type DeckStyle,
  type MessageBlock,
  MessageBlock as MessageBlockSchema,
} from "@rakazo/contracts";
import type { Prisma, PrismaClient, ThreadEvents } from "@rakazo/db";
import { IsolationError } from "@rakazo/db";
import type { ThreadTarget } from "./thread-target.js";
import { sendThreadMessage } from "./thread-target.js";

const STYLE_LABELS: Record<DeckStyle, string> = {
  clean: "Clean",
  editorial: "Editorial",
  dark: "Dark",
};

/**
 * Record the style the user picked on a style card and hand the choice to the Bot. The selection is
 * stored on the card in the same transaction as the message, so the style a deck is saved with is
 * always one the user actually chose; picking twice with a different style is refused.
 */
export async function chooseDeckStyle(
  deps: { prisma: PrismaClient; events: ThreadEvents; jobs: JobPublisher },
  actor: Actor,
  target: ThreadTarget,
  input: { messageId: string; choiceId: string; style: DeckStyle },
) {
  const message = await deps.prisma.message.findFirst({
    where: { id: input.messageId, threadId: target.threadId, role: "bot" },
    select: { id: true, blocks: true },
  });
  if (!message) throw new IsolationError();
  const parsed = MessageBlockSchema.array().safeParse(message.blocks);
  if (!parsed.success) {
    throw new ORPCError("BAD_REQUEST", { message: "Message blocks are not editable." });
  }
  const block = parsed.data.find(
    (candidate): candidate is Extract<MessageBlock, { kind: "deck_style" }> =>
      candidate.kind === "deck_style" && candidate.choiceId === input.choiceId,
  );
  if (!block) throw new IsolationError();
  if (block.selected) {
    if (block.selected === input.style) return;
    throw new ORPCError("CONFLICT", { message: "A style was already chosen for this deck." });
  }
  await sendThreadMessage(
    deps,
    actor,
    target,
    {
      text: `Use the ${STYLE_LABELS[input.style]} style for the presentation.`,
      clientNonce: `deck-style:${input.choiceId}`,
    },
    {
      beforeCommit: async (tx) => {
        const next = parsed.data.map((candidate) =>
          candidate.kind === "deck_style" && candidate.choiceId === input.choiceId
            ? { ...candidate, selected: input.style }
            : candidate,
        );
        const written = await tx.message.updateMany({
          where: { id: message.id, blocks: { equals: parsed.data as Prisma.InputJsonValue } },
          data: { blocks: next as Prisma.InputJsonValue },
        });
        if (written.count !== 1) {
          throw new ORPCError("CONFLICT", { message: "This choice changed. Reload and try again." });
        }
      },
    },
  );
}
