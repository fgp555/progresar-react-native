// src/components/TransaccionesHistorial/TransaccionesHistorial.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useTransactions } from "@/src/hooks/useTransactions";

interface TransaccionesHistorialProps {
  accountId: string;
}

interface Transaction {
  id: string;
  tipo: "deposito" | "retiro" | "transferencia";
  monto: number;
  descripcion: string;
  fecha: string;
  estado: "completada" | "pendiente" | "fallida";
  cuentaOrigen?: string;
  cuentaDestino?: string;
}

const TransaccionesHistorial: React.FC<TransaccionesHistorialProps> = ({ accountId }) => {
  const { transactions, loading, fetchAccountTransactions, refreshTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (accountId) {
      fetchAccountTransactions(accountId, 1, 20);
    }
  }, [accountId, fetchAccountTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions(accountId);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatMonto = (monto: number) => {
    try {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(monto);
    } catch (error) {
      return `S/ ${monto.toFixed(2)}`;
    }
  };

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case "deposito":
        return "💰";
      case "retiro":
        return "💸";
      case "transferencia":
        return "🔄";
      default:
        return "💳";
    }
  };

  const getTransactionColor = (tipo: string) => {
    switch (tipo) {
      case "deposito":
        return "#22c55e"; // Verde
      case "retiro":
        return "#ef4444"; // Rojo
      case "transferencia":
        return "#3b82f6"; // Azul
      default:
        return "#6b7280"; // Gris
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completada":
        return "#22c55e";
      case "pendiente":
        return "#f59e0b";
      case "fallida":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "completada":
        return "✅ Completada";
      case "pendiente":
        return "⏳ Pendiente";
      case "fallida":
        return "❌ Fallida";
      default:
        return "❓ Desconocido";
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionCard} activeOpacity={0.7}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionTypeContainer}>
          <Text style={styles.transactionIcon}>{getTransactionIcon(item.tipo)}</Text>
          <View>
            <Text style={[styles.transactionType, { color: getTransactionColor(item.tipo) }]}>
              {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.fecha)}</Text>
          </View>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: getTransactionColor(item.tipo) }]}>
            {item.tipo === "retiro" ? "-" : "+"}
            {formatMonto(item.monto)}
          </Text>
          <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]}>{getEstadoText(item.estado)}</Text>
        </View>
      </View>

      {item.descripcion && (
        <Text style={styles.transactionDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}

      {item.tipo === "transferencia" && (item.cuentaOrigen || item.cuentaDestino) && (
        <View style={styles.transferInfo}>
          {item.cuentaOrigen && <Text style={styles.transferText}>Desde: ***{item.cuentaOrigen.slice(-4)}</Text>}
          {item.cuentaDestino && <Text style={styles.transferText}>Hacia: ***{item.cuentaDestino.slice(-4)}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No hay transacciones</Text>
      <Text style={styles.emptyText}>
        Las transacciones aparecerán aquí cuando se realicen operaciones en esta cuenta.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Historial de Transacciones</Text>
      <Text style={styles.headerSubtitle}>
        {transactions.length} transacción{transactions.length !== 1 ? "es" : ""}
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={transactions.length === 0 ? styles.emptyListContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  transactionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  transactionDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
    fontStyle: "italic",
  },
  transferInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  transferText: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default TransaccionesHistorial;
