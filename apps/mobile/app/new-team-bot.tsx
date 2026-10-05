import {
  BOT_DESCRIPTION_MAX_LENGTH,
  BOT_NAME_MAX_LENGTH,
  BOT_TITLE_MAX_LENGTH,
  type TeamBot,
} from "@rakazo/contracts";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { type MobileBot, rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";

export default function NewTeamBot() {
  const { t } = useI18n();
  const tokens = useMobileTokens();
  const router = useRouter();
  const [teamBots, setTeamBots] = useState<TeamBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void rpc<TeamBot[]>("teamBots/list")
      .then((next) => {
        if (!cancelled) setTeamBots(next);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setListError(
            loadError instanceof Error ? loadError.message : t("Could not load team bots"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function close() {
    if (router.canDismiss()) {
      router.dismiss();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }

  async function openInstance(teamBotId: string) {
    if (pending) return;
    setPending(teamBotId);
    setError(null);
    try {
      const bot = await rpc<MobileBot>("teamBots/open", { teamBotId });
      router.replace({ pathname: "/thread", params: { botId: bot.id, name: bot.name } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Could not open team bot"));
      setPending(null);
    }
  }

  async function create() {
    if (!name.trim() || pending) return;
    setPending("create");
    setError(null);
    try {
      const teamBot = await rpc<TeamBot>("teamBots/create", {
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
      });
      const bot = await rpc<MobileBot>("teamBots/open", { teamBotId: teamBot.id });
      router.replace({ pathname: "/thread", params: { botId: bot.id, name: bot.name } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Could not create team bot"));
      setPending(null);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={close}
              hitSlop={8}
              style={{ paddingEnd: 20, paddingVertical: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t("Cancel")}
            >
              <Text style={{ color: tokens.foreground, fontSize: 17 }}>{t("Cancel")}</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: tokens.background }}
        contentContainerStyle={{ padding: 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {loading ? <ActivityIndicator color={tokens.mutedForeground} /> : null}
        {listError ? (
          <Text style={{ color: tokens.mutedForeground, fontSize: 14 }}>{listError}</Text>
        ) : null}
        {teamBots.map((teamBot) => (
          <Pressable
            key={teamBot.id}
            accessibilityRole="button"
            onPress={() => void openInstance(teamBot.id)}
            disabled={pending !== null}
            style={({ pressed }) => ({
              borderRadius: 16,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.card,
              padding: 16,
              gap: 6,
              opacity: pending && pending !== teamBot.id ? 0.4 : pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                numberOfLines={1}
                style={{ color: tokens.foreground, fontSize: 16, fontWeight: "600", flex: 1 }}
              >
                {teamBot.name}
              </Text>
              <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
                {teamBot.role === "owner"
                  ? t("Owner")
                  : teamBot.role === "editor"
                    ? t("Editor")
                    : t("Member")}
              </Text>
            </View>
            {teamBot.title ? (
              <Text numberOfLines={1} style={{ color: tokens.mutedForeground, fontSize: 14 }}>
                {teamBot.title}
              </Text>
            ) : null}
          </Pressable>
        ))}
        {pending && pending !== "create" ? (
          <ActivityIndicator color={tokens.mutedForeground} />
        ) : null}

        <Text style={{ color: tokens.mutedForeground, marginTop: 16, fontSize: 14 }}>
          {t("Name")}
        </Text>
        <TextInput
          value={name}
          maxLength={BOT_NAME_MAX_LENGTH}
          onChangeText={setName}
          placeholder={t("Name this team bot")}
          placeholderTextColor={tokens.mutedForeground}
          style={{
            marginTop: 8,
            backgroundColor: tokens.muted,
            borderRadius: 11,
            padding: 16,
            color: tokens.foreground,
          }}
        />
        <Text style={{ color: tokens.mutedForeground, marginTop: 16, fontSize: 14 }}>
          {t("Title")}
        </Text>
        <TextInput
          value={title}
          maxLength={BOT_TITLE_MAX_LENGTH}
          onChangeText={setTitle}
          placeholder={t("Describe what this team bot does")}
          placeholderTextColor={tokens.mutedForeground}
          style={{
            marginTop: 8,
            backgroundColor: tokens.muted,
            borderRadius: 11,
            padding: 16,
            color: tokens.foreground,
          }}
        />
        <Text style={{ color: tokens.mutedForeground, marginTop: 16, fontSize: 14 }}>
          {t("Description")}
        </Text>
        <TextInput
          value={description}
          maxLength={BOT_DESCRIPTION_MAX_LENGTH}
          onChangeText={setDescription}
          placeholder={t("What this team bot is for")}
          placeholderTextColor={tokens.mutedForeground}
          multiline
          style={{
            marginTop: 8,
            backgroundColor: tokens.muted,
            borderRadius: 11,
            padding: 16,
            color: tokens.foreground,
            minHeight: 120,
            textAlignVertical: "top",
          }}
        />
        {error ? <Text style={{ color: tokens.destructive, marginTop: 16 }}>{error}</Text> : null}
        <Pressable
          onPress={() => void create()}
          disabled={!name.trim() || pending !== null}
          style={{
            marginTop: 24,
            backgroundColor: tokens.primary,
            borderRadius: 11,
            padding: 16,
            alignItems: "center",
            opacity: !name.trim() || pending !== null ? 0.4 : 1,
          }}
        >
          <Text style={{ color: tokens.primaryForeground, fontSize: 16 }}>
            {pending === "create" ? t("Creating…") : t("Create team bot")}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
