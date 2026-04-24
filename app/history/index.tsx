import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { EmptyState } from "@/components/EmptyState";
import { GlassIconButton } from "@/components/GlassIconButton";
import { useAppTheme } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function HistoryCalendarScreen() {
  const router = useRouter();
  const { palette, scheme } = useAppTheme();
  const historyDates = useAnalysisStore((s) => s.historyDates);
  const historyDatesState = useAnalysisStore((s) => s.historyDatesState);
  const loadHistoryDates = useAnalysisStore((s) => s.loadHistoryDates);

  useEffect(() => {
    if (historyDatesState === "idle") loadHistoryDates();
  }, [historyDatesState, loadHistoryDates]);

  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      { marked: boolean; dotColor: string; selectedColor?: string }
    > = {};
    for (const { id } of historyDates) {
      marks[id] = { marked: true, dotColor: palette.accent };
    }
    return marks;
  }, [historyDates, palette.accent]);

  const availableIds = useMemo(
    () => new Set(historyDates.map((h) => h.id)),
    [historyDates],
  );

  const maxDate = historyDates[0]?.id;
  const minDate = historyDates[historyDates.length - 1]?.id;

  function handleDayPress(day: DateData) {
    if (!availableIds.has(day.dateString)) return;
    router.push({ pathname: "/history/[id]", params: { id: day.dateString } });
  }

  const loading = historyDatesState === "loading";
  const isEmpty = historyDatesState === "loaded" && historyDates.length === 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "History",
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
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      >
        <Text className="text-[13px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Snapshots
        </Text>
        <Text className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Browse a past day
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-500 dark:text-slate-400">
          Tap any highlighted date to open that day's full snapshot — stats
          plus every list that made it up.
        </Text>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator color={palette.accent} />
          </View>
        ) : isEmpty ? (
          <View className="mt-6">
            <EmptyState
              icon="calendar-outline"
              title="No snapshots yet"
              body="Load your Instagram data to save your first snapshot. Days you've analyzed will show up here with a dot."
              ctaLabel="Load data"
              onCtaPress={() => {
                router.back();
                router.push("/upload");
              }}
            />
          </View>
        ) : (
          <View
            className="mt-6 overflow-hidden rounded-3xl bg-white dark:bg-slate-900"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Calendar
              key={scheme}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              maxDate={maxDate}
              minDate={minDate}
              disableAllTouchEventsForDisabledDays
              disableAllTouchEventsForInactiveDays
              theme={{
                backgroundColor: palette.surface,
                calendarBackground: palette.surface,
                textSectionTitleColor: palette.textMuted,
                selectedDayBackgroundColor: palette.accent,
                selectedDayTextColor: "#ffffff",
                todayTextColor: palette.accent,
                dayTextColor: palette.textPrimary,
                textDisabledColor:
                  scheme === "dark" ? "#334155" : "#cbd5e1",
                dotColor: palette.accent,
                selectedDotColor: "#ffffff",
                arrowColor: palette.accent,
                disabledArrowColor:
                  scheme === "dark" ? "#334155" : "#cbd5e1",
                monthTextColor: palette.textPrimary,
                indicatorColor: palette.accent,
                textDayFontWeight: "500",
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
              }}
            />
          </View>
        )}

        {!loading && !isEmpty ? (
          <Text className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {historyDates.length} snapshot
            {historyDates.length === 1 ? "" : "s"} across{" "}
            {minDate ? formatDate(minDate) : "—"} to{" "}
            {maxDate ? formatDate(maxDate) : "—"}.
          </Text>
        ) : null}
      </ScrollView>
    </>
  );
}

function formatDate(id: string): string {
  const [y, m, d] = id.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return id;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
