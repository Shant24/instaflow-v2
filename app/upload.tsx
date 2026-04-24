import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Dropzone } from "@/components/Dropzone";
import { GlassIconButton } from "@/components/GlassIconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { pickJsonFile } from "@/lib/fs";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function UploadScreen() {
  const router = useRouter();
  const followersFile = useAnalysisStore((s) => s.followersFile);
  const followingFile = useAnalysisStore((s) => s.followingFile);
  const status = useAnalysisStore((s) => s.status);
  const error = useAnalysisStore((s) => s.error);
  const loadFollowers = useAnalysisStore((s) => s.loadFollowers);
  const loadFollowing = useAnalysisStore((s) => s.loadFollowing);
  const clearFollowers = useAnalysisStore((s) => s.clearFollowers);
  const clearFollowing = useAnalysisStore((s) => s.clearFollowing);
  const analyze = useAnalysisStore((s) => s.analyze);

  const [localLoading, setLocalLoading] =
    useState<"followers" | "following" | null>(null);

  const readyToAnalyze = !!followersFile && !!followingFile;

  async function handlePick(kind: "followers" | "following") {
    try {
      setLocalLoading(kind);
      const file = await pickJsonFile();
      if (!file) return;
      if (kind === "followers") {
        await loadFollowers(file);
      } else {
        await loadFollowing(file);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't read that file.";
      Alert.alert("Failed to parse file", message);
    } finally {
      setLocalLoading(null);
    }
  }

  async function handleAnalyze() {
    const result = await analyze();
    if (result) {
      router.back();
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Load Instagram data",
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
            Analyze your followers
          </Text>
          <Text className="mt-2 text-base leading-6 text-slate-500 dark:text-slate-400">
            Load your exported Instagram JSON files. Everything is parsed
            locally, then compared to your latest saved snapshot.
          </Text>
        </View>

        <View className="mt-7 gap-4 px-6">
          <Dropzone
            label="Followers"
            hint="Tap to select followers_1.json"
            loadedName={followersFile?.name ?? null}
            loadedCount={followersFile?.usernames.length}
            loading={localLoading === "followers"}
            onPress={() => handlePick("followers")}
            onClear={clearFollowers}
          />
          <Dropzone
            label="Following"
            hint="Tap to select following.json"
            loadedName={followingFile?.name ?? null}
            loadedCount={followingFile?.usernames.length}
            loading={localLoading === "following"}
            onPress={() => handlePick("following")}
            onClear={clearFollowing}
          />
        </View>

        {error ? (
          <View className="mx-6 mt-4 rounded-2xl bg-rose-50 p-4 dark:bg-rose-950/40">
            <Text className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {error}
            </Text>
          </View>
        ) : null}

        <View className="mt-8 px-6">
          <PrimaryButton
            label="Analyze & Save to History"
            disabled={!readyToAnalyze}
            loading={status === "analyzing"}
            onPress={handleAnalyze}
          />
          <Text className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Today's snapshot will be saved to Firestore so you can diff new
            unfollowers next time.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
