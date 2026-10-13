import type { DeckStyle, MessageBlock } from "@rakazo/contracts";
import { DECK_STYLES } from "@rakazo/contracts";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MobileArtifactTarget } from "../lib/artifact-open";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";

type DeckStyleBlock = Extract<MessageBlock, { kind: "deck_style" }>;

/** The style choice for a new deck; picking one is what sets the deck's style. */
export function DeckStyleCard({
  block,
  target,
  messageId,
  onChosen,
}: {
  block: DeckStyleBlock;
  target: MobileArtifactTarget;
  messageId: string;
  onChosen?: () => Promise<void>;
}) {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label: Record<DeckStyle, string> = {
    clean: t("Clean"),
    editorial: t("Editorial"),
    dark: t("Dark"),
  };
  // Previews use the same semantic tokens as the rest of the app, not a copy of the deck colors.
  const surface: Record<DeckStyle, { background: string; foreground: string }> = {
    clean: { background: tokens.card, foreground: tokens.foreground },
    editorial: { background: tokens.muted, foreground: tokens.foreground },
    dark: { background: tokens.foreground, foreground: tokens.background },
  };

  async function choose(style: DeckStyle) {
    if (busy || block.selected) return;
    setBusy(true);
    setError(null);
    try {
      await rpc("threads/chooseDeckStyle", {
        ...target,
        messageId,
        choiceId: block.choiceId,
        style,
      });
      await onChosen?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Could not choose a style"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {DECK_STYLES.filter((style) => !block.selected || style === block.selected).map((style) => (
          <Pressable
            key={style}
            accessibilityRole="button"
            accessibilityLabel={label[style]}
            accessibilityState={{ selected: block.selected === style, disabled: busy }}
            disabled={busy || Boolean(block.selected)}
            onPress={() => void choose(style)}
            style={[
              styles.option,
              {
                borderColor: block.selected === style ? tokens.foreground : tokens.border,
                backgroundColor: tokens.muted,
              },
            ]}
          >
            <View
              style={[
                styles.preview,
                { backgroundColor: surface[style].background, borderColor: tokens.border },
              ]}
            >
              <View style={[styles.line, { width: "75%", backgroundColor: surface[style].foreground }]} />
              <View
                style={[styles.line, { width: "50%", opacity: 0.4, backgroundColor: surface[style].foreground }]}
              />
            </View>
            <Text style={[styles.label, { color: tokens.foreground }]}>{label[style]}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={[styles.error, { color: tokens.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", gap: 6 },
  row: { flexDirection: "row", gap: 8 },
  option: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 6, gap: 6 },
  preview: {
    aspectRatio: 16 / 9,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  line: { height: 4, borderRadius: 2 },
  label: { fontSize: 12.5, fontWeight: "600", paddingHorizontal: 2 },
  error: { fontSize: 12 },
});
