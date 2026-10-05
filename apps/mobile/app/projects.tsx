import type { Project } from "@rakazo/contracts";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";
import { projectStatusColor, projectStatusLabel } from "../lib/project-status";

export default function ProjectsScreen() {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const router = useRouter();
  const { botId, botName } = useLocalSearchParams<{ botId?: string; botName?: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    if (!botId) {
      setError(t("Tasks link is incomplete"));
      setLoading(false);
      return Promise.resolve();
    }
    return rpc<Project[]>("projects/list", { botId })
      .then((next) => {
        setProjects(next);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : t("Could not load tasks"));
      });
  }

  useEffect(() => {
    let cancelled = false;
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [botId]);

  return (
    <>
      <Stack.Screen options={{ title: t("Tasks") }} />
      <FlatList
        style={{ flex: 1, backgroundColor: tokens.background }}
        contentContainerStyle={{ padding: 24, gap: 12 }}
        data={projects}
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
              {error ?? t("No active projects")}
            </Text>
          )
        }
        renderItem={({ item }) => {
          const completed = item.tasks.filter((task) => task.status === "completed").length;
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/project",
                  params: { botId: botId ?? "", projectId: item.id, botName: botName ?? "" },
                })
              }
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
                  {item.title}
                </Text>
                <Text
                  style={{
                    color: projectStatusColor(item.status, tokens),
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {projectStatusLabel(item.status, t)}
                </Text>
              </View>
              {item.objective ? (
                <Text numberOfLines={2} style={{ color: tokens.mutedForeground, fontSize: 14 }}>
                  {item.objective}
                </Text>
              ) : null}
              {item.tasks.length ? (
                <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
                  {t("{completed} of {total} tasks done", {
                    completed: String(completed),
                    total: String(item.tasks.length),
                  })}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </>
  );
}
