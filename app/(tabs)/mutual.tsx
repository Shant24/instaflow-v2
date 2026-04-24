import { UserList } from "@/components/UserList";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function MutualTab() {
  const snapshot = useAnalysisStore((s) => s.snapshot);
  return (
    <UserList
      usernames={snapshot?.mutual ?? []}
      emptyTitle="No mutuals yet"
      emptyBody="Mutual follows will appear here after you load your first snapshot."
    />
  );
}
