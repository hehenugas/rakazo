import type { Routine, RoutineHistory } from "@rakazo/contracts";
import { formatCron, formatInstant } from "@rakazo/core";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";

function scheduleSummary(routine: Routine, t: (message: string) => string) {
  return [
    ...routine.crons.map((cron) => formatCron(cron)),
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

export default function RoutineDetail() {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const { botId, botName, routineId } = useLocalSearchParams<{
    botId?: string;
    botName?: string;
    routineId?: string;
  }>();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [history, setHistory] = useState<RoutineHistory | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!botId || !routineId) {
      setError(t("Routine link is incomplete"));
      setLoading(false);
      return Promise.resolve();
    }
    return rpc<Routine[]>("routines/list", { botId })
      .then((routines) => {
        const match = routines.find((item) => item.id === routineId);
        if (match) {
          setRoutine(match);
          setError(null);
        } else {
          setError(t("This routine no longer exists"));
        }
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : t("Could not load routine"));
      });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [botId, routineId]);

  useEffect(() => {
    if (!routine) return;
    let cancelled = false;
    void rpc<RoutineHistory>("routines/history", { routineId: routine.id })
      .then((next) => {
        if (!cancelled) setHistory(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [routine?.id, routine?.active, routine?.lastRunAt]);

  function toggleActive(next: boolean) {
    if (!routine || busy) return;
    setBusy(true);
    rpc<Routine>("routines/update", { routineId: routine.id, active: next })
      .then((updated) => setRoutine(updated))
      .catch((toggleError) =>
        setError(
          toggleError instanceof Error ? toggleError.message : t("Could not update routine"),
        ),
      )
      .finally(() => setBusy(false));
  }

  function confirmDelete() {
    if (!routine || busy) return;
    Alert.alert(
      t("Delete routine"),
      t('Delete "{name}"? This cannot be undone.', { name: routine.name }),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: () => {
            setBusy(true);
            rpc<{ ok: true }>("routines/remove", { routineId: routine.id })
              .then(() => router.back())
              .catch((deleteError) => {
                setError(
                  deleteError instanceof Error
                    ? deleteError.message
                    : t("Could not delete routine"),
                );
                setBusy(false);
              });
          },
        },
      ],
    );
  }

  const nextRun =
    routine?.active && routine.nextRunAt ? formatInstant(routine.nextRunAt, routine.timezone) : "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.background }}
      contentContainerStyle={{ padding: 24, gap: 18 }}
    >
      <Stack.Screen options={{ title: routine?.name ?? t("Routine") }} />
      {loading ? <ActivityIndicator color={tokens.mutedForeground} /> : null}
      {error ? <Text style={{ color: tokens.destructive, fontSize: 15 }}>{error}</Text> : null}
      {routine ? (
        <>
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.card,
              padding: 18,
              gap: 8,
            }}
          >
            <Text style={{ color: tokens.foreground, fontSize: 20, fontWeight: "600" }}>
              {routine.name}
            </Text>
            <Text style={{ color: tokens.foreground, fontSize: 15 }}>
              {scheduleSummary(routine, t)}
            </Text>
            <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
              {t("Timezone")}: {routine.timezone}
            </Text>
            {nextRun ? (
              <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
                {t("Next run")} {nextRun}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.card,
              padding: 18,
            }}
          >
            <Text style={{ color: tokens.foreground, fontSize: 15 }}>
              {routine.active ? t("Active") : t("Paused")}
            </Text>
            <Switch
              accessibilityLabel={t("Active")}
              value={routine.active}
              disabled={busy}
              onValueChange={toggleActive}
              trackColor={{ false: tokens.border, true: tokens.primary }}
              thumbColor={routine.active ? tokens.primaryForeground : tokens.mutedForeground}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text
              style={{ color: tokens.mutedForeground, fontSize: 13, textTransform: "uppercase" }}
            >
              {t("Instruction")}
            </Text>
            <Text
              selectable
              style={{
                color: tokens.foreground,
                fontSize: 15,
                lineHeight: 23,
                borderRadius: 16,
                backgroundColor: tokens.card,
                padding: 18,
              }}
            >
              {routine.prompt}
            </Text>
          </View>
          {history && history.runs.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text
                style={{ color: tokens.mutedForeground, fontSize: 13, textTransform: "uppercase" }}
              >
                {t("Run history")}
              </Text>
              {history.runs.map((run) => (
                <View
                  key={run.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: tokens.border,
                    backgroundColor: tokens.card,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      color: run.status === "failed" ? tokens.destructive : tokens.mutedForeground,
                      fontSize: 13,
                    }}
                  >
                    {run.status}
                  </Text>
                  <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
                    {formatInstant(run.createdAt, routine.timezone)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/thread",
                params: { botId: botId ?? "", name: botName ?? t("Bot") },
              })
            }
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: tokens.primary,
              padding: 14,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ color: tokens.primaryForeground, fontSize: 15, fontWeight: "600" }}>
              {t("Open conversation")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Delete routine")}
            disabled={busy}
            onPress={confirmDelete}
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.destructive,
              padding: 14,
              opacity: pressed || busy ? 0.6 : 1,
            })}
          >
            <Text style={{ color: tokens.destructive, fontSize: 15, fontWeight: "600" }}>
              {t("Delete")}
            </Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}
