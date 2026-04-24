import { Ionicons } from "@expo/vector-icons";
import {
  GlassView,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppTheme } from "@/lib/theme";

type Variant = "neutral" | "accent";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  size?: number;
  variant?: Variant;
};

/**
 * A shared round icon button that renders with Apple's Liquid Glass on
 * iOS 26+ (via `expo-glass-effect`), a solid themed circle elsewhere. The
 * `accent` variant paints the glass with the indigo accent, `neutral`
 * keeps it chromed.
 */
export function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
  style,
  size = 36,
  variant = "neutral",
}: Props) {
  const { scheme, palette } = useAppTheme();
  const glass = Platform.OS === "ios" && isLiquidGlassAvailable();

  const iconColor =
    variant === "accent"
      ? "#ffffff"
      : scheme === "dark"
        ? palette.textPrimary
        : "#0f172a";

  const iconSize = Math.round(size * 0.55);

  if (glass) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={10}
        accessibilityLabel={accessibilityLabel}
        style={style}
      >
        <GlassView
          glassEffectStyle="regular"
          tintColor={variant === "accent" ? palette.accent : undefined}
          colorScheme={scheme === "dark" ? "dark" : "light"}
          isInteractive
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {({ pressed }) => (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              variant === "accent"
                ? pressed
                  ? palette.accentPressed
                  : palette.accent
                : pressed
                  ? scheme === "dark"
                    ? "rgba(148,163,184,0.22)"
                    : "rgba(15,23,42,0.12)"
                  : scheme === "dark"
                    ? "rgba(148,163,184,0.14)"
                    : "rgba(15,23,42,0.06)",
            shadowColor:
              variant === "accent" ? palette.accent : "transparent",
            shadowOpacity: variant === "accent" ? 0.3 : 0,
            shadowRadius: variant === "accent" ? 8 : 0,
            shadowOffset: { width: 0, height: 3 },
            elevation: variant === "accent" ? 3 : 0,
          }}
        >
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        </View>
      )}
    </Pressable>
  );
}
