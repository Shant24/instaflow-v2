import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable onPress={onPress} disabled={isDisabled}>
      {({ pressed }) => (
        <View
          className={[
            "w-full flex-row items-center justify-center rounded-2xl py-4",
            isDisabled
              ? "bg-slate-200 dark:bg-slate-800"
              : pressed
                ? "bg-indigo-700 dark:bg-indigo-500"
                : "bg-indigo-600 dark:bg-indigo-400",
          ].join(" ")}
          style={
            isDisabled
              ? undefined
              : {
                  shadowColor: "#4f46e5",
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 6,
                }
          }
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={[
                "text-base font-semibold",
                isDisabled
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-white",
              ].join(" ")}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
