import { useRouter } from "expo-router";
import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { EmptyState } from "./EmptyState";
import { ProfileCard } from "./ProfileCard";

type Props = {
  usernames: string[];
  accent?: boolean;
  emptyTitle: string;
  emptyBody: string;
  ctaLabel?: string;
};

export function UserList({
  usernames,
  accent,
  emptyTitle,
  emptyBody,
  ctaLabel = "Load new data",
}: Props) {
  const router = useRouter();
  const historyState = useAnalysisStore((s) => s.historyState);
  const snapshotState = useAnalysisStore((s) => s.snapshotState);
  const refreshAll = useAnalysisStore((s) => s.refreshAll);
  const { palette } = useAppTheme();

  const refreshing =
    historyState === "loading" || snapshotState === "loading";

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      edges={["bottom"]}
    >
      <FlatList
        data={usernames}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
          gap: 8,
        }}
        renderItem={({ item }) => (
          <ProfileCard username={item} accent={accent} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={palette.accent}
            onRefresh={() => {
              refreshAll();
            }}
          />
        }
        ListEmptyComponent={
          <View className="px-1 pt-8">
            <EmptyState
              icon="people-outline"
              title={emptyTitle}
              body={emptyBody}
              ctaLabel={ctaLabel}
              onCtaPress={() => router.push("/upload")}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
