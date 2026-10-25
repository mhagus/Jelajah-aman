// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.select({ ios: 88, default: 64 }),
          paddingBottom: Platform.select({ ios: 28, default: 8 }),
          paddingTop: 8,
          elevation: isDark ? 0 : 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {/* Tab 1: Beranda */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "partly-sunny" : "partly-sunny-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: Riwayat & Favorit (Perbaikan label navigasi yang lebih intuitif) */}
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Favorit",
          tabBarLabel: "Riwayat & Favorit",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: Pengaturan */}
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 4: Tentang */}
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang Aplikasi",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-circle-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Sembunyikan tab explore bawaan template expo */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}