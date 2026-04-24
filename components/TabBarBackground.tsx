import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/lib/theme";

/**
 * Tab bar background, iOS 26+ Liquid Glass when available.
 *
 * - iOS 26+: `GlassView` (Apple's real Liquid Glass).
 * - iOS <26: `BlurView` with `systemChromeMaterial{Light,Dark}` — the old
 *   frosted blur.
 * - Android: solid surface + hairline divider (blur is heavy and doesn't
 *   match system chrome).
 */
export function TabBarBackground() {
  const { scheme } = useAppTheme();

  if (Platform.OS === "ios") {
    if (isLiquidGlassAvailable()) {
      return (
        <GlassView
          glassEffectStyle="regular"
          colorScheme={scheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      );
    }
    return (
      <BlurView
        intensity={80}
        tint={
          scheme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight"
        }
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor:
            scheme === "dark"
              ? "rgba(15,23,42,0.96)"
              : "rgba(248,250,252,0.96)",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor:
            scheme === "dark"
              ? "rgba(148,163,184,0.2)"
              : "rgba(15,23,42,0.08)",
        },
      ]}
    />
  );
}
