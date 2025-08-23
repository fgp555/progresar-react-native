// app/loans/[accountId].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoans, type Loan } from "@/src/hooks/useLoans";

const LoansScreen: React.FC = () => {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { loans, loading, error, fetchAccountLoans, getNextInstallment, getRemainingBalance, formatCurrency } =
    useLoans();
  const [refreshing, setRefreshing] = useState(false);

  // Validar accountId
  if (!accountId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: No se proporcionó ID de cuenta.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cargar préstamos al montar
  useEffect(() => {
    fetchAccountLoans(accountId);
  }, [accountId, fetchAccountLoans]);

  // Función de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccountLoans(accountId);
    setRefreshing(false);
  };

  // Formatear moneda usando la utilidad del hook
  const formatAmount = (amount: string | number) => {
    return formatCurrency(amount);
  };

  // Obtener color del estado del préstamo
  const getLoanStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activo":
        return "#22c55e"; // Verde
      case "completado":
        return "#6b7280"; // Gris
      case "cancelado":
        return "#ef4444"; // Rojo
      default:
        return "#6b7280";
    }
  };

  // Obtener color del score
  const getScoreColor = (score: number) => {
    if (score >= 70) return "#22c55e"; // Verde
    if (score >= 50) return "#f59e0b"; // Amarillo
    return "#ef4444"; // Rojo
  };

  // Calcular saldo pendiente usando la utilidad del hook
  const getRemainingBalanceFormatted = (loan: Loan) => {
    return formatAmount(getRemainingBalance(loan));
  };

  // Calcular progreso de pago
  const getPaymentProgress = (loan: Loan) => {
    return ((loan.cuotasPagadas || 0) / loan.numeroCuotas) * 100;
  };

  const renderLoanCard = ({ item: loan }: { item: Loan }) => (
    <TouchableOpacity style={styles.loanCard} activeOpacity={0.7}>
      {/* Header con ID y estado */}
      <View style={styles.loanHeader}>
        <Text style={styles.loanId}>#{loan.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getLoanStatusColor(loan.estado) }]}>
          <Text style={styles.statusText}>{loan.estado.toUpperCase()}</Text>
        </View>
      </View>

      {/* Monto principal y score */}
      <View style={styles.loanMainInfo}>
        <View>
          <Text style={styles.loanLabel}>Monto Principal</Text>
          <Text style={styles.loanAmount}>{formatAmount(loan.montoPrincipal)}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.loanLabel}>Score</Text>
          <Text style={[styles.scoreText, { color: getScoreColor(loan.scoreAprobacion) }]}>
            {loan.scoreAprobacion}%
          </Text>
        </View>
      </View>

      {/* Progreso de pago */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>
            Cuotas pagadas: {loan.cuotasPagadas} / {loan.numeroCuotas}
          </Text>
          <Text style={styles.progressPercentage}>{getPaymentProgress(loan).toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getPaymentProgress(loan)}%` }]} />
        </View>
      </View>

      {/* Información detallada */}
      <View style={styles.loanDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cuota Mensual:</Text>
          <Text style={styles.detailValue}>{formatAmount(loan.montoCuota)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Saldo Pendiente:</Text>
          <Text style={styles.detailValue}>{getRemainingBalanceFormatted(loan)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Monto Total:</Text>
          <Text style={styles.detailValue}>{formatAmount(loan.montoTotal)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Intereses:</Text>
          <Text style={styles.detailValue}>{formatAmount(loan.interesTotal)}</Text>
        </View>
      </View>

      {/* Botones de acción */}
      {/* {loan.estado === "activo" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.payButton} onPress={() => handlePayInstallment(loan.id)}>
            <Text style={styles.payButtonText}>💰 Pagar Cuota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(loan.id)}>
            <Text style={styles.detailsButtonText}>📋 Detalles</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </TouchableOpacity>
  );

  const handlePayInstallment = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const nextInstallment = getNextInstallment(loan);
    if (!nextInstallment) {
      Alert.alert("Información", "No hay cuotas pendientes para este préstamo");
      return;
    }

    Alert.alert(
      "Pagar Cuota",
      `¿Desea pagar la cuota #${nextInstallment.numeroCuota} por ${formatAmount(nextInstallment.monto)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Pagar",
          onPress: () => {
            // Aquí implementarías la lógica de pago
            Alert.alert("En desarrollo", "Función de pago en desarrollo");
          },
        },
      ]
    );
  };

  const handleViewDetails = (loanId: string) => {
    // Navegar a detalles del préstamo
    router.push(`/loans/${accountId}/details/${loanId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No tienes préstamos</Text>
      <Text style={styles.emptyDescription}>Solicita tu primer préstamo para comenzar</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>Préstamos Activos</Text>
      <Text style={styles.headerSubtitle}>
        {loans.length} préstamo{loans.length !== 1 ? "s" : ""} en el sistema
      </Text>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
    </View>
  );

  if (loading && loans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Préstamos</Text>
          <Text style={styles.pageSubtitle}>Sistema de préstamos con evaluación crediticia</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Cargando préstamos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Préstamos</Text>
        <Text style={styles.pageSubtitle}>Sistema de préstamos con evaluación crediticia</Text>
      </View>

      {/* Lista de préstamos */}
      <FlatList
        data={loans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
        }
        contentContainerStyle={[styles.listContainer, loans.length === 0 && styles.emptyListContainer]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    padding: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorBannerText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  loanCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loanId: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#6b7280",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loanMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loanLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  loanAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#dc2626",
    borderRadius: 3,
  },
  loanDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  payButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  requestButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default LoansScreen;
