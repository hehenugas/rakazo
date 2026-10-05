import type { Project } from "@rakazo/contracts";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { rpc } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";
import { projectStatusColor, projectStatusLabel } from "../lib/project-status";

export default function ProjectDetailScreen() {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const router = useRouter();
  const { botId, botName, projectId } = useLocalSearchParams<{
    botId?: string;
    botName?: string;
    projectId?: string;
  }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError(t("Project link is incomplete"));
      setLoading(false);
      return;
    }
    let cancelled = false;
    void rpc<Project>("projects/get", { projectId })
      .then((next) => {
        if (!cancelled) setProject(next);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : t("Could not load project"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.background }}
      contentContainerStyle={{ padding: 24, gap: 18 }}
    >
      <Stack.Screen options={{ title: project?.title ?? t("Project") }} />
      {loading ? <ActivityIndicator color={tokens.mutedForeground} /> : null}
      {error ? <Text style={{ color: tokens.destructive, fontSize: 15 }}>{error}</Text> : null}
      {project ? (
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
              {project.title}
            </Text>
            <Text style={{ color: projectStatusColor(project.status, tokens), fontSize: 14 }}>
              {projectStatusLabel(project.status, t)}
            </Text>
            {project.objective ? (
              <Text selectable style={{ color: tokens.foreground, fontSize: 15, lineHeight: 22 }}>
                {project.objective}
              </Text>
            ) : null}
          </View>
          {project.plan.length ? (
            <View style={{ gap: 8 }}>
              <Text
                style={{ color: tokens.mutedForeground, fontSize: 13, textTransform: "uppercase" }}
              >
                {t("Plan")}
              </Text>
              {project.plan.map((step, index) => (
                <Text
                  key={`${index}-${step.slice(0, 16)}`}
                  selectable
                  style={{ color: tokens.foreground, fontSize: 15, lineHeight: 22 }}
                >
                  {`${index + 1}. ${step}`}
                </Text>
              ))}
            </View>
          ) : null}
          <View style={{ gap: 8 }}>
            <Text
              style={{ color: tokens.mutedForeground, fontSize: 13, textTransform: "uppercase" }}
            >
              {t("Tasks")}
            </Text>
            {project.tasks.length ? (
              project.tasks.map((task) => (
                <View
                  key={task.id}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: tokens.border,
                    backgroundColor: tokens.card,
                    padding: 14,
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          task.status === "completed" ? tokens.mutedForeground : tokens.foreground,
                      }}
                    />
                    <Text
                      style={{
                        color: tokens.mutedForeground,
                        fontSize: 13,
                        textTransform: "capitalize",
                        flex: 1,
                      }}
                    >
                      {task.status}
                    </Text>
                  </View>
                  <Text selectable style={{ color: tokens.foreground, fontSize: 15 }}>
                    {task.prompt}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: tokens.mutedForeground, fontSize: 14 }}>
                {t("No tasks yet")}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/thread",
                params: { botId: botId ?? "", name: botName ?? t("Bot") },
              })
            }
            style={{
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: tokens.primary,
              padding: 14,
            }}
          >
            <Text style={{ color: tokens.primaryForeground, fontSize: 15, fontWeight: "600" }}>
              {t("Open conversation")}
            </Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}
