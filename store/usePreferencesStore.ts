import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

type State = {
  themePreference: ThemePreference;
  hydrated: boolean;
};

type Actions = {
  setThemePreference: (value: ThemePreference) => void;
  _setHydrated: (value: boolean) => void;
};

const STORAGE_KEY = "instaflow.preferences.v1";

export const usePreferencesStore = create<State & Actions>()(
  persist(
    (set) => ({
      themePreference: "system",
      hydrated: false,
      setThemePreference: (value) => set({ themePreference: value }),
      _setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ themePreference: s.themePreference }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
