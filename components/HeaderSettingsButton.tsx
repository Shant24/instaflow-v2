import { useRouter } from "expo-router";
import { GlassIconButton } from "./GlassIconButton";

export function HeaderSettingsButton() {
  const router = useRouter();
  return (
    <GlassIconButton
      icon="settings-outline"
      onPress={() => router.push("/settings")}
      accessibilityLabel="Open settings"
      style={{ marginLeft: 16 }}
    />
  );
}
