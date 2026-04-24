import { Text, View } from "react-native";

type Props = {
  username: string;
  accent?: boolean;
};

const GRADIENT_SWATCHES = [
  "bg-indigo-100 dark:bg-indigo-900/40",
  "bg-sky-100 dark:bg-sky-900/40",
  "bg-rose-100 dark:bg-rose-900/40",
  "bg-emerald-100 dark:bg-emerald-900/40",
  "bg-amber-100 dark:bg-amber-900/40",
  "bg-fuchsia-100 dark:bg-fuchsia-900/40",
] as const;

function swatchFor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0xffffffff;
  }
  return GRADIENT_SWATCHES[Math.abs(hash) % GRADIENT_SWATCHES.length];
}

export function ProfileCard({ username, accent }: Props) {
  const letter = username.charAt(0).toUpperCase() || "?";
  const swatch = swatchFor(username);

  return (
    <View
      className={[
        "flex-row items-center rounded-2xl bg-white px-4 py-3 dark:bg-slate-900",
        accent ? "border border-indigo-100 dark:border-indigo-800/60" : "",
      ].join(" ")}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${swatch}`}
      >
        <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">
          {letter}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold text-slate-900 dark:text-slate-100"
          numberOfLines={1}
        >
          {username}
        </Text>
        <Text
          className="text-[13px] text-slate-500 dark:text-slate-400"
          numberOfLines={1}
        >
          @{username}
        </Text>
      </View>
      {accent ? (
        <View className="ml-2 rounded-full bg-indigo-50 px-2 py-1 dark:bg-indigo-900/40">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            New
          </Text>
        </View>
      ) : null}
    </View>
  );
}
