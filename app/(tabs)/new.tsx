import { UserList } from "@/components/UserList";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function NewUnfollowersTab() {
  const snapshot = useAnalysisStore((s) => s.snapshot);
  return (
    <UserList
      usernames={snapshot?.new_unfollowers ?? []}
      accent
      emptyTitle="No new unfollowers"
      emptyBody="We'll show anyone who stopped following you between the last snapshot and your next upload."
    />
  );
}
