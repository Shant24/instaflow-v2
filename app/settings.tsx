import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { GlassIconButton } from "@/components/GlassIconButton";
import {
  deleteAllHistory,
  fetchAllHistoryIds,
  fetchSnapshotById,
} from "@/lib/analysis";
import { getAuthInstance } from "@/lib/firebase";
import { useAppTheme } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import {
  usePreferencesStore,
  type ThemePreference,
} from "@/store/usePreferencesStore";

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const preference = usePreferencesStore((s) => s.themePreference);
  const setPreference = usePreferencesStore((s) => s.setThemePreference);
  const clearFollowers = useAnalysisStore((s) => s.clearFollowers);
  const clearFollowing = useAnalysisStore((s) => s.clearFollowing);
  const reset = useAnalysisStore((s) => s.reset);
  const refreshAll = useAnalysisStore((s) => s.refreshAll);

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const appVersion =
    Constants.expoConfig?.version ??
    (Constants.easConfig as { version?: string } | undefined)?.version ??
    "—";
  const userId = getAuthInstance().currentUser?.uid ?? null;

  async function handleExport() {
    try {
      setExporting(true);
      const ids = await fetchAllHistoryIds(1000);
      if (ids.length === 0) {
        Alert.alert("Nothing to export", "You have no snapshots saved yet.");
        return;
      }
      const snapshots = await Promise.all(
        ids.map(async ({ id, createdAt }) => ({
          id,
          createdAt: createdAt.toISOString(),
          data: await fetchSnapshotById(id),
        })),
      );
      const payload = {
        exportedAt: new Date().toISOString(),
        appVersion,
        snapshots,
      };
      const file = new File(Paths.cache, `instaflow-history-${Date.now()}.json`);
      file.create({ overwrite: true });
      file.write(JSON.stringify(payload, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Instaflow history",
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          "Sharing unavailable",
          `Saved to ${file.uri}. Share sheet isn't available on this device.`,
        );
      }
    } catch (err) {
      Alert.alert(
        "Export failed",
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setExporting(false);
    }
  }

  function handleClearCurrent() {
    Alert.alert(
      "Clear current upload",
      "Removes the followers/following files you've loaded in this session. Your saved snapshots aren't touched.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearFollowers();
            clearFollowing();
          },
        },
      ],
    );
  }

  function handleDeleteAll() {
    Alert.alert(
      "Delete all snapshots?",
      "This permanently removes every saved snapshot from Firestore. You'll lose all history and charts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you absolutely sure?",
              "This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, delete everything",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setDeleting(true);
                      const count = await deleteAllHistory();
                      reset();
                      await refreshAll();
                      Alert.alert(
                        "Deleted",
                        `${count} snapshot${count === 1 ? "" : "s"} removed.`,
                      );
                    } catch (err) {
                      Alert.alert(
                        "Delete failed",
                        err instanceof Error ? err.message : "Unknown error",
                      );
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Settings",
          headerLeft: () => (
            <GlassIconButton
              icon="close"
              onPress={() => router.back()}
              accessibilityLabel="Close"
              style={{ marginLeft: 16 }}
            />
          ),
        }}
      />
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View className="px-6 pt-4">
          <Text className="text-[13px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Instaflow
          </Text>
          <Text className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </Text>
        </View>

        <Section title="Appearance">
          <View className="flex-row gap-2">
            {APPEARANCE_OPTIONS.map((opt) => {
              const active = preference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreference(opt.value)}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className={[
                        "items-center rounded-2xl px-3 py-3",
                        active
                          ? "bg-indigo-600 dark:bg-indigo-400"
                          : pressed
                            ? "bg-slate-200 dark:bg-slate-800"
                            : "bg-slate-100 dark:bg-slate-800/60",
                      ].join(" ")}
                    >
                      <Text
                        className={[
                          "text-sm font-semibold",
                          active
                            ? "text-white"
                            : "text-slate-700 dark:text-slate-200",
                        ].join(" ")}
                      >
                        {opt.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Choose how the app should look. System follows your device setting.
          </Text>
        </Section>

        <Section title="Data">
          <Row
            icon="download-outline"
            label="Export history as JSON"
            sublabel="Save all snapshots to a file and share"
            onPress={handleExport}
            loading={exporting}
          />
          <Row
            icon="trash-outline"
            label="Clear current upload"
            sublabel="Forget the loaded followers/following files"
            onPress={handleClearCurrent}
          />
          <Row
            icon="warning-outline"
            label="Delete all snapshots"
            sublabel="Permanently remove every saved day"
            destructive
            onPress={handleDeleteAll}
            loading={deleting}
          />
        </Section>

        <Section title="About">
          <InfoRow label="App version" value={appVersion} />
          <InfoRow
            label="Anonymous user ID"
            value={userId ?? "—"}
            mono
            onLongPress={() => {
              if (userId) Alert.alert("User ID", userId);
            }}
          />
          <View className="mt-3 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-900/30">
            <View className="flex-row">
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={palette.accent}
              />
              <Text className="ml-2 flex-1 text-xs leading-5 text-indigo-900 dark:text-indigo-200">
                Your JSON is parsed locally. Only the resulting lists (mutual /
                fans / not-back) sync to Firestore — never the raw files.
              </Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6 px-6">
      <Text className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  sublabel,
  onPress,
  destructive,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: (e: GestureResponderEvent) => void;
  destructive?: boolean;
  loading?: boolean;
}) {
  const { palette } = useAppTheme();
  const iconColor = destructive ? palette.negative : palette.accent;
  const iconBg = destructive
    ? "bg-rose-50 dark:bg-rose-900/30"
    : "bg-indigo-50 dark:bg-indigo-900/30";
  return (
    <Pressable onPress={onPress} disabled={loading}>
      {({ pressed }) => (
        <View
          className={[
            "flex-row items-center rounded-2xl px-4 py-3.5",
            pressed
              ? "bg-white/80 dark:bg-slate-900/80"
              : "bg-white dark:bg-slate-900",
            loading ? "opacity-60" : "",
          ].join(" ")}
        >
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${iconBg}`}
          >
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className={[
                "text-[15px] font-semibold",
                destructive
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-slate-100",
              ].join(" ")}
            >
              {label}
            </Text>
            {sublabel ? (
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                {sublabel}
              </Text>
            ) : null}
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={palette.textMuted}
          />
        </View>
      )}
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  mono,
  onLongPress,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onLongPress?: () => void;
}) {
  return (
    <Pressable onLongPress={onLongPress}>
      <View className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </Text>
        <Text
          className={[
            "max-w-[60%] text-right text-sm font-medium text-slate-900 dark:text-slate-100",
            mono ? "font-mono text-xs" : "",
          ].join(" ")}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </Pressable>
  );
}
