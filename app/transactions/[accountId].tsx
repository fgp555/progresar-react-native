// app/transactions/[accountId].tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, StatusBar } from "react-native";
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

      <FlatList
        data={[]} // 👈 truco: usar FlatList también para renderizar header + contenido
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.pageTitle}>Transacciones</Text>
              <Text style={styles.pageSubtitle}>Gestión de operaciones</Text>
            </View>

            {/* Historial */}
            <View style={styles.historialSection}>
              <TransaccionesHistorial accountId={accountId} />
            </View>
          </View>
        }
        renderItem={null} // no hay items, usamos solo header
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    marginBottom: 30,
  },
  actionCard: {
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
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  cardContent: {
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default TransactionsScreen;
