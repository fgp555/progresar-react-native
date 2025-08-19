import { Linking, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import React from "react";
import Drawer from "expo-router/drawer";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { androidVersion, backendDomain, playStoreUrl } from "@/src/config/constants";
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import useAuthStore from "@/src/hooks/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function BankingDrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomBankingDrawer}
      screenOptions={({ navigation }) => ({
        drawerPosition: "left",
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.headerButton}>
            <MaterialIcons name="menu" size={26} color="#dc2626" />
          </TouchableOpacity>
        ),
        headerTitleAlign: "center",
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
      })}
    />
  );
}

const CustomBankingDrawer = (props: DrawerContentComponentProps) => {
  const router = useRouter() as any;
  const pathname = usePathname();
  const { userStore, removeUser, token, isAdmin } = useAuthStore();

  const handleLogout = () => {
    removeUser();
    router.push("/");
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        title: "Panel Principal",
        icon: "dashboard" as const,
        route: "/operations",
      },
      {
        title: "Mi Perfil",
        icon: "account-circle" as const,
        route: "/profile",
      },
    ];

    const adminItems = isAdmin
      ? [
          {
            title: "Gestión de Usuarios",
            icon: "group" as const,
            route: "/user/list",
          },
        ]
      : [];

    const aboutItem = {
      title: "Acerca del Sistema",
      icon: "info" as const,
      route: "/about",
    };

    return [...baseItems, ...adminItems, aboutItem];
  };

  const menuItems = getMenuItems();

  return (
    <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <MaterialIcons name="account-balance" size={40} color="#dc2626" />
            </View>
            <Text style={styles.bankTitle}>PROGRESAR</Text>
            <Text style={styles.bankSubtitle}>Proyeccion Fondo De Ahorro</Text>
          </View>

          {/* User Info */}
          {userStore && (
            <BlurView intensity={20} tint="light" style={styles.userCard}>
              <View style={styles.userAvatar}>
                <MaterialIcons name="person" size={24} color="#dc2626" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userStore.user.name || "Usuario"}</Text>
                <Text style={styles.userEmail}>{userStore.user.email}</Text>
                {isAdmin && (
                  <View style={styles.adminBadge}>
                    <MaterialIcons name="admin-panel-settings" size={12} color="#fbbf24" />
                    <Text style={styles.adminText}>ADMINISTRADOR</Text>
                  </View>
                )}
              </View>
            </BlurView>
          )}
        </View>

        {/* Navigation Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>NAVEGACIÓN</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route)}
              style={[styles.menuItem, pathname === item.route && styles.activeMenuItem]}
            >
              <BlurView
                intensity={pathname === item.route ? 30 : 15}
                tint={pathname === item.route ? "light" : "default"}
                style={styles.menuItemContent}
              >
                <View style={styles.menuItemLeft}>
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={pathname === item.route ? "#dc2626" : "rgba(255,255,255,0.8)"}
                  />
                  <Text style={[styles.menuItemText, pathname === item.route && styles.activeMenuItemText]}>
                    {item.title}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={16}
                  color={pathname === item.route ? "#dc2626" : "rgba(255,255,255,0.6)"}
                />
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.menuSectionTitle}>ACCIONES RÁPIDAS</Text>

          <TouchableOpacity onPress={() => Linking.openURL(playStoreUrl)} style={styles.quickActionItem}>
            <BlurView intensity={15} tint="default" style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="system-update" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.menuItemText}>Actualizar App</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color="rgba(255,255,255,0.6)" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`https://${backendDomain}`)} style={styles.quickActionItem}>
            <BlurView intensity={15} tint="default" style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons name="language" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.menuItemText}>Portal Web</Text>
              </View>
              <MaterialIcons name="open-in-new" size={16} color="rgba(255,255,255,0.6)" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.logoutGradient}>
            <MaterialIcons name="logout" size={20} color="white" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.versionText}>Versión {androidVersion}</Text>
        </View>
        <View style={styles.versionContainer}>
          <MaterialIcons name="language" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.versionText}>{`https://${backendDomain}`}</Text>
        </View>

        {/* Security Badge */}
        <View style={styles.securityFooter}>
          <MaterialIcons name="security" size={14} color="#fca5a5" />
          <Text style={styles.securityText}>Conexión Segura</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrapper: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bankTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
  },
  bankSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // User Card Styles
  userCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  adminText: {
    fontSize: 10,
    color: "#fbbf24",
    fontWeight: "600",
    marginLeft: 4,
  },

  // Menu Styles
  menuContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  quickActionItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  activeMenuItem: {
    // Additional styling handled by BlurView intensity
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 12,
    fontWeight: "500",
  },
  activeMenuItemText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  // Footer Styles
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  versionText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginLeft: 6,
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(252,165,165,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(252,165,165,0.2)",
  },
  securityText: {
    fontSize: 11,
    color: "#fca5a5",
    fontWeight: "600",
    marginLeft: 6,
  },
});
