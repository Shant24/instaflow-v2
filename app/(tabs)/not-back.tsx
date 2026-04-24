import { UserList } from "@/components/UserList";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function NotFollowingBackTab() {
  const snapshot = useAnalysisStore((s) => s.snapshot);
  return (
    <UserList
      usernames={snapshot?.not_following_back ?? []}
      emptyTitle="Nothing to see here"
      emptyBody="Everyone you follow also follows you back once you load your first snapshot."
    />
  );
}
