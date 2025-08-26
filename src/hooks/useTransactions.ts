// src/hooks/useTransactions.ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import axiosInstance from "@/src/config/axiosInstance";

export interface Transaction {
  id: string;
  cuentaId: string;
  cuentaDestinoId?: string;
  cuentaOrigenId?: string;
  prestamoId?: string;
  cuotaId?: string;
  tipo:
    | "deposito"
    | "retiro"
    | "transferencia_entrada"
    | "transferencia_salida"
    | "prestamo_desembolso"
    | "prestamo_pago_cuota"
    | "prestamo_pago_multiple";
  monto: string;
  descripcion?: string;
  fecha: string;
  saldoAnterior: string;
  saldoNuevo: string;
}

export interface DepositDto {
  monto: number;
  descripcion?: string;
}

export interface WithdrawDto {
  monto: number;
  descripcion?: string;
}

export interface TransferDto {
  cuentaOrigenId: string;
  cuentaDestinoNumero: string;
  monto: number;
  descripcion?: string;
}

export interface PaginationResponse {
  current: number;
  total: number;
  count: number;
  totalRecords: number;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  const fetchAllTransactions = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/progresar/transacciones/findAll?page=${page}&limit=${limit}`);
      const { data, pagination: paginationData } = response.data;

      if (page === 1) {
        setTransactions(data || []);
      } else {
        setTransactions((prev) => [...prev, ...(data || [])]);
      }

      setPagination(paginationData);
      return { data: data || [], pagination: paginationData };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al obtener transacciones";
      setError(errorMessage);
      console.error("Error fetching all transactions:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountTransactions = useCallback(async (accountId: string, page: number = 1, limit: number = 10) => {
    if (!accountId) {
      setError("ID de cuenta requerido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/api/progresar/transacciones/account/${accountId}?page=${page}&limit=${limit}`
      );
      const { data, pagination: paginationData } = response.data;

      if (page === 1) {
        setTransactions(data || []);
      } else {
        setTransactions((prev) => [...prev, ...(data || [])]);
      }

      setPagination(paginationData);
      return { data: data || [], pagination: paginationData };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al obtener transacciones de la cuenta";
      setError(errorMessage);
      console.error("Error fetching account transactions:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const makeDeposit = useCallback(
    async (accountId: string, depositData: DepositDto) => {
      if (!accountId || !depositData.monto || depositData.monto <= 0) {
        throw new Error("Datos de depósito inválidos");
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/deposit/${accountId}`, depositData);
        const { data } = response.data;

        // Refrescar transacciones después del depósito
        await fetchAccountTransactions(accountId, 1, 10);

        Alert.alert("Éxito", "Depósito realizado correctamente");
        return data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar depósito";
        setError(errorMessage);
        console.error("Error making deposit:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  const makeWithdrawal = useCallback(
    async (accountId: string, withdrawalData: WithdrawDto) => {
      if (!accountId || !withdrawalData.monto || withdrawalData.monto <= 0) {
        throw new Error("Datos de retiro inválidos");
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/withdraw/${accountId}`, withdrawalData);
        const { data } = response.data;

        // Refrescar transacciones después del retiro
        await fetchAccountTransactions(accountId, 1, 10);

        Alert.alert("Éxito", "Retiro realizado correctamente");
        return data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar retiro";
        setError(errorMessage);
        console.error("Error making withdrawal:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  const makeTransfer = useCallback(
    async (transferData: TransferDto) => {
      if (
        !transferData.cuentaOrigenId ||
        !transferData.cuentaDestinoNumero ||
        !transferData.monto ||
        transferData.monto <= 0
      ) {
        throw new Error("Datos de transferencia inválidos");
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/transfer`, transferData);
        const { data } = response.data;

        // Refrescar transacciones de la cuenta origen
        await fetchAccountTransactions(transferData.cuentaOrigenId, 1, 10);

        Alert.alert("Éxito", "Transferencia realizada correctamente");
        return data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar transferencia";
        setError(errorMessage);
        console.error("Error making transfer:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
    setPagination(null);
  }, []);

  // Utilidades para trabajar con transacciones
  const getTransactionTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      deposito: "Depósito",
      retiro: "Retiro",
      transferencia_entrada: "Transferencia Recibida",
      transferencia_salida: "Transferencia Enviada",
      prestamo_desembolso: "Préstamo Desembolsado",
      prestamo_pago_cuota: "Pago de Cuota",
      prestamo_pago_multiple: "Pago Múltiple",
    };
    return labels[type] || type;
  }, []);

  const getTransactionIcon = useCallback((type: string): string => {
    const icons: Record<string, string> = {
      deposito: "💰",
      retiro: "🏧",
      transferencia_entrada: "📥",
      transferencia_salida: "📤",
      prestamo_desembolso: "🏦",
      prestamo_pago_cuota: "💳",
      prestamo_pago_multiple: "💳",
    };
    return icons[type] || "💸";
  }, []);

  const getTransactionColor = useCallback((type: string): string => {
    const colors: Record<string, string> = {
      deposito: "#22c55e",
      retiro: "#ef4444",
      transferencia_entrada: "#22c55e",
      transferencia_salida: "#ef4444",
      prestamo_desembolso: "#3b82f6",
      prestamo_pago_cuota: "#f59e0b",
      prestamo_pago_multiple: "#f59e0b",
    };
    return colors[type] || "#6b7280";
  }, []);

  const formatCurrency = useCallback((amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    try {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(numAmount);
    } catch (error) {
      return `S/ ${numAmount.toFixed(2)}`;
    }
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchAllTransactions,
    fetchAccountTransactions,
    makeDeposit,
    makeWithdrawal,
    makeTransfer,
    clearError,
    clearTransactions,
    // Utilidades
    getTransactionTypeLabel,
    getTransactionIcon,
    getTransactionColor,
    formatCurrency,
    formatDate,
  };
};
