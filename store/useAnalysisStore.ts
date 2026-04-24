import { create } from "zustand";
import type { PickedFile } from "@/lib/fs";
import { readJsonFileAsync } from "@/lib/fs";
import { extractUsernames } from "@/lib/parser";
import {
  fetchAllHistoryIds,
  fetchHistory,
  fetchLatestSnapshot,
  fetchSnapshotById,
  runAnalysis,
  type AnalysisResult,
  type HistoryPoint,
  type Snapshot,
} from "@/lib/analysis";

export type LoadedFile = PickedFile & {
  usernames: string[];
};

export type HistoryDate = { id: string; date: Date };

type Status = "idle" | "analyzing" | "done" | "error";
type LoadState = "idle" | "loading" | "loaded" | "error";

type State = {
  followersFile: LoadedFile | null;
  followingFile: LoadedFile | null;
  status: Status;
  error: string | null;
  result: AnalysisResult | null;
  snapshot: Snapshot | null;
  history: HistoryPoint[];
  snapshotState: LoadState;
  historyState: LoadState;
  historyDates: HistoryDate[];
  historyDatesState: LoadState;
  viewingSnapshot: Snapshot | null;
  viewingState: LoadState;
};

type Actions = {
  loadFollowers: (file: PickedFile) => Promise<void>;
  loadFollowing: (file: PickedFile) => Promise<void>;
  clearFollowers: () => void;
  clearFollowing: () => void;
  analyze: () => Promise<AnalysisResult | null>;
  loadSnapshot: () => Promise<void>;
  loadHistory: (days?: number) => Promise<void>;
  loadHistoryDates: () => Promise<void>;
  loadSnapshotById: (id: string) => Promise<Snapshot | null>;
  clearViewingSnapshot: () => void;
  refreshAll: () => Promise<void>;
  reset: () => void;
};

const initialState: State = {
  followersFile: null,
  followingFile: null,
  status: "idle",
  error: null,
  result: null,
  snapshot: null,
  history: [],
  snapshotState: "idle",
  historyState: "idle",
  historyDates: [],
  historyDatesState: "idle",
  viewingSnapshot: null,
  viewingState: "idle",
};

export const useAnalysisStore = create<State & Actions>((set, get) => ({
  ...initialState,

  loadFollowers: async (file) => {
    const raw = await readJsonFileAsync(file.uri);
    const usernames = extractUsernames(raw);
    set({ followersFile: { ...file, usernames }, error: null });
  },

  loadFollowing: async (file) => {
    const raw = await readJsonFileAsync(file.uri);
    const usernames = extractUsernames(raw);
    set({ followingFile: { ...file, usernames }, error: null });
  },

  clearFollowers: () => set({ followersFile: null }),
  clearFollowing: () => set({ followingFile: null }),

  analyze: async () => {
    const { followersFile, followingFile } = get();
    if (!followersFile || !followingFile) return null;

    set({ status: "analyzing", error: null });
    try {
      const result = await runAnalysis(
        followersFile.usernames,
        followingFile.usernames,
      );
      set({
        status: "done",
        result,
        snapshot: {
          id: result.id,
          mutual: result.mutual,
          fans: result.fans,
          not_following_back: result.not_following_back,
          new_unfollowers: result.new_unfollowers,
          counts: result.counts,
        },
        snapshotState: "loaded",
      });
      await Promise.all([get().loadHistory(), get().loadHistoryDates()]);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed unexpectedly.";
      set({ status: "error", error: message });
      return null;
    }
  },

  loadSnapshot: async () => {
    set({ snapshotState: "loading" });
    try {
      const snap = await fetchLatestSnapshot();
      set({ snapshot: snap, snapshotState: "loaded" });
    } catch {
      set({ snapshotState: "error" });
    }
  },

  loadHistory: async (days = 30) => {
    set({ historyState: "loading" });
    try {
      const history = await fetchHistory(days);
      set({ history, historyState: "loaded" });
    } catch {
      set({ historyState: "error" });
    }
  },

  loadHistoryDates: async () => {
    set({ historyDatesState: "loading" });
    try {
      const ids = await fetchAllHistoryIds(366);
      set({
        historyDates: ids.map((r) => ({ id: r.id, date: r.createdAt })),
        historyDatesState: "loaded",
      });
    } catch {
      set({ historyDatesState: "error" });
    }
  },

  loadSnapshotById: async (id) => {
    set({ viewingState: "loading" });
    try {
      const snap = await fetchSnapshotById(id);
      set({ viewingSnapshot: snap, viewingState: "loaded" });
      return snap;
    } catch {
      set({ viewingState: "error" });
      return null;
    }
  },

  clearViewingSnapshot: () =>
    set({ viewingSnapshot: null, viewingState: "idle" }),

  refreshAll: async () => {
    await Promise.all([
      get().loadSnapshot(),
      get().loadHistory(),
      get().loadHistoryDates(),
    ]);
  },

  reset: () => set({ ...initialState }),
}));
