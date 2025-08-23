// src/hooks/useTransactions.ts
import { useState, useCallback } from "react";
import axiosInstance from "@/src/config/axiosInstance";
import { Alert } from "react-native";

interface Transaction {
  id: string;
  tipo: "deposito" | "retiro" | "transferencia";
  monto: number;
  descripcion: string;
  fecha: string;
  estado: "completada" | "pendiente" | "fallida";
  cuentaOrigen?: string;
  cuentaDestino?: string;
}

interface TransactionData {
  monto: number;
  descripcion: string;
}

interface TransferData {
  cuentaOrigenId: string;
  cuentaDestinoNumero: string;
  monto: number;
  descripcion: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchAccountTransactions: (accountId: string, page?: number, limit?: number) => Promise<void>;
  deposit: (accountId: string, data: TransactionData) => Promise<void>;
  withdraw: (accountId: string, data: TransactionData) => Promise<void>;
  transfer: (data: TransferData) => Promise<void>;
  refreshTransactions: (accountId: string) => Promise<void>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener transacciones de una cuenta
  const fetchAccountTransactions = useCallback(async (accountId: string, page: number = 1, limit: number = 10) => {
    if (!accountId) {
      setError("ID de cuenta requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/api/progresar/transacciones/account/${accountId}`, {
        params: { page, limit },
      });

      const { data } = response.data;
      // setTransactions(Array.isArray(data) ? data : []);
      setTransactions(
        (Array.isArray(data) ? data : []).map((t) => ({
          ...t,
          monto: Number(t.monto), // convertir a número
          estado: "completada", // default porque backend no lo manda
        }))
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al obtener transacciones";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realizar depósito
  const deposit = useCallback(
    async (accountId: string, data: TransactionData) => {
      if (!accountId || !data.monto || data.monto <= 0) {
        throw new Error("Datos de depósito inválidos");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/deposito`, {
          cuentaId: accountId,
          monto: data.monto,
          descripcion: data.descripcion,
        });

        // Actualizar la lista de transacciones
        await fetchAccountTransactions(accountId);

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar depósito";
        setError(errorMessage);
        console.error("Error en depósito:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  // Realizar retiro
  const withdraw = useCallback(
    async (accountId: string, data: TransactionData) => {
      if (!accountId || !data.monto || data.monto <= 0) {
        throw new Error("Datos de retiro inválidos");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/retiro`, {
          cuentaId: accountId,
          monto: data.monto,
          descripcion: data.descripcion,
        });

        // Actualizar la lista de transacciones
        await fetchAccountTransactions(accountId);

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar retiro";
        setError(errorMessage);
        console.error("Error en retiro:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  // Realizar transferencia
  const transfer = useCallback(
    async (data: TransferData) => {
      if (!data.cuentaOrigenId || !data.cuentaDestinoNumero || !data.monto || data.monto <= 0) {
        throw new Error("Datos de transferencia inválidos");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post(`/api/progresar/transacciones/transferencia`, {
          cuentaOrigenId: data.cuentaOrigenId,
          cuentaDestinoNumero: data.cuentaDestinoNumero,
          monto: data.monto,
          descripcion: data.descripcion,
        });

        // Actualizar la lista de transacciones de la cuenta origen
        await fetchAccountTransactions(data.cuentaOrigenId);

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al realizar transferencia";
        setError(errorMessage);
        console.error("Error en transferencia:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountTransactions]
  );

  // Refrescar transacciones
  const refreshTransactions = useCallback(
    async (accountId: string) => {
      await fetchAccountTransactions(accountId);
    },
    [fetchAccountTransactions]
  );

  return {
    transactions,
    loading,
    error,
    fetchAccountTransactions,
    deposit,
    withdraw,
    transfer,
    refreshTransactions,
  };
};
