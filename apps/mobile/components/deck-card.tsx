import type {
  ConnectionPresentationDelivery,
  MessageBlock,
  PresentationDeliveryStatus,
} from "@rakazo/contracts";
import { decodeAttachmentBase64 } from "@rakazo/core";
import { File, Paths } from "expo-file-system";
import { useEffect, useState } from "react";
import { AppState, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import * as Sharing from "expo-sharing";
import type { MobileArtifactTarget } from "../lib/artifact-open";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { presentMessageActionSheet } from "../lib/message-action-sheet";
import { useMobileTokens, useResolvedAppearance } from "../lib/native";
import { NativeSymbol } from "./native-symbol";

type DeckBlock = Extract<MessageBlock, { kind: "deck" }>;

const DELIVERY_POLL_MS = 4000;

export function DeckCard({ block, target }: { block: DeckBlock; target: MobileArtifactTarget }) {
  const tokens = useMobileTokens();
  const colorScheme = useResolvedAppearance();
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<ConnectionPresentationDelivery[]>([]);
  const [connectionId, setConnectionId] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<PresentationDeliveryStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void rpc<ConnectionPresentationDelivery[]>("connections/presentationDelivery")
      .then((rows) => {
        if (cancelled) return;
        setAccounts(rows);
        if (rows.length === 1) setConnectionId(rows[0]!.connectionId);
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!connectionId) {
      setDeliveryStatus(null);
      return;
    }
    let cancelled = false;
    setDeliveryStatus(null);
    void rpc<PresentationDeliveryStatus | null>("artifacts/deckDeliveryStatus", {
      artifactId: block.artifactId,
      connectionId,
    })
      .then((status) => {
        if (!cancelled) setDeliveryStatus(status);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [block.artifactId, connectionId]);

  // A pending delivery finishes on the server; follow it until it reaches a final outcome.
  const deliveryPending = deliveryStatus?.status === "pending";
  useEffect(() => {
    if (!deliveryPending || !connectionId) return;
    let cancelled = false;
    const refresh = () => {
      void rpc<PresentationDeliveryStatus | null>("artifacts/deckDeliveryStatus", {
        artifactId: block.artifactId,
        connectionId,
      })
        .then((status) => {
          if (!cancelled && status) setDeliveryStatus(status);
        })
        .catch(() => undefined);
    };
    const timer = setInterval(refresh, DELIVERY_POLL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      cancelled = true;
      clearInterval(timer);
      subscription.remove();
    };
  }, [deliveryPending, block.artifactId, connectionId]);

  async function exportPowerPoint() {
    if (busy) return;
    setBusy(true);
    setError(null);
    let file: File | null = null;
    try {
      const result = await rpc<{
        name: string;
        mimeType: string;
        contentBase64: string;
      }>("artifacts/exportDeck", { artifactId: block.artifactId, format: "pptx" });
      file = new File(Paths.cache, result.name);
      file.create({ intermediates: true, overwrite: true });
      file.write(decodeAttachmentBase64(result.contentBase64));
      await Sharing.shareAsync(file.uri, { mimeType: result.mimeType, dialogTitle: block.title });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Export failed"));
    } finally {
      if (file?.exists) file.delete();
      setBusy(false);
    }
  }

  async function deliver(connection: ConnectionPresentationDelivery) {
    if (busy) return;
    setConnectionId(connection.connectionId);
    setBusy(true);
    setError(null);
    try {
      const status = await rpc<PresentationDeliveryStatus>("threads/deliverDeck", {
        ...target,
        artifactId: block.artifactId,
        destination: "google_slides",
        connectionId: connection.connectionId,
      });
      setDeliveryStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Could not send to Google Slides"));
    } finally {
      setBusy(false);
    }
  }

  function sendToSlides() {
    const options = accounts.filter((account) => account.connectionId === connectionId);
    if (options.length === 1) {
      void deliver(options[0]!);
      return;
    }
    presentMessageActionSheet({
      title: t("Account"),
      actions: accounts.map((account) => ({
        text: account.displayName,
        onPress: () => void deliver(account),
      })),
      colorScheme,
      cancel: t("Cancel"),
      more: t("More"),
    });
  }

  const losses = block.googleSlidesLosses ?? [];
  const showLosses =
    accounts.length > 0 &&
    losses.length > 0 &&
    (!deliveryStatus || deliveryStatus.status === "failed" || deliveryStatus.status === "unsupported");
  const lossLabels = {
    notes: t("speaker notes"),
    charts: t("charts"),
    images: t("images"),
  };

  const deliveryLabel = deliveryStatus
    ? deliveryStatus.status === "pending"
      ? t("Pending")
      : deliveryStatus.status === "delivered"
        ? t("Delivered")
        : deliveryStatus.status === "failed"
          ? t("Delivery failed")
          : deliveryStatus.status === "unknown"
            ? t("Outcome unknown")
            : t("Unsupported")
    : null;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`${block.title}, ${t("{count} slides", { count: block.slideCount })}`}
      style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.muted }]}
    >
      <Text style={[styles.title, { color: tokens.foreground }]} numberOfLines={1}>
        {block.title}
      </Text>
      <Text style={[styles.meta, { color: tokens.mutedForeground }]}>
        {t("{count} slides", { count: block.slideCount })}
      </Text>
      <View style={styles.slides}>
        {block.slides.slice(0, 5).map((slide, index) => (
          <Text
            key={`${index}:${slide.title}`}
            style={[styles.slide, { color: tokens.foreground }]}
            numberOfLines={1}
          >
            {index + 1}. {slide.title}{slide.layout === "chart" && slide.chart
              ? ` · ${slide.chart.title ?? t(slide.chart.type === "bar" ? "Bar chart" : slide.chart.type === "line" ? "Line chart" : "Pie chart")}`
              : ""}
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("PowerPoint")}
          disabled={busy}
          onPress={() => void exportPowerPoint()}
          style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.background }]}
        >
          <NativeSymbol ios="arrow.down.to.line" android="download-outline" size={15} color={tokens.foreground} />
          <Text style={[styles.buttonText, { color: tokens.foreground }]}>{t("PowerPoint")}</Text>
        </Pressable>
        {accounts.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Google Slides")}
            disabled={
              busy ||
              deliveryStatus?.status === "pending" ||
              deliveryStatus?.status === "delivered" ||
              deliveryStatus?.status === "unknown"
            }
            onPress={sendToSlides}
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.background }]}
          >
            <NativeSymbol ios="paperplane" android="send-outline" size={15} color={tokens.foreground} />
            <Text style={[styles.buttonText, { color: tokens.foreground }]}>{t("Google Slides")}</Text>
          </Pressable>
        ) : null}
        {deliveryStatus?.status === "delivered" && deliveryStatus.url ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("Open")}
            onPress={() => void Linking.openURL(deliveryStatus.url!).catch(() => undefined)}
          >
            <NativeSymbol ios="arrow.up.right.square" android="open-outline" size={16} color={tokens.foreground} />
          </Pressable>
        ) : null}
      </View>
      {showLosses ? (
        <Text style={[styles.meta, { color: tokens.mutedForeground }]}>
          {t("Not carried to Google Slides: {items}", {
            items: new Intl.ListFormat(undefined, { style: "long", type: "conjunction" }).format(
              losses.map((loss) => lossLabels[loss]),
            ),
          })}
        </Text>
      ) : null}
      {deliveryLabel ? (
        <Text style={[styles.meta, { color: tokens.mutedForeground }]}>{deliveryLabel}</Text>
      ) : null}
      {error ? <Text style={[styles.error, { color: tokens.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  title: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 12 },
  slides: { gap: 4, marginTop: 2, marginBottom: 4 },
  slide: { fontSize: 13.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  button: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: { fontSize: 12.5, fontWeight: "600" },
  error: { fontSize: 12 },
});
