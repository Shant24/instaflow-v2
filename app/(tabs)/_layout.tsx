import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { HeaderSettingsButton } from "@/components/HeaderSettingsButton";
import { TabBarBackground } from "@/components/TabBarBackground";
import { useAppTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { palette } = useAppTheme();

  return (
    <Tabs
      initialRouteName="metrics"
      screenOptions={{
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 84 : 64,
        },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarActiveTintColor: palette.tabBarActive,
        tabBarInactiveTintColor: palette.tabBarInactive,
        headerLeft: () => <HeaderSettingsButton />,
        headerRight: () => <HeaderAddButton />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.background },
        headerTitleStyle: {
          color: palette.textPrimary,
          fontWeight: "700",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="metrics"
        options={{
          title: "Metrics",
          tabBarLabel: "Metrics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: "New",
          tabBarLabel: "New",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="not-back"
        options={{
          title: "Not Back",
          tabBarLabel: "Not Back",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-remove" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mutual"
        options={{
          title: "Mutual",
          tabBarLabel: "Mutual",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fans"
        options={{
          title: "Fans",
          tabBarLabel: "Fans",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
