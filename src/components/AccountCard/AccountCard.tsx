
// src/components/AccountCard/AccountCard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axiosInstance from "@/src/config/axiosInstance";
import { useRouter } from "expo-router";

interface AccountCardProps {
  account: {
    id: string;
    numeroCuenta: string;
    tipoCuenta: string;
    saldo: string;
    moneda: string;
    fechaCreacion: string;
    estado: string;
    user?: {
      name: string;
      lastName: string;
    };
  };
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const [isActive, setIsActive] = useState(account.estado === "activa");
  const [isUpdating, setIsUpdating] = useState(false);
  //   const { hasRole } = useAuthStore();
  const router = useRouter();

  // Función para formatear balance (simplificada)
  const formatBalance = (balance: number): string => {
    try {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
        minimumFractionDigits: 2,
      }).format(balance);
    } catch (error) {
      return `S/ ${balance.toFixed(2)}`;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "ahorro":
        return "💰";
      case "corriente":
        return "🏦";
      case "plazo fijo":
        return "📈";
      default:
        return "💳";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const navigateToTransactions = () => {
    router.push(`/transactions/${account.id}`);
  };

  const navigateToLoans = () => {
    router.push(`/loans/${account.id}`);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.accountType}>
          <Text style={styles.accountTypeText}>
            {getAccountTypeIcon(account.tipoCuenta)} {account.tipoCuenta}
          </Text>
        </View>
      </View>

      {/* Account Number */}
      <View style={styles.accountNumberContainer}>
        <Text style={styles.accountNumber}>{account.numeroCuenta}</Text>
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Saldo Disponible</Text>
        <Text style={styles.balanceAmount}>{formatBalance(Number(account.saldo))}</Text>
      </View>

      {/* Meta Information */}
      <View style={styles.metaContainer}>
        {account.user && (
          <View style={[styles.metaItem, { marginBottom: 12 }]}>
            <Text style={styles.metaLabel}>Propietario</Text>
            <Text style={styles.metaValue}>{`${account.user.name} ${account.user.lastName}` || "No disponible"}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Fecha Creación</Text>
          <Text style={styles.metaValue}>{formatDate(account.fechaCreacion)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={navigateToTransactions}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>💸 Transacciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={navigateToLoans}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>🏦 Préstamos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#dc2626",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accountType: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    textTransform: "capitalize",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  toggleButton: {
    padding: 4,
    borderRadius: 4,
  },
  toggleIcon: {
    fontSize: 16,
  },
  accountNumberContainer: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
  },
  metaContainer: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    flex: 1,
  },
  metaValue: {
    fontSize: 14,
    color: "#1f2937",
    flex: 2,
    textAlign: "right",
  },
  actionsContainer: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: "#dc2626",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
});

export default AccountCard;
