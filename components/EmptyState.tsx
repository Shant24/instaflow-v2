import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyState({
  icon = "sparkles-outline",
  title,
  body,
  ctaLabel,
  onCtaPress,
}: Props) {
  const { palette } = useAppTheme();
  return (
    <View className="items-center rounded-3xl bg-white px-6 py-10 dark:bg-slate-900">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/40">
        <Ionicons name={icon} size={26} color={palette.accent} />
      </View>
      <Text className="mt-4 text-center text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </Text>
      {body ? (
        <Text className="mt-1 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
          {body}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Pressable onPress={onCtaPress} className="mt-5">
          {({ pressed }) => (
            <View
              className={`rounded-2xl px-5 py-2.5 ${
                pressed
                  ? "bg-indigo-700 dark:bg-indigo-500"
                  : "bg-indigo-600 dark:bg-indigo-400"
              }`}
            >
              <Text className="text-sm font-semibold text-white">
                {ctaLabel}
              </Text>
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
