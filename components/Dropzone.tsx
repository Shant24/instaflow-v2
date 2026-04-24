import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

type Props = {
  label: string;
  hint: string;
  loadedName?: string | null;
  loadedCount?: number;
  loading?: boolean;
  onPress: () => void;
  onClear?: () => void;
};

export function Dropzone({
  label,
  hint,
  loadedName,
  loadedCount,
  loading,
  onPress,
  onClear,
}: Props) {
  const isLoaded = !!loadedName;

  return (
    <Pressable onPress={onPress} disabled={loading} className="w-full">
      {({ pressed }) => (
        <Animated.View
          entering={FadeIn.duration(240)}
          className={[
            "w-full rounded-3xl border-2 p-6",
            isLoaded
              ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
              : "border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900",
            pressed ? "opacity-80" : "opacity-100",
          ].join(" ")}
        >
          {isLoaded ? (
            <Animated.View
              key="loaded"
              entering={SlideInRight.duration(280).springify().damping(18)}
              className="flex-row items-center"
            >
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500">
                <Text className="text-lg font-bold text-white">✓</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                  {label}
                </Text>
                <Text
                  className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100"
                  numberOfLines={1}
                >
                  {loadedName}
                </Text>
                {typeof loadedCount === "number" ? (
                  <Text className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {loadedCount.toLocaleString()} usernames parsed
                  </Text>
                ) : null}
              </View>
              {onClear ? (
                <Pressable
                  hitSlop={12}
                  onPress={onClear}
                  className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-800"
                >
                  <Text className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                    ✕
                  </Text>
                </Pressable>
              ) : null}
            </Animated.View>
          ) : (
            <View className="items-center py-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Text className="text-2xl text-slate-700 dark:text-slate-200">
                  ⬆︎
                </Text>
              </View>
              <Text className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                {label}
              </Text>
              <Text className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                {hint}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}
