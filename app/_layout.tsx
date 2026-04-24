import "../global.css";

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { checkFirebaseConfig, ensureAnonymousAuth } from "@/lib/firebase";
import { useAppTheme } from "@/lib/theme";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const configStatus = checkFirebaseConfig();
  const refreshAll = useAnalysisStore((s) => s.refreshAll);
  const prefsHydrated = usePreferencesStore((s) => s.hydrated);
  const theme = useAppTheme();

  useEffect(() => {
    if (!configStatus.ok) return;
    ensureAnonymousAuth()
      .then(() => {
        setReady(true);
        refreshAll();
      })
      .catch((err) =>
        setAuthError(err instanceof Error ? err.message : "Auth failed"),
      );
  }, [configStatus.ok, refreshAll]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
        {!configStatus.ok ? (
          <SetupScreen missing={configStatus.missing} />
        ) : ready && prefsHydrated ? (
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: theme.palette.background },
              headerShadowVisible: false,
              headerStyle: { backgroundColor: theme.palette.background },
              headerTitleStyle: {
                color: theme.palette.textPrimary,
                fontWeight: "700",
                fontSize: 17,
              },
              headerTintColor: theme.palette.textPrimary,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="upload"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.75, 1],
                sheetCornerRadius: 28,
                sheetGrabberVisible: true,
                headerTitle: "Load Instagram data",
                headerTitleAlign: "center",
                headerTitleStyle: {
                  color: theme.palette.textPrimary,
                  fontWeight: "700",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.75, 1],
                sheetCornerRadius: 28,
                sheetGrabberVisible: true,
                headerTitle: "Settings",
                headerTitleAlign: "center",
                headerTitleStyle: {
                  color: theme.palette.textPrimary,
                  fontWeight: "700",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="history/index"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.75, 1],
                sheetCornerRadius: 28,
                sheetGrabberVisible: true,
                headerTitle: "History",
                headerTitleAlign: "center",
                headerTitleStyle: {
                  color: theme.palette.textPrimary,
                  fontWeight: "700",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="history/[id]"
              options={{
                headerTitle: "Snapshot",
                headerTitleAlign: "center",
                headerBackTitle: "Back",
              }}
            />
          </Stack>
        ) : (
          <View
            className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950"
          >
            {authError ? (
              <View className="px-8">
                <Text className="text-center text-base font-medium text-rose-600 dark:text-rose-400">
                  Couldn't connect to Firebase
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                  {authError}
                </Text>
              </View>
            ) : (
              <>
                <ActivityIndicator color={theme.palette.accent} />
                <Text className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Connecting…
                </Text>
              </>
            )}
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function SetupScreen({ missing }: { missing: string[] }) {
  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      edges={["top", "bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-[13px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Instaflow · Setup
        </Text>
        <Text className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Firebase isn't configured yet
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-500 dark:text-slate-400">
          Create a file called{" "}
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            .env.local
          </Text>{" "}
          at the project root and add the missing variables below, then press{" "}
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            r
          </Text>{" "}
          in the Metro terminal to reload.
        </Text>

        <View className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/40">
          <Text className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Missing
          </Text>
          <View className="mt-2">
            {missing.map((key) => (
              <Text
                key={key}
                className="mt-1 font-mono text-[13px] text-slate-900 dark:text-slate-100"
              >
                {key}=
              </Text>
            ))}
          </View>
        </View>

        <View className="mt-6 rounded-2xl bg-slate-900 p-4 dark:bg-slate-800">
          <Text className="font-mono text-[12px] leading-5 text-slate-200">
            EXPO_PUBLIC_FIREBASE_API_KEY=…{"\n"}
            EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com{"\n"}
            EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project{"\n"}
            EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com{"\n"}
            EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…{"\n"}
            EXPO_PUBLIC_FIREBASE_APP_ID=1:…:web:…
          </Text>
        </View>

        <Text className="mt-6 text-sm leading-5 text-slate-500 dark:text-slate-400">
          Enable{" "}
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            Anonymous
          </Text>{" "}
          sign in under Authentication → Sign-in method, and create a{" "}
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            Cloud Firestore
          </Text>{" "}
          database in your Firebase console.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
