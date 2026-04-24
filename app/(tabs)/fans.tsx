import { UserList } from "@/components/UserList";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function FansTab() {
  const snapshot = useAnalysisStore((s) => s.snapshot);
  return (
    <UserList
      usernames={snapshot?.fans ?? []}
      emptyTitle="No fans yet"
      emptyBody="Folks who follow you but you don't follow back will appear here."
    />
  );
}
