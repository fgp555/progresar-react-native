import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useNavigation, usePathname, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, Linking, Platform } from "react-native";
import React, { useLayoutEffect } from "react";
import useAuthStore from "@/src/hooks/useAuthStore";
import { baseURL } from "@/src/config/constants";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function BankingTabLayout() {
  const navigation = useNavigation();
  const router = useRouter() as any;
  const { isAdmin } = useAuthStore();
  const pathname = usePathname();

  // Mostrar tabs solo en rutas principales, no en subrutas
  const showTabs = !pathname.startsWith("/operations/");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Centro de Operaciones",
      headerStyle: {
        backgroundColor: "white",
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
      headerTintColor: "#dc2626",
      headerTitleStyle: {
        fontWeight: "600",
        fontSize: 18,
      },
    });
  }, [navigation]);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: { display: "none" },
          headerShown: false,
        }}
      />
      {showTabs && (
        <View style={styles.tabContainer}>
          <LinearGradient colors={["rgba(220, 38, 38, 0.95)", "rgba(153, 27, 27, 0.95)"]} style={styles.tabBackground}>
            <BlurView intensity={20} tint="light" style={styles.tabBlur}>
              <View style={styles.customTabBar}>
                {/* Buscar/Consultar */}
                <BankingTabButton
                  title="Consultar"
                  icon="search"
                  materialIcon="search"
                  onPress={() => router.push("/operations")}
                  isActive={pathname === "/operations"}
                  description="Buscar operaciones"
                />

                {/* Transferencias */}
                <BankingTabButton
                  title="Transferir"
                  icon="exchange-alt"
                  materialIcon="swap-horiz"
                  onPress={() => router.push("/operations/transfer")}
                  isActive={pathname === "/operations/transfer"}
                  description="Nueva transferencia"
                />

                {/* Solo para administradores */}
                {isAdmin && (
                  <>
                    {/* Agregar Operación */}
                    <BankingTabButton
                      title="Agregar"
                      icon="plus-circle"
                      materialIcon="add-circle"
                      onPress={() => Linking.openURL(`${baseURL}/dashboard/order/create`)}
                      description="Nueva operación"
                      isExternal={true}
                    />

                    {/* Reportes */}
                    <BankingTabButton
                      title="Reportes"
                      icon="chart-line"
                      materialIcon="analytics"
                      onPress={() => router.push("/order/wablas/list")}
                      isActive={pathname === "/order/wablas/list"}
                      description="Análisis y reportes"
                    />
                  </>
                )}

                {/* Configuración */}
                <BankingTabButton
                  title="Config"
                  icon="cog"
                  materialIcon="settings"
                  onPress={() => router.push("/settings")}
                  isActive={pathname === "/settings"}
                  description="Configuración"
                />
              </View>
            </BlurView>
          </LinearGradient>

          {/* Security indicator */}
          <View style={styles.securityIndicator}>
            <MaterialIcons name="security" size={12} color="#fca5a5" />
            <Text style={styles.securityText}>Sesión Segura</Text>
          </View>
        </View>
      )}
    </>
  );
}

const BankingTabButton = ({
  title,
  icon,
  materialIcon,
  onPress,
  isActive = false,
  description = "",
  isExternal = false,
}: {
  title: string;
  icon: string;
  materialIcon: "search" | "swap-horiz" | "add-circle" | "analytics" | "settings" | "open-in-new";
  onPress: () => void;
  isActive?: boolean;
  description?: string;
  isExternal?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && (
        <LinearGradient colors={["rgba(239, 68, 68, 0.3)", "rgba(220, 38, 38, 0.3)"]} style={styles.activeBackground} />
      )}

      <View style={styles.iconContainer}>
        <MaterialIcons name={materialIcon} size={24} color={isActive ? "#dc2626" : "rgba(255,255,255,0.8)"} />
        {isExternal && (
          <MaterialIcons
            name="open-in-new"
            size={12}
            color={isActive ? "#dc2626" : "rgba(255,255,255,0.6)"}
            style={styles.externalIcon}
          />
        )}
      </View>

      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>{title}</Text>

      {description && (
        <Text style={[styles.tabButtonDescription, isActive && styles.activeTabButtonDescription]}>{description}</Text>
      )}

      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabBackground: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Safe area for iOS
  },
  tabBlur: {
    overflow: "hidden",
  },
  customTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: "relative",
    minHeight: 70,
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  externalIcon: {
    position: "absolute",
    top: -2,
    right: -6,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 2,
  },
  activeTabButtonText: {
    color: "#dc2626",
    fontWeight: "700",
  },
  tabButtonDescription: {
    fontSize: 8,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 10,
  },
  activeTabButtonDescription: {
    color: "rgba(220, 38, 38, 0.8)",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: "#dc2626",
    borderRadius: 2,
  },
  securityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  securityText: {
    fontSize: 10,
    color: "#fca5a5",
    fontWeight: "600",
    marginLeft: 4,
  },
});

// Colores de referencia para mantener consistencia
const BankingColors = {
  primary: "#dc2626",
  secondary: "#991b1b",
  accent: "#ef4444",
  success: "#fca5a5",
  warning: "#fbbf24",
  danger: "#dc2626",
  light: {
    gray: "rgba(255,255,255,0.6)",
    white: "rgba(255,255,255,0.9)",
  },
};
