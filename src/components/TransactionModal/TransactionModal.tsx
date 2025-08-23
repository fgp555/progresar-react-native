// src/components/Transactions/TransactionModal.tsx
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
import { SafeAreaView } from "react-native-safe-area-context";

interface TransactionModalProps {
  type: "deposit" | "withdraw" | "transfer";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

const labels = {
  deposit: { title: "Depósito", icon: "💰" },
  withdraw: { title: "Retiro", icon: "💸" },
  transfer: { title: "Transferencia", icon: "🔄" },
};

const TransactionModal: React.FC<TransactionModalProps> = ({ type, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    monto: "",
    descripcion: "",
    cuentaDestinoNumero: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.monto || Number(formData.monto) <= 0) {
      Alert.alert("Error", "Por favor ingrese un monto válido");
      return;
    }

    if (!formData.descripcion.trim()) {
      Alert.alert("Error", "Por favor ingrese una descripción");
      return;
    }

    if (type === "transfer" && !formData.cuentaDestinoNumero.trim()) {
      Alert.alert("Error", "Por favor ingrese el número de cuenta destino");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // El error ya se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ monto: "", descripcion: "", cuentaDestinoNumero: "" });
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{labels[type].icon}</Text>
            <Text style={styles.title}>{labels[type].title}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Campo Monto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el monto"
              value={formData.monto}
              onChangeText={(value) => handleChange("monto", value)}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
              editable={!isSubmitting}
            />
          </View>

          {/* Campo Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ingrese una descripción"
              value={formData.descripcion}
              onChangeText={(value) => handleChange("descripcion", value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
              editable={!isSubmitting}
            />
          </View>

          {/* Campo Cuenta Destino - Solo para transferencias */}
          {type === "transfer" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número de Cuenta Destino *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese el número de cuenta"
                value={formData.cuentaDestinoNumero}
                onChangeText={(value) => handleChange("cuentaDestinoNumero", value)}
                placeholderTextColor="#9ca3af"
                editable={!isSubmitting}
              />
            </View>
          )}
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.confirmButtonText}>{isSubmitting ? "Procesando..." : "Confirmar"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#fecaca",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
});

export default TransactionModal;
