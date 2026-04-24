import { Pressable, Text, View } from "react-native";

export type Segment<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: Props<T>) {
  return (
    <View className="flex-row rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/60">
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            className="flex-1"
          >
            <View
              className={[
                "items-center justify-center rounded-xl py-2",
                active ? "bg-white dark:bg-slate-900" : "",
              ].join(" ")}
              style={
                active
                  ? {
                      shadowColor: "#0f172a",
                      shadowOpacity: 0.06,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text
                className={[
                  "text-[13px] font-semibold",
                  active
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400",
                ].join(" ")}
              >
                {seg.label}
                {typeof seg.count === "number" ? (
                  <Text
                    className={[
                      "text-[11px] font-semibold",
                      active
                        ? "text-indigo-600 dark:text-indigo-300"
                        : "text-slate-400 dark:text-slate-500",
                    ].join(" ")}
                  >
                    {"  "}
                    {seg.count}
                  </Text>
                ) : null}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
