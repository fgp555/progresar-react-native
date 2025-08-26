// app/transactions/[accountId]/deposit.tsx
import React, { useState } from "react";
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
import { useTransactions } from "@/src/hooks/useTransactions";

const DepositScreen: React.FC = () => {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const { makeDeposit, loading, formatCurrency } = useTransactions();

  const [amount, setAmount] = useState("");
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

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);

    // Validaciones
    if (!amount) {
      Alert.alert("Error", "Por favor ingrese un monto");
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "El monto debe ser un número mayor a 0");
      return;
    }

    if (numAmount > 50000) {
      Alert.alert("Error", "El monto máximo por depósito es S/ 50,000");
      return;
    }

    Alert.alert("Confirmar Depósito", `¿Está seguro de realizar un depósito de ${formatCurrency(numAmount)}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            await makeDeposit(accountId, {
              monto: numAmount,
              descripcion: description || "Depósito",
            });

            // Limpiar formulario y volver
            setAmount("");
            setDescription("");
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Error al realizar el depósito");
          }
        },
      },
    ]);
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Realizar Depósito</Text>
          <Text style={styles.pageSubtitle}>Ingrese dinero a su cuenta</Text>
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
            <Text style={styles.formTitle}>Datos del Depósito</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monto a Depositar (S/)</Text>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <Text style={styles.amountPreview}>{formatCurrency(parseFloat(amount))}</Text>
              )}
            </View>

            {/* Montos rápidos */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsLabel}>Montos rápidos:</Text>
              <View style={styles.quickAmountsGrid}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      amount === quickAmount.toString() && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => handleQuickAmount(quickAmount)}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        amount === quickAmount.toString() && styles.quickAmountTextActive,
                      ]}
                    >
                      S/ {quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Depósito en efectivo"
                multiline
                numberOfLines={2}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity
              style={[styles.depositButton, loading && styles.depositButtonDisabled]}
              onPress={handleDeposit}
              disabled={loading}
            >
              <Text style={styles.depositButtonText}>{loading ? "Procesando..." : "Realizar Depósito"}</Text>
            </TouchableOpacity>
          </View>

          {/* Información importante */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Información Importante</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Monto mínimo: S/ 10.00</Text>
              <Text style={styles.infoItem}>• Monto máximo: S/ 50,000.00 por operación</Text>
              <Text style={styles.infoItem}>• Los depósitos se acreditan inmediatamente</Text>
              <Text style={styles.infoItem}>• Operación disponible 24/7</Text>
              <Text style={styles.infoItem}>• Sin comisiones por depósitos</Text>
            </View>
          </View>
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
    backgroundColor: "#22c55e",
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
    color: "rgba(255, 255, 255, 0.8)",
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
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
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
    height: 60,
    textAlignVertical: "top",
  },
  amountPreview: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
    textAlign: "center",
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  quickAmountsContainer: {
    marginBottom: 16,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  quickAmountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 80,
    alignItems: "center",
  },
  quickAmountButtonActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  quickAmountText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  quickAmountTextActive: {
    color: "#ffffff",
  },
  depositButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  depositButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  depositButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 12,
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    fontSize: 14,
    color: "#16a34a",
    lineHeight: 20,
  },
});

export default DepositScreen;
