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
  const {
    loans,
    loading,
    error,
    fetchAccountLoans,
    getNextInstallment,
    getRemainingBalance,
    getPendingInstallmentsCount,
    payInstallment,
    formatCurrency,
  } = useLoans();
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

  // Ordenar préstamos por fecha de creación (más recientes primero)
  const sortedLoans = [...loans].sort((a, b) => {
    return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Navegar a calculadora de préstamos
  const handleCalculateLoan = () => {
    router.push(`/loans/${accountId}/calculate`);
  };

  const renderLoanCard = ({ item: loan }: { item: Loan }) => (
    <TouchableOpacity style={styles.loanCard} activeOpacity={0.7}>
      {/* Header con ID, estado y fecha */}
      <View style={styles.loanHeader}>
        <View>
          <Text style={styles.loanId}>#{loan.id.slice(-8)}</Text>
          <Text style={styles.loanDate}>📅 {formatDate(loan.fechaCreacion)}</Text>
        </View>
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
        {loan.fechaVencimiento && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vencimiento:</Text>
            <Text style={styles.detailValue}>{formatDate(loan.fechaVencimiento)}</Text>
          </View>
        )}
        {loan.fechaCompletado && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Completado:</Text>
            <Text style={styles.detailValue}>{formatDate(loan.fechaCompletado)}</Text>
          </View>
        )}
      </View>

      {/* Descripción si existe */}
      {loan.descripcion && (
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionLabel}>Descripción:</Text>
          <Text style={styles.descriptionText}>{loan.descripcion}</Text>
        </View>
      )}

      {/* Botones de acción */}
      {loan.estado === "activo" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.payButton} onPress={() => handlePayInstallment(loan.id)}>
            <Text style={styles.payButtonText}>💰 Pagar Cuota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(loan.id)}>
            <Text style={styles.detailsButtonText}>📋 Detalles</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const handlePayInstallment = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const pendingCount = getPendingInstallmentsCount(loan);
    if (pendingCount === 0) {
      Alert.alert("Información", "No hay cuotas pendientes para este préstamo");
      return;
    }

    const nextInstallment = getNextInstallment(loan);
    const options: any = [];

    // Opción de pagar una cuota
    if (nextInstallment) {
      options.push({
        text: `1 cuota (${formatAmount(nextInstallment.monto)})`,
        onPress: () => payInstallment(loanId, { numeroCuotas: 1 }),
      });
    }

    // Opción de pagar múltiples cuotas si hay más de una pendiente
    if (pendingCount > 1) {
      const multipleAmount = parseFloat(loan.montoCuota) * Math.min(pendingCount, 3);
      const cuotasText = Math.min(pendingCount, 3);
      options.push({
        text: `${cuotasText} cuotas (${formatAmount(multipleAmount)})`,
        onPress: () => payInstallment(loanId, { numeroCuotas: cuotasText }),
      });
    }

    options.push({ text: "Cancelar", style: "cancel" });

    Alert.alert("Pagar Cuotas", "Seleccione cuántas cuotas desea pagar:", options);
  };

  const handleViewDetails = (loanId: string) => {
    // Navegar a detalles del préstamo
    router.push(`/loans/${accountId}/details/${loanId}`);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No tienes préstamos</Text>
      <Text style={styles.emptyDescription}>Usa la calculadora para simular un préstamo y luego solicítalo</Text>
      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateLoan}>
        <Text style={styles.calculateButtonText}>🧮 Calcular Préstamo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerTitleRow}>
        <View>
          <Text style={styles.headerTitle}>Préstamos</Text>
          <Text style={styles.headerSubtitle}>
            {sortedLoans.length} préstamo{sortedLoans.length !== 1 ? "s" : ""} registrado
            {sortedLoans.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.calculateButtonHeader} onPress={handleCalculateLoan}>
          <Text style={styles.calculateButtonHeaderText}>🧮</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Botón principal de calcular si hay préstamos */}
      {sortedLoans.length > 0 && (
        <TouchableOpacity style={styles.calculateButtonFull} onPress={handleCalculateLoan}>
          <Text style={styles.calculateButtonFullText}>🧮 Calcular Nuevo Préstamo</Text>
        </TouchableOpacity>
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
        data={sortedLoans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} tintColor="#dc2626" />
        }
        contentContainerStyle={[styles.listContainer, sortedLoans.length === 0 && styles.emptyListContainer]}
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
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  calculateButtonHeader: {
    backgroundColor: "#dc2626",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calculateButtonHeaderText: {
    fontSize: 20,
  },
  calculateButtonFull: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  calculateButtonFullText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  loanId: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#6b7280",
    fontWeight: "600",
  },
  loanDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
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
  descriptionSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  descriptionLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
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
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  calculateButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calculateButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoansScreen;
