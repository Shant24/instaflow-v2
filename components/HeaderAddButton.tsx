import { useRouter } from "expo-router";
import { GlassIconButton } from "./GlassIconButton";

export function HeaderAddButton() {
  const router = useRouter();
  return (
    <GlassIconButton
      icon="add"
      // variant="accent"
      onPress={() => router.push("/upload")}
      accessibilityLabel="Load new Instagram data"
      style={{ marginRight: 16 }}
    />
  );
}
