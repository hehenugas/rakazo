import type { Routine } from "@rakazo/contracts";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";

function routineTriggerSummary(routine: Routine, t: (message: string) => string) {
  return [
    ...routine.crons,
    ...(routine.webhookEnabled ? [t("Webhook")] : []),
    ...(routine.githubEnabled ? [t("Git event")] : []),
    ...(routine.messageProvider === "slack"
      ? [t("Slack message")]
      : routine.messageProvider === "teams"
        ? [t("Teams message")]
        : routine.messageProvider
          ? [t("Message event")]
          : []),
  ].join(", ");
}

export default function RoutinesScreen() {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const router = useRouter();
  const { botId, botName } = useLocalSearchParams<{ botId?: string; botName?: string }>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    if (!botId) {
      setError(t("Routines link is incomplete"));
      setLoading(false);
      return Promise.resolve();
    }
    return rpc<Routine[]>("routines/list", { botId })
      .then((next) => {
        setRoutines(next);
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : t("Could not load routines"));
      });
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [botId]);

  return (
    <>
      <Stack.Screen options={{ title: t("Routines") }} />
      <FlatList
        style={{ flex: 1, backgroundColor: tokens.background }}
        contentContainerStyle={{ padding: 24, gap: 12 }}
        data={routines}
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
              {error ?? t("No routines yet")}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/routine",
                params: { botId: botId ?? "", routineId: item.id, botName: botName ?? "" },
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
                {item.name}
              </Text>
              <Text
                style={{
                  color: item.active ? tokens.success : tokens.mutedForeground,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                {item.active ? t("Active") : t("Paused")}
              </Text>
            </View>
            <Text numberOfLines={1} style={{ color: tokens.mutedForeground, fontSize: 14 }}>
              {routineTriggerSummary(item, t)}
            </Text>
          </Pressable>
        )}
      />
    </>
  );
}
