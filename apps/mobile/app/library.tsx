import type { Artifact } from "@rakazo/contracts";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { MarkdownArtifactPreview } from "../components/markdown-artifact-preview";
import { rpc } from "../lib/api";
import { type MobileArtifactTarget, openMobileArtifact } from "../lib/artifact-open";
import { useI18n } from "../lib/i18n";
import { formatThreadTime } from "../lib/inbox";
import { useMobileTokens } from "../lib/native";

function formatArtifactSize(size: number, t: (message: string) => string) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} ${t("MB")}`;
  if (size >= 1024) return `${Math.max(1, Math.round(size / 1024))} ${t("KB")}`;
  return `${size} ${t("B")}`;
}

export default function LibraryScreen() {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const { botId } = useLocalSearchParams<{ botId?: string; botName?: string }>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [preview, setPreview] = useState<{
    artifactId: string;
    name: string;
    mimeType: string;
  } | null>(null);

  const target: MobileArtifactTarget | null = botId ? { botId } : null;

  function load() {
    if (!target) {
      setError(t("Library link is incomplete"));
      setLoading(false);
      return Promise.resolve();
    }
    return rpc<Artifact[]>("artifacts/list", target)
      .then((next) => {
        setArtifacts(next);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : t("Could not load library"));
      });
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [botId]);

  function openArtifact(artifact: Artifact) {
    if (!target) return;
    if (artifact.mimeType === "text/markdown") {
      setPreview({
        artifactId: artifact.id,
        name: artifact.name,
        mimeType: artifact.mimeType,
      });
      return;
    }
    void openMobileArtifact(target, artifact.id, artifact.name, artifact.mimeType).catch((err) =>
      Alert.alert(t("Could not open file"), err instanceof Error ? err.message : t("Try again.")),
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t("Library") }} />
      {preview && target ? (
        <MarkdownArtifactPreview
          threadTarget={target}
          target={preview}
          onClose={() => setPreview(null)}
        />
      ) : null}
      <FlatList
        style={{ flex: 1, backgroundColor: tokens.background }}
        contentContainerStyle={{ padding: 24, gap: 12 }}
        data={artifacts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
          />
        }
        ListHeaderComponent={loading ? <ActivityIndicator color={tokens.mutedForeground} /> : null}
        ListEmptyComponent={
          loading ? null : (
            <Text style={{ color: tokens.mutedForeground, fontSize: 15, marginTop: 8 }}>
              {error ?? t("No files yet")}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => openArtifact(item)}
            style={({ pressed }) => ({
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.card,
              padding: 16,
              gap: 6,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                numberOfLines={1}
                style={{ color: tokens.foreground, fontSize: 16, fontWeight: "600", flex: 1 }}
              >
                {item.name}
              </Text>
              <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
                {formatThreadTime(item.createdAt)}
              </Text>
            </View>
            <Text numberOfLines={1} style={{ color: tokens.mutedForeground, fontSize: 14 }}>
              {[
                item.mimeType,
                formatArtifactSize(item.size, t),
                item.version > 1 ? t("v{version}", { version: String(item.version) }) : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </Pressable>
        )}
      />
    </>
  );
}
