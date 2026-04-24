import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ProfileCard } from "@/components/ProfileCard";
import {
  SegmentedControl,
  type Segment,
} from "@/components/SegmentedControl";
import { StatCard } from "@/components/StatCard";
import { useAppTheme } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";

type Category = "new" | "not_back" | "mutual" | "fans";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette } = useAppTheme();
  const viewingSnapshot = useAnalysisStore((s) => s.viewingSnapshot);
  const viewingState = useAnalysisStore((s) => s.viewingState);
  const loadSnapshotById = useAnalysisStore((s) => s.loadSnapshotById);
  const clearViewingSnapshot = useAnalysisStore(
    (s) => s.clearViewingSnapshot,
  );

  const [category, setCategory] = useState<Category>("new");

  useEffect(() => {
    if (!id) return;
    loadSnapshotById(id);
    return () => clearViewingSnapshot();
  }, [id, loadSnapshotById, clearViewingSnapshot]);

  const prettyDate = id ? formatLongDate(id) : "Snapshot";
  const loading =
    viewingState === "loading" ||
    (viewingState === "idle" && viewingSnapshot === null);

  const lists: Record<Category, string[]> = useMemo(() => {
    if (!viewingSnapshot) {
      return { new: [], not_back: [], mutual: [], fans: [] };
    }
    return {
      new: viewingSnapshot.new_unfollowers,
      not_back: viewingSnapshot.not_following_back,
      mutual: viewingSnapshot.mutual,
      fans: viewingSnapshot.fans,
    };
  }, [viewingSnapshot]);

  const segments: Segment<Category>[] = [
    { value: "new", label: "New", count: lists.new.length },
    { value: "not_back", label: "Not back", count: lists.not_back.length },
    { value: "mutual", label: "Mutual", count: lists.mutual.length },
    { value: "fans", label: "Fans", count: lists.fans.length },
  ];

  const current = lists[category];
  const { emptyTitle, emptyBody } = emptyCopyFor(category);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: prettyDate,
          headerBackTitle: "Back",
        }}
      />
      <SafeAreaView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        edges={["bottom"]}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={palette.accent} />
            <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading {prettyDate}…
            </Text>
          </View>
        ) : !viewingSnapshot ? (
          <View className="flex-1 items-center justify-center px-6">
            <EmptyState
              icon="alert-circle-outline"
              title="Snapshot not found"
              body="That day's snapshot couldn't be loaded. It may have been deleted."
            />
          </View>
        ) : (
          <FlatList
            data={current}
            keyExtractor={(item) => item}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 40,
              gap: 8,
            }}
            ListHeaderComponent={
              <View style={{ gap: 16 }} className="pb-2">
                <View className="flex-row gap-3">
                  <StatCard
                    label="Followers"
                    value={viewingSnapshot.counts.followers}
                  />
                  <StatCard
                    label="Following"
                    value={viewingSnapshot.counts.following}
                  />
                  <StatCard
                    label="Mutual"
                    value={viewingSnapshot.counts.mutual}
                  />
                </View>
                <SegmentedControl
                  segments={segments}
                  value={category}
                  onChange={setCategory}
                />
              </View>
            }
            renderItem={({ item }) => (
              <ProfileCard username={item} accent={category === "new"} />
            )}
            ListEmptyComponent={
              <View className="px-1 pt-8">
                <EmptyState
                  icon="people-outline"
                  title={emptyTitle}
                  body={emptyBody}
                />
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

function emptyCopyFor(category: Category): {
  emptyTitle: string;
  emptyBody: string;
} {
  switch (category) {
    case "new":
      return {
        emptyTitle: "No new unfollowers",
        emptyBody:
          "No one new stopped following you between this snapshot and the previous one.",
      };
    case "not_back":
      return {
        emptyTitle: "Everyone followed back",
        emptyBody: "On this day, everyone you followed also followed you back.",
      };
    case "mutual":
      return {
        emptyTitle: "No mutuals",
        emptyBody: "No mutual follows were recorded for this day.",
      };
    case "fans":
      return {
        emptyTitle: "No fans",
        emptyBody:
          "Nobody was following you without a follow-back on this day.",
      };
  }
}

function formatLongDate(id: string): string {
  const [y, m, d] = id.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return id;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
