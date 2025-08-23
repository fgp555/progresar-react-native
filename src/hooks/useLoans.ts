// src/hooks/useLoans.ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import axiosInstance from "@/src/config/axiosInstance";

export interface Cuota {
  id: string;
  prestamoId: string;
  numeroCuota: number;
  monto: string;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: "pendiente" | "pagada" | "vencida";
}

export interface Loan {
  id: string;
  cuentaId: string;
  montoPrincipal: string;
  numeroCuotas: number;
  montoCuota: string;
  montoTotal: string;
  interesTotal: string;
  cuotasPagadas: number;
  fechaCreacion: string;
  fechaVencimiento: string;
  fechaCompletado: string | null;
  estado: "activo" | "completado" | "cancelado";
  descripcion: string;
  scoreAprobacion: number;
  ratioCapacidadPago: string;
  cuotas: Cuota[];
}

export interface CreateLoanDto {
  montoPrincipal: number;
  numeroCuotas: number;
  tasaInteres: number;
  descripcion?: string;
}

export interface PayInstallmentDto {
  monto: number;
  descripcion?: string;
}

export interface CalculateLoanDto {
  montoPrincipal: number;
  numeroCuotas: number;
  tasaInteres: number;
}

export interface LoanCalculation {
  montoCuota: number;
  montoTotal: number;
  interesTotal: number;
  cronogramaPagos: Array<{
    numeroCuota: number;
    fechaVencimiento: string;
    montoCuota: number;
    montoCapital: number;
    montoInteres: number;
    saldoPendiente: number;
  }>;
}

export const useLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);

  const fetchAllLoans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/progresar/prestamos");
      const { data } = response.data;
      setLoans(data || []);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al obtener préstamos";
      setError(errorMessage);
      console.error("Error fetching loans:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountLoans = useCallback(async (accountId: string) => {
    if (!accountId) {
      setError("ID de cuenta requerido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Usar la URL exacta de tu backend
      const response = await axiosInstance.get(`/api/progresar/prestamos/account/${accountId}`);
      const { data } = response.data;
      setLoans(data || []);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al obtener préstamos de la cuenta";
      setError(errorMessage);
      console.error("Error fetching account loans:", err);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateLoan = useCallback(async (loanData: CalculateLoanDto) => {
    if (!loanData.montoPrincipal || !loanData.numeroCuotas || !loanData.tasaInteres) {
      throw new Error("Datos de préstamo incompletos");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/progresar/prestamos/calcular", loanData);
      const { data } = response.data;
      setCalculation(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al calcular préstamo";
      setError(errorMessage);
      console.error("Error calculating loan:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLoan = useCallback(
    async (accountId: string, loanData: CreateLoanDto) => {
      if (!accountId || !loanData.montoPrincipal || !loanData.numeroCuotas) {
        throw new Error("Datos de solicitud incompletos");
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(`/api/progresar/prestamos/solicitar/${accountId}`, loanData);
        const { data } = response.data;

        // Refrescar préstamos después de solicitar
        await fetchAccountLoans(accountId);

        Alert.alert("Éxito", "Préstamo solicitado correctamente");
        return data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Error al solicitar préstamo";
        setError(errorMessage);
        console.error("Error requesting loan:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchAccountLoans]
  );

  const payInstallment = useCallback(async (loanId: string, paymentData: PayInstallmentDto) => {
    if (!loanId || !paymentData.monto || paymentData.monto <= 0) {
      throw new Error("Datos de pago inválidos");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`/api/progresar/prestamos/${loanId}/pagar-cuota`, paymentData);
      const { data } = response.data;

      // Actualizar el préstamo específico en el estado
      setLoans((prev) =>
        prev.map((loan) => {
          if (loan.id === loanId && data?.prestamo) {
            return { ...loan, ...data.prestamo };
          }
          return loan;
        })
      );

      Alert.alert("Éxito", "Cuota pagada correctamente");
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al pagar cuota";
      setError(errorMessage);
      console.error("Error paying installment:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCalculation = useCallback(() => {
    setCalculation(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utilidades para trabajar con los datos del backend
  const getNextInstallment = useCallback((loan: Loan): Cuota | null => {
    if (!loan.cuotas || loan.cuotas.length === 0) return null;

    // Encontrar la siguiente cuota pendiente ordenada por número de cuota
    const pendingInstallments = loan.cuotas
      .filter((cuota) => cuota.estado === "pendiente")
      .sort((a, b) => a.numeroCuota - b.numeroCuota);

    return pendingInstallments[0] || null;
  }, []);

  const getRemainingBalance = useCallback((loan: Loan): number => {
    const remainingInstallments = loan.numeroCuotas - loan.cuotasPagadas;
    return remainingInstallments * parseFloat(loan.montoCuota);
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

  return {
    loans,
    loading,
    error,
    calculation,
    fetchAllLoans,
    fetchAccountLoans,
    calculateLoan,
    requestLoan,
    payInstallment,
    clearCalculation,
    clearError,
    // Utilidades
    getNextInstallment,
    getRemainingBalance,
    formatCurrency,
  };
};
