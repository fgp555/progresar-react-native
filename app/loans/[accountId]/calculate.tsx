// app/loans/[accountId]/calculate.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoans } from "@/src/hooks/useLoans";

const CalculateLoanScreen: React.FC = () => {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { calculation, loading, calculateLoan, requestLoan, formatCurrency, clearCalculation } = useLoans();

  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");
  const [description, setDescription] = useState("");

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

  const handleCalculate = useCallback(async () => {
    const numAmount = parseFloat(amount);
    const numInstallments = parseInt(installments);

    // Validaciones frontend
    if (!amount || !installments) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "El monto debe ser un número mayor a 0");
      return;
    }

    if (isNaN(numInstallments) || numInstallments < 1 || numInstallments > 6) {
      Alert.alert("Error", "El número de cuotas debe ser entre 1 y 6");
      return;
    }

    try {
      await calculateLoan({
        monto: numAmount,
        numeroCuotas: numInstallments,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al calcular préstamo");
    }
  }, [amount, installments, calculateLoan]);

  const handleRequestLoan = useCallback(async () => {
    if (!calculation) {
      Alert.alert("Error", "Debe calcular el préstamo primero");
      return;
    }

    Alert.alert(
      "Confirmar Solicitud",
      `¿Está seguro de solicitar un préstamo por ${formatCurrency(calculation.montoPrincipal)} con ${
        calculation.numeroCuotas
      } cuotas de ${formatCurrency(calculation.montoCuota)}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Solicitar",
          onPress: async () => {
            try {
              await requestLoan(accountId, {
                monto: calculation.montoPrincipal,
                numeroCuotas: calculation.numeroCuotas,
                descripcion: description || "Préstamo personal",
              });

              // Limpiar formulario y volver
              setAmount("");
              setInstallments("");
              setDescription("");
              clearCalculation();
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Error al solicitar préstamo");
            }
          },
        },
      ]
    );
  }, [calculation, accountId, description, requestLoan, clearCalculation, formatCurrency]);

  const handleClearCalculation = () => {
    clearCalculation();
    setAmount("");
    setInstallments("");
    setDescription("");
  };

  const renderCalculationResult = () => {
    if (!calculation) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>📊 Resumen del Préstamo</Text>

        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monto Principal:</Text>
            <Text style={styles.resultValue}>{formatCurrency(calculation.montoPrincipal)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Número de Cuotas:</Text>
            <Text style={styles.resultValue}>{calculation.numeroCuotas}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cuota Mensual:</Text>
            <Text style={[styles.resultValue, styles.highlightAmount]}>{formatCurrency(calculation.montoCuota)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total a Pagar:</Text>
            <Text style={styles.resultValue}>{formatCurrency(calculation.montoTotal)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Intereses Totales:</Text>
            <Text style={styles.resultValue}>{formatCurrency(calculation.interesTotal)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tasa de Interés:</Text>
            <Text style={styles.resultValue}>{calculation.tasaInteres}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.requestButton} onPress={handleRequestLoan} disabled={loading}>
            <Text style={styles.requestButtonText}>{loading ? "Procesando..." : "💰 Solicitar Préstamo"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={handleClearCalculation}>
            <Text style={styles.clearButtonText}>🗑️ Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Calcular Préstamo</Text>
          <Text style={styles.pageSubtitle}>Simula tu préstamo antes de solicitarlo</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Datos del Préstamo</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monto a Solicitar (S/)</Text>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Ingrese el monto"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número de Cuotas (1-6)</Text>
              <TextInput
                style={styles.textInput}
                value={installments}
                onChangeText={setInstallments}
                placeholder="Ingrese número de cuotas"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Préstamo para mejoras del hogar"
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              style={[styles.calculateButton, loading && styles.calculateButtonDisabled]}
              onPress={handleCalculate}
              disabled={loading}
            >
              <Text style={styles.calculateButtonText}>{loading ? "Calculando..." : "🧮 Calcular Préstamo"}</Text>
            </TouchableOpacity>
          </View>

          {/* Información importante */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>ℹ️ Información Importante</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Tasa de interés fija: 1.5% por cuota</Text>
              <Text style={styles.infoItem}>• Cuotas mensuales de 1 a 6 meses</Text>
              <Text style={styles.infoItem}>• Monto máximo: 5 veces su saldo actual</Text>
              <Text style={styles.infoItem}>• Se requiere actividad reciente en la cuenta</Text>
              <Text style={styles.infoItem}>• Evaluación crediticia automática</Text>
            </View>
          </View>

          {/* Resultado del cálculo */}
          {renderCalculationResult()}
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#fecaca",
    marginTop: 2,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  calculateButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calculateButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 12,
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  resultLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  highlightAmount: {
    color: "#dc2626",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  requestButton: {
    flex: 2,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CalculateLoanScreen;
