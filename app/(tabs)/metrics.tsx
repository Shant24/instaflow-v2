import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bar, CartesianChart, Line } from "victory-native";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import type { HistoryPoint, SnapshotCounts } from "@/lib/analysis";
import { useAppTheme, type Palette } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";

type ChartPoint = {
  day: number;
  followers: number;
  following: number;
  newUnfollowers: number;
};

export default function MetricsScreen() {
  const router = useRouter();
  const snapshot = useAnalysisStore((s) => s.snapshot);
  const history = useAnalysisStore((s) => s.history);
  const snapshotState = useAnalysisStore((s) => s.snapshotState);
  const historyState = useAnalysisStore((s) => s.historyState);
  const refreshAll = useAnalysisStore((s) => s.refreshAll);
  const { palette } = useAppTheme();

  const chartData: ChartPoint[] = useMemo(
    () =>
      history.map((h, i) => ({
        day: i,
        followers: h.counts.followers,
        following: h.counts.following,
        newUnfollowers: h.counts.new_unfollowers,
      })),
    [history],
  );

  const deltas = useMemo(() => deriveDeltas(history), [history]);

  const refreshing =
    snapshotState === "loading" || historyState === "loading";
  const counts = snapshot?.counts;
  const hasSnapshot = !!snapshot;
  const hasHistory = chartData.length >= 2;

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
          gap: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={palette.accent}
            onRefresh={() => {
              refreshAll();
            }}
          />
        }
      >
        {!hasSnapshot ? (
          <EmptyState
            icon="stats-chart-outline"
            title="No data yet"
            body="Load your exported Instagram JSON files to see your follower metrics and trends."
            ctaLabel="Load data"
            onCtaPress={() => router.push("/upload")}
          />
        ) : (
          <>
            <View className="flex-row gap-3">
              <StatCard
                label="Followers"
                value={counts?.followers ?? 0}
                delta={deltas.followers}
              />
              <StatCard
                label="Following"
                value={counts?.following ?? 0}
                delta={deltas.following}
              />
              <StatCard
                label="Mutual"
                value={counts?.mutual ?? 0}
                delta={deltas.mutual}
              />
            </View>

            <HistoryRow />

            <ChartCard
              title="Followers vs Following"
              subtitle={`Last ${chartData.length} snapshots`}
            >
              {hasHistory ? (
                <View style={{ height: 220 }}>
                  <CartesianChart
                    data={chartData}
                    xKey="day"
                    yKeys={["followers", "following"]}
                    domainPadding={{ top: 24, bottom: 24, left: 8, right: 8 }}
                    axisOptions={{
                      font: null,
                      lineColor: palette.chart.axisLine,
                      labelColor: palette.chart.axisLabel,
                      tickCount: { x: Math.min(4, chartData.length), y: 4 },
                    }}
                  >
                    {({ points }) => (
                      <>
                        <Line
                          points={points.followers}
                          color={palette.chart.followers}
                          strokeWidth={2.5}
                          animate={{ type: "timing", duration: 500 }}
                          curveType="monotoneX"
                        />
                        <Line
                          points={points.following}
                          color={palette.chart.following}
                          strokeWidth={2.5}
                          animate={{ type: "timing", duration: 500 }}
                          curveType="monotoneX"
                        />
                      </>
                    )}
                  </CartesianChart>
                </View>
              ) : (
                <NeedMoreData />
              )}
              <LegendRow
                items={[
                  { label: "Followers", color: palette.chart.followers },
                  { label: "Following", color: palette.chart.following },
                ]}
              />
            </ChartCard>

            <ChartCard
              title="New unfollowers / day"
              subtitle="Captured between each snapshot"
            >
              {hasHistory ? (
                <View style={{ height: 200 }}>
                  <CartesianChart
                    data={chartData}
                    xKey="day"
                    yKeys={["newUnfollowers"]}
                    domainPadding={{ top: 24, bottom: 12, left: 20, right: 20 }}
                    axisOptions={{
                      font: null,
                      lineColor: palette.chart.axisLine,
                      labelColor: palette.chart.axisLabel,
                      tickCount: { x: Math.min(4, chartData.length), y: 4 },
                    }}
                  >
                    {({ points, chartBounds }) => (
                      <Bar
                        points={points.newUnfollowers}
                        chartBounds={chartBounds}
                        color={palette.chart.unfollowers}
                        animate={{ type: "timing", duration: 500 }}
                        roundedCorners={{ topLeft: 6, topRight: 6 }}
                        barWidth={Math.max(
                          8,
                          200 / Math.max(1, chartData.length),
                        )}
                      />
                    )}
                  </CartesianChart>
                </View>
              ) : (
                <NeedMoreData />
              )}
            </ChartCard>

            <CompositionCard counts={counts} palette={palette} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryRow() {
  const router = useRouter();
  const { palette } = useAppTheme();
  return (
    <Pressable onPress={() => router.push("/history")}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center rounded-2xl px-4 py-3 ${
            pressed
              ? "bg-white/80 dark:bg-slate-900/80"
              : "bg-white dark:bg-slate-900"
          }`}
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.04,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/40">
            <Ionicons name="calendar-outline" size={18} color={palette.accent} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              Browse history
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Open any past snapshot
            </Text>
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

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className="rounded-3xl bg-white p-4 dark:bg-slate-900"
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </Text>
      ) : null}
      <View className="mt-3">{children}</View>
    </View>
  );
}

function LegendRow({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <View className="mt-2 flex-row gap-4">
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <Text className="ml-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function NeedMoreData() {
  return (
    <View className="items-center justify-center py-10">
      <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
        Charts populate after your second snapshot.
      </Text>
    </View>
  );
}

function CompositionCard({
  counts,
  palette,
}: {
  counts: SnapshotCounts | undefined;
  palette: Palette;
}) {
  if (!counts) return null;
  const total = counts.mutual + counts.not_following_back + counts.fans;
  if (total === 0) return null;

  const segments = [
    { label: "Mutual", value: counts.mutual, color: palette.chart.followers },
    {
      label: "Not back",
      value: counts.not_following_back,
      color: palette.chart.unfollowers,
    },
    { label: "Fans", value: counts.fans, color: palette.positive },
  ];

  return (
    <ChartCard title="Composition" subtitle="Today's snapshot">
      <View className="h-3 flex-row overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {segments.map((s) => (
          <View
            key={s.label}
            style={{
              flex: s.value / total || 0.0001,
              backgroundColor: s.color,
            }}
          />
        ))}
      </View>
      <View className="mt-3 flex-row flex-wrap gap-3">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <View key={s.label} className="flex-row items-center">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <Text className="ml-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {s.label} · {pct}%
              </Text>
            </View>
          );
        })}
      </View>
    </ChartCard>
  );
}

function deriveDeltas(history: HistoryPoint[]) {
  if (history.length < 2) {
    return { followers: null, following: null, mutual: null };
  }
  const last = history[history.length - 1]!.counts;
  const prev = history[history.length - 2]!.counts;
  return {
    followers: last.followers - prev.followers,
    following: last.following - prev.following,
    mutual: last.mutual - prev.mutual,
  };
}
