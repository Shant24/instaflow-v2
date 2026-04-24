import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  label: string;
  value: number;
  delta?: number | null;
  invertDelta?: boolean;
};

export function StatCard({ label, value, delta, invertDelta = false }: Props) {
  const showDelta = typeof delta === "number" && delta !== 0;
  const rawPositive = (delta ?? 0) > 0;
  const isGood = invertDelta ? !rawPositive : rawPositive;

  return (
    <View
      className="flex-1 rounded-3xl bg-white p-4 dark:bg-slate-900"
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Text className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </Text>
      <Text
        className="mt-2 text-[26px] font-bold text-slate-900 dark:text-slate-100"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value.toLocaleString()}
      </Text>
      {showDelta ? (
        <View
          className={`mt-2 flex-row items-center self-start rounded-full px-2 py-0.5 ${
            isGood
              ? "bg-emerald-50 dark:bg-emerald-900/30"
              : "bg-rose-50 dark:bg-rose-900/30"
          }`}
        >
          <Ionicons
            name={rawPositive ? "arrow-up" : "arrow-down"}
            size={11}
            color={isGood ? "#059669" : "#e11d48"}
          />
          <Text
            className={`ml-0.5 text-[11px] font-semibold ${
              isGood
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {Math.abs(delta ?? 0)}
          </Text>
        </View>
      ) : (
        <Text className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          —
        </Text>
      )}
    </View>
  );
}
