// app/(drawer)/me/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "@/src/config/axiosInstance";
import useAuthStore from "@/src/hooks/useAuthStore";
import AccountCard from "@/src/components/AccountCard/AccountCard";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

interface Cuenta {
  id: string;
  numeroCuenta: string;
  tipoCuenta: string;
  saldo: string;
  moneda: string;
  fechaCreacion: string;
  estado: string;
}

interface User {
  _id: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  whatsapp: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  cuentas: Cuenta[];
}

const UserDetailsScreen = () => {
  const { userStore, removeUser } = useAuthStore();
  const userId = userStore?.user?._id;

  // Tipo correcto para navigation del drawer
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchUser = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const res: any = await axiosInstance.get(`/api/progresar/usuarios/${userId}`);
      setUser(res.data.data);
      setError("");
    } catch (err: any) {
      let errorMessage = "Error al obtener usuario";

      if (err?.response?.data) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      console.error("Error al obtener usuario", err);

      // 🛑 Si el error es que no existe el usuario
      if (errorMessage.toLowerCase().includes("no encontrado")) {
        removeUser(); // limpia el store
        router.replace("/"); // redirige a home
        return; // importante: salir para que no ejecute el Alert
      }

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      if (showRefreshing) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("ID de usuario no proporcionado");
      setLoading(false);
      return;
    }

    fetchUser();
  }, [userId]);

  const onRefresh = () => {
    fetchUser(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "👑 Administrador",
      user: "👤 Usuario",
      moderator: "🛡️ Moderador",
    };
    return roleMap[role] || `🔖 ${role}`;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          {/* Header con botón de menú */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Cargando...</Text>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Cargando información del usuario...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          {/* Header con botón de menú */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Error</Text>
          </View>

          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          {/* Header con botón de menú */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Usuario no encontrado</Text>
          </View>

          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No se encontró el usuario.</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
          }
        >
          {/* Header con nombre y botón de menú */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {user.name} {user.lastName}
            </Text>
          </View>

          {/* Información del usuario */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Teléfono:</Text>
              <Text style={styles.infoValue}>{user.whatsapp}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 Rol:</Text>
              <Text style={styles.infoValue}>{formatRole(user.role)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🟢 Estado:</Text>
              <Text style={[styles.infoValue, { color: user.isActive ? "#22c55e" : "#ef4444" }]}>
                {user.isActive ? "✅ Activo" : "❌ Inactivo"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Fecha de Registro:</Text>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>

          {/* Sección de cuentas */}
          <View style={styles.accountsSection}>
            <Text style={styles.sectionTitle}>Cuentas</Text>

            {user.cuentas?.length > 0 ? (
              <View style={styles.accountsGrid}>
                {user.cuentas.map((account, index) => (
                  <View key={account.id} style={{ marginBottom: index < user.cuentas.length - 1 ? 12 : 0 }}>
                    <AccountCard account={account} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noAccountsContainer}>
                <Text style={styles.noAccountsText}>Este usuario no tiene cuentas registradas.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    lineHeight: 24,
  },
  header: {
    backgroundColor: "#dc2626",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    position: "relative",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  menuButton: {
    position: "absolute",
    left: 20,
    top: 24,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 1,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 20,
  },
  accountsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
  },
  accountsGrid: {
    // Espacio entre elementos manejado individualmente
  },
  noAccountsContainer: {
    backgroundColor: "#fef2f2",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderStyle: "dashed",
  },
  noAccountsText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default UserDetailsScreen;
