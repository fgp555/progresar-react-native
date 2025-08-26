// src/components/UsersList/UsersList.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import axiosInstance from "@/src/config/axiosInstance";

export interface Account {
  id: string;
  usuarioId: string;
  numeroCuenta: string;
  tipoCuenta: "ahorro" | "corriente";
  saldo: string;
  moneda: string;
  fechaCreacion: string;
  estado: "activa" | "inactiva" | "bloqueada";
}

export interface User {
  _id: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  whatsapp: string;
  role: "admin" | "user";
  isVisible: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cuentas: Account[];
}

interface UsersListProps {
  onUserPress?: (user: User) => void;
  onAccountPress?: (account: Account, user: User) => void;
  showAccounts?: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ onUserPress, onAccountPress, showAccounts = true }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios
  const fetchUsers = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/api/progresar/usuarios");
      const { data } = response.data;
      setUsers(data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al cargar usuarios";
      setError(errorMessage);
      console.error("Error fetching users:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(false);
    setRefreshing(false);
  };

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numAmount);
    } else {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(numAmount);
    }
  };

  // Obtener color del rol
  const getRoleColor = (role: string) => {
    return role === "admin" ? "#dc2626" : "#3b82f6";
  };

  // Obtener color del estado de cuenta
  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case "activa":
        return "#22c55e";
      case "inactiva":
        return "#6b7280";
      case "bloqueada":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Renderizar cuenta individual
  const renderAccount = (account: Account, user: User) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountCard}
      onPress={() => onAccountPress && onAccountPress(account, user)}
    >
      <View style={styles.accountHeader}>
        <View>
          <Text style={styles.accountNumber}>#{account.numeroCuenta}</Text>
          <Text style={styles.accountType}>{account.tipoCuenta.toUpperCase()}</Text>
        </View>
        <View style={styles.accountBalance}>
          <Text style={styles.balanceAmount}>{formatCurrency(account.saldo, account.moneda)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getAccountStatusColor(account.estado) }]}>
            <Text style={styles.statusText}>{account.estado.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Renderizar usuario
  const renderUser = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      {/* Header del usuario */}
      <TouchableOpacity style={styles.userHeader} onPress={() => onUserPress && onUserPress(user)}>
        <View style={styles.userInfo}>
          <View style={styles.userNameSection}>
            <Text style={styles.userName}>
              {user.name} {user.lastName}
            </Text>
            <Text style={styles.userUsername}>@{user.username}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.whatsapp}</Text>
          <Text style={styles.userDate}>Registro: {formatDate(user.createdAt)}</Text>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.cuentas.length}</Text>
            <Text style={styles.statLabel}>Cuenta{user.cuentas.length !== 1 ? "s" : ""}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {user.cuentas.reduce((total, account) => total + parseFloat(account.saldo), 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total USD</Text>
          </View>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: user.isActive ? "#22c55e" : "#ef4444",
                },
              ]}
            />
            <Text style={styles.statLabel}>{user.isActive ? "Activo" : "Inactivo"}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Cuentas del usuario */}
      {showAccounts && user.cuentas.length > 0 && (
        <View style={styles.accountsSection}>
          <Text style={styles.accountsTitle}>Cuentas ({user.cuentas.length})</Text>
          {user.cuentas.map((account) => renderAccount(account, user))}
        </View>
      )}
    </View>
  );

  // Estado de carga
  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  // Estado de error
  if (error && users.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchUsers()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No se encontraron usuarios</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? "Intenta con otros términos de búsqueda" : "No hay usuarios registrados"}
            </Text>
          </View>
        }
        ListHeaderComponent={
          filteredUsers.length > 0 ? (
            <View style={styles.headerStats}>
              <Text style={styles.headerStatsText}>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado
                {filteredUsers.length !== 1 ? "s" : ""}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  listContainer: {
    padding: 16,
  },
  headerStats: {
    marginBottom: 16,
    alignItems: "center",
  },
  headerStatsText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  userHeader: {
    padding: 20,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userNameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  userDetails: {
    marginBottom: 16,
    gap: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#374151",
  },
  userPhone: {
    fontSize: 14,
    color: "#374151",
  },
  userDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  accountsSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accountsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    fontFamily: "monospace",
  },
  accountType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  accountBalance: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default UsersList;
