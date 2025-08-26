// app/transactions/[accountId].tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, StatusBar } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "@/src/hooks/useTransactions";
import TransaccionesHistorial from "@/src/components/TransaccionesHistorial/TransaccionesHistorial";

const TransactionsScreen: React.FC = () => {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { fetchAccountTransactions } = useTransactions();

  // Validar accountId
  if (!accountId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: No se proporcionó ID de cuenta.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cargar transacciones al montar
  useEffect(() => {
    fetchAccountTransactions(accountId, 1, 10);
  }, [accountId, fetchAccountTransactions]);

  // Navegación a diferentes operaciones
  const navigateToDeposit = () => {
    router.push(`/transactions/${accountId}/deposit`);
  };

  const navigateToWithdraw = () => {
    router.push(`/transactions/${accountId}/withdraw`);
  };

  const navigateToTransfer = () => {
    router.push(`/transactions/${accountId}/transfer`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.pageTitle}>Transacciones</Text>
              <Text style={styles.pageSubtitle}>Gestión de operaciones bancarias</Text>
            </View>

            {/* Acciones Rápidas */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={navigateToDeposit}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardIcon}>💰</Text>
                  <Text style={styles.cardTitle}>Depósito</Text>
                  <Text style={styles.cardSubtitle}>Ingrese dinero a su cuenta</Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Depositar</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={navigateToWithdraw}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardIcon}>🏧</Text>
                  <Text style={styles.cardTitle}>Retiro</Text>
                  <Text style={styles.cardSubtitle}>Retire dinero de su cuenta</Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Retirar</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={navigateToTransfer}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardIcon}>📤</Text>
                  <Text style={styles.cardTitle}>Transferencia</Text>
                  <Text style={styles.cardSubtitle}>Transfiera a otra cuenta</Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Transferir</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Historial */}
            <View style={styles.historialSection}>
              <TransaccionesHistorial accountId={accountId} />
            </View>
          </View>
        }
        renderItem={null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 20,
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
  backButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#dc2626",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#fecaca",
    textAlign: "center",
  },
  actionsGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardContent: {
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  historialSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default TransactionsScreen;