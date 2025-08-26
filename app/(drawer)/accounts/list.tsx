// src/components/AccountsList/AccountsList.tsx
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
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

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
}

export interface Account {
  id: string;
  usuarioId: string;
  numeroCuenta: string;
  tipoCuenta: "ahorro" | "corriente";
  saldo: string;
  moneda: string;
  fechaCreacion: string;
  estado: "activa" | "inactiva" | "bloqueada";
  user: User;
}

interface AccountsListProps {
  onAccountPress?: (account: Account) => void;
  onUserPress?: (user: User, account: Account) => void;
  showUserInfo?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({ onAccountPress, onUserPress, showUserInfo = true }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cargar cuentas
  const fetchAccounts = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/api/progresar/cuentas");
      const { data } = response.data;
      setAccounts(data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al cargar cuentas";
      setError(errorMessage);
      console.error("Error fetching accounts:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts(false);
    setRefreshing(false);
  };

  // Filtrar cuentas por búsqueda
  const filteredAccounts = accounts.filter(
    (account) =>
      account.numeroCuenta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.user.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Obtener color del tipo de cuenta
  const getAccountTypeColor = (type: string) => {
    return type === "ahorro" ? "#3b82f6" : "#8b5cf6";
  };

  // Obtener color del rol
  const getRoleColor = (role: string) => {
    return role === "admin" ? "#dc2626" : "#6b7280";
  };

  // Renderizar cuenta
  const renderAccount = ({ item: account }: { item: Account }) => (
    <View style={styles.accountCard}>
      {/* Header de la cuenta */}
      <View style={styles.accountHeader}>
        <TouchableOpacity onPress={() => onAccountPress && onAccountPress(account)}>
          <View style={styles.accountMainInfo}>
            <View style={styles.accountNumberSection}>
              <Text style={styles.accountNumber}>#{account.numeroCuenta}</Text>
              <View style={styles.accountBadges}>
                <View style={[styles.typeBadge, { backgroundColor: getAccountTypeColor(account.tipoCuenta) }]}>
                  <Text style={styles.badgeText}>{account.tipoCuenta.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getAccountStatusColor(account.estado) }]}>
                  <Text style={styles.badgeText}>{account.estado.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.balanceSection}>
              <Text style={styles.balanceAmount}>{formatCurrency(account.saldo, account.moneda)}</Text>
              <Text style={styles.balanceCurrency}>{account.moneda}</Text>
            </View>
          </View>

          <Text style={styles.accountDate}>Creada: {formatDate(account.fechaCreacion)}</Text>
        </TouchableOpacity>

        {/* Botones de acción mejorados - Fuera del TouchableOpacity */}
        <View style={styles.actionButtonsContainer}>
          <Link href={`/transactions/${account.id}`} push asChild>
            <TouchableOpacity style={styles.transactionsButton}>
              <MaterialIcons name="receipt-long" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>Transacciones</Text>
            </TouchableOpacity>
          </Link>

          <Link href={`/loans/${account.id}`} push asChild>
            <TouchableOpacity style={styles.loansButton}>
              <MaterialIcons name="account-balance-wallet" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>Préstamos</Text>
            </TouchableOpacity>
          </Link>

          <Link href={`./edit/${account.id}`} push asChild>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Información del usuario */}
      {showUserInfo && (
        <TouchableOpacity style={styles.userSection} onPress={() => onUserPress && onUserPress(account.user, account)}>
          <View style={styles.userHeader}>
            <Text style={styles.sectionTitle}>Titular de la Cuenta</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(account.user.role) }]}>
              <Text style={styles.roleText}>{account.user.role.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {account.user.name} {account.user.lastName}
            </Text>
            <Text style={styles.userUsername}>@{account.user.username}</Text>
            <Text style={styles.userEmail}>{account.user.email}</Text>
            <Text style={styles.userPhone}>{account.user.whatsapp}</Text>
          </View>

          <View style={styles.userStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: account.user.isActive ? "#22c55e" : "#ef4444",
                },
              ]}
            />
            <Text style={styles.userStatusText}>{account.user.isActive ? "Usuario Activo" : "Usuario Inactivo"}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  // Estadísticas generales
  const totalBalance = filteredAccounts.reduce((total, account) => total + parseFloat(account.saldo), 0);
  const activeAccounts = filteredAccounts.filter((account) => account.estado === "activa").length;
  const uniqueUsers = new Set(filteredAccounts.map((account) => account.usuarioId)).size;

  // Estado de carga
  if (loading && accounts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Cargando cuentas...</Text>
      </View>
    );
  }

  // Estado de error
  if (error && accounts.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchAccounts()}>
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
          placeholder="Buscar por cuenta, usuario o email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Estadísticas */}
      {filteredAccounts.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredAccounts.length}</Text>
            <Text style={styles.statLabel}>Total Cuentas</Text>
            <Text style={styles.statLabel}>{activeAccounts} Activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{uniqueUsers}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${totalBalance.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total USD</Text>
          </View>
        </View>
      )}

      {/* Lista de cuentas */}
      <FlatList
        data={filteredAccounts}
        renderItem={renderAccount}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No se encontraron cuentas</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? "Intenta con otros términos de búsqueda" : "No hay cuentas registradas"}
            </Text>
          </View>
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
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  listContainer: {
    padding: 16,
  },
  accountCard: {
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
  accountHeader: {
    padding: 20,
  },
  accountMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  accountNumberSection: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  accountBadges: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceSection: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 2,
  },
  balanceCurrency: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  accountDate: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
  },
  // Nuevos estilos para los botones de acción
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 44, // Altura mínima para mejor toque
  },
  transactionsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 44,
    backgroundColor: "#3b82f6", // Azul para transacciones
  },
  loansButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 44,
    backgroundColor: "#8b5cf6", // Púrpura para préstamos
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 44,
    backgroundColor: "#f59e0b", // Ámbar para editar
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  userSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    padding: 20,
    backgroundColor: "#fafafa",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
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
  userInfo: {
    marginBottom: 12,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  userUsername: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  userEmail: {
    fontSize: 14,
    color: "#374151",
  },
  userPhone: {
    fontSize: 14,
    color: "#374151",
  },
  userStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userStatusText: {
    fontSize: 14,
    color: "#6b7280",
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

export default AccountsList;
