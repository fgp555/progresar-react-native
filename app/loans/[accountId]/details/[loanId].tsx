// app/loans/[accountId]/details/[loanId].tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoans, type Loan, type Cuota } from "@/src/hooks/useLoans";

const LoanDetailsScreen: React.FC = () => {
  const { accountId, loanId } = useLocalSearchParams<{ accountId: string; loanId: string }>();
  const { loans, loading, fetchAccountLoans, payInstallment, formatCurrency } = useLoans();
  const [refreshing, setRefreshing] = useState(false);

  // Validar parámetros
  if (!accountId || !loanId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Parámetros inválidos.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Encontrar el préstamo específico
  const loan = loans.find((l) => l.id === loanId);

  // Cargar préstamos si no están cargados
  useEffect(() => {
    if (loans.length === 0) {
      fetchAccountLoans(accountId);
    }
  }, [accountId, loans.length, fetchAccountLoans]);

  // Función de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccountLoans(accountId);
    setRefreshing(false);
  };

  // Cuotas ordenadas por número
  const sortedInstallments = useMemo(() => {
    if (!loan?.cuotas) return [];
    return [...loan.cuotas].sort((a, b) => a.numeroCuota - b.numeroCuota);
  }, [loan?.cuotas]);

  // Cálculos del préstamo
  const calculations = useMemo(() => {
    if (!loan) return null;

    const pendingInstallments = sortedInstallments.filter((c) => c.estado === "pendiente");
    const paidInstallments = sortedInstallments.filter((c) => c.estado === "pagada");
    const remainingAmount = pendingInstallments.length * parseFloat(loan.montoCuota);
    const paidAmount = paidInstallments.length * parseFloat(loan.montoCuota);
    const progress = (loan.cuotasPagadas / loan.numeroCuotas) * 100;

    return {
      pendingCount: pendingInstallments.length,
      paidCount: paidInstallments.length,
      remainingAmount,
      paidAmount,
      progress: Math.round(progress),
      nextInstallment: pendingInstallments[0] || null,
    };
  }, [loan, sortedInstallments]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "#f59e0b"; // Amarillo
      case "pagada":
        return "#22c55e"; // Verde
      case "vencida":
        return "#ef4444"; // Rojo
      default:
        return "#6b7280"; // Gris
    }
  };

  // Verificar si una cuota está vencida
  const isOverdue = (installment: Cuota) => {
    if (installment.estado !== "pendiente") return false;
    return new Date(installment.fechaVencimiento) < new Date();
  };

  // Manejar pago de cuota específica
  const handlePaySpecificInstallment = (installment: Cuota) => {
    if (installment.estado !== "pendiente") return;

    Alert.alert(
      "Confirmar Pago",
      `¿Desea pagar la cuota ${installment.numeroCuota} por ${formatCurrency(installment.monto)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Pagar",
          onPress: async () => {
            try {
              await payInstallment(loanId, { numeroCuotas: 1 });
              await fetchAccountLoans(accountId);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Error al procesar el pago");
            }
          },
        },
      ]
    );
  };

  // Manejar pago múltiple
  const handlePayMultiple = () => {
    if (!calculations?.pendingCount) return;

    const maxCuotas = Math.min(calculations.pendingCount, 6);
    const options: any = [];

    for (let i = 1; i <= maxCuotas; i++) {
      const amount = i * parseFloat(loan!.montoCuota);
      options.push({
        text: `${i} cuota${i > 1 ? "s" : ""} (${formatCurrency(amount)})`,
        onPress: () => payMultipleInstallments(i),
      });
    }

    options.push({ text: "Cancelar", style: "cancel" });

    Alert.alert("Pagar Múltiples Cuotas", "Seleccione cuántas cuotas desea pagar:", options);
  };

  const payMultipleInstallments = async (count: number) => {
    try {
      await payInstallment(loanId, { numeroCuotas: count });
      await fetchAccountLoans(accountId);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al procesar el pago");
    }
  };

  if (loading && !loan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Préstamo no encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Detalle del Préstamo</Text>
          <Text style={styles.pageSubtitle}>#{loan.id.slice(-8)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen del Préstamo */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen General</Text>
            <View style={[styles.statusBadge, { backgroundColor: loan.estado === "activo" ? "#22c55e" : "#6b7280" }]}>
              <Text style={styles.statusText}>{loan.estado.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monto Principal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(loan.montoPrincipal)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total a Pagar</Text>
              <Text style={styles.summaryValue}>{formatCurrency(loan.montoTotal)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cuota Mensual</Text>
              <Text style={styles.summaryValue}>{formatCurrency(loan.montoCuota)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Intereses</Text>
              <Text style={styles.summaryValue}>{formatCurrency(loan.interesTotal)}</Text>
            </View>
          </View>

          {calculations && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  Progreso: {calculations.paidCount}/{loan.numeroCuotas} cuotas
                </Text>
                <Text style={styles.progressPercentage}>{calculations.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${calculations.progress}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* Información Adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información del Préstamo</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Solicitud:</Text>
              <Text style={styles.infoValue}>{formatDate(loan.fechaCreacion)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Vencimiento:</Text>
              <Text style={styles.infoValue}>{formatDate(loan.fechaVencimiento)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Score de Aprobación:</Text>
              <Text style={[styles.infoValue, { color: "#22c55e" }]}>{loan.scoreAprobacion}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ratio de Capacidad:</Text>
              <Text style={styles.infoValue}>{loan.ratioCapacidadPago}%</Text>
            </View>
            {loan.descripcion && (
              <View style={styles.descriptionSection}>
                <Text style={styles.infoLabel}>Descripción:</Text>
                <Text style={styles.descriptionText}>{loan.descripcion}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botones de Acción */}
        {loan.estado === "activo" && calculations && calculations.pendingCount > 0 && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Acciones de Pago</Text>
            <View style={styles.actionButtons}>
              {calculations.nextInstallment && (
                <TouchableOpacity
                  style={styles.payNextButton}
                  onPress={() => handlePaySpecificInstallment(calculations.nextInstallment!)}
                >
                  <Text style={styles.payNextButtonText}>Pagar Próxima Cuota</Text>
                  <Text style={styles.payNextAmount}>{formatCurrency(calculations.nextInstallment.monto)}</Text>
                </TouchableOpacity>
              )}

              {calculations.pendingCount > 1 && (
                <TouchableOpacity style={styles.payMultipleButton} onPress={handlePayMultiple}>
                  <Text style={styles.payMultipleButtonText}>Pagar Múltiples Cuotas</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Cronograma de Cuotas */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Cronograma de Cuotas</Text>
          {sortedInstallments.map((installment) => {
            const overdue = isOverdue(installment);
            return (
              <View key={installment.id} style={styles.installmentRow}>
                <View style={styles.installmentHeader}>
                  <Text style={styles.installmentNumber}>Cuota {installment.numeroCuota}</Text>
                  <View
                    style={[styles.installmentStatusBadge, { backgroundColor: getStatusColor(installment.estado) }]}
                  >
                    <Text style={styles.installmentStatusText}>
                      {installment.estado === "pendiente" && overdue ? "VENCIDA" : installment.estado.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.installmentDetails}>
                  <View style={styles.installmentRow}>
                    <Text style={styles.installmentLabel}>Monto:</Text>
                    <Text style={styles.installmentValue}>{formatCurrency(installment.monto)}</Text>
                  </View>
                  <View style={styles.installmentRow}>
                    <Text style={styles.installmentLabel}>Vencimiento:</Text>
                    <Text style={[styles.installmentValue, overdue && { color: "#ef4444" }]}>
                      {formatDate(installment.fechaVencimiento)}
                    </Text>
                  </View>
                  {installment.fechaPago && (
                    <View style={styles.installmentRow}>
                      <Text style={styles.installmentLabel}>Fecha de Pago:</Text>
                      <Text style={styles.installmentValue}>{formatDate(installment.fechaPago)}</Text>
                    </View>
                  )}
                </View>

                {installment.estado === "pendiente" && (
                  <TouchableOpacity
                    style={[styles.payInstallmentButton, overdue && styles.payOverdueButton]}
                    onPress={() => handlePaySpecificInstallment(installment)}
                  >
                    <Text style={styles.payInstallmentButtonText}>{overdue ? "Pagar Vencida" : "Pagar Cuota"}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Estado Completado */}
        {loan.estado === "completado" && (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Préstamo Completado</Text>
            <Text style={styles.completedText}>
              ¡Felicidades! Has completado exitosamente el pago de todas las cuotas.
            </Text>
            {loan.fechaCompletado && (
              <Text style={styles.completedDate}>Completado el: {formatDate(loan.fechaCompletado)}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#dc2626",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#fecaca",
    fontFamily: "monospace",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  summaryItem: {
    width: "50%",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },
  progressHeader: {
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
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#dc2626",
    borderRadius: 4,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    textAlign: "right",
  },
  descriptionSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 12,
  },
  actionButtons: {
    gap: 12,
  },
  payNextButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payNextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  payNextAmount: {
    color: "#fecaca",
    fontSize: 14,
    marginTop: 2,
  },
  payMultipleButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  payMultipleButtonText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
  scheduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 16,
  },
  installmentRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 16,
    marginBottom: 16,
  },
  installmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  installmentNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  installmentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  installmentStatusText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  installmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  installmentLabel: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  installmentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
    textAlign: "right",
  },
  payInstallmentButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  payOverdueButton: {
    backgroundColor: "#ef4444",
  },
  payInstallmentButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  completedCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: "#16a34a",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  completedDate: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
});

export default LoanDetailsScreen;
