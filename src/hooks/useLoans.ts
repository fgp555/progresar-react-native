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
  monto: number; // Cambiado de montoPrincipal a monto
  numeroCuotas: number;
  descripcion?: string;
}

export interface PayInstallmentDto {
  numeroCuotas: number; // Cambiado de monto a numeroCuotas
}

export interface CalculateLoanDto {
  monto: number; // Cambiado de montoPrincipal a monto
  numeroCuotas: number;
  // Removido tasaInteres ya que es fijo en el backend
}

export interface LoanCalculation {
  montoPrincipal: number;
  numeroCuotas: number;
  montoCuota: number;
  montoTotal: number;
  interesTotal: number;
  tasaInteres: string;
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
      // URL corregida según el backend
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
    if (!loanData.monto || !loanData.numeroCuotas) {
      throw new Error("Datos de préstamo incompletos");
    }

    if (loanData.monto <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    if (loanData.numeroCuotas < 1 || loanData.numeroCuotas > 6) {
      throw new Error("El número de cuotas debe ser entre 1 y 6");
    }

    setLoading(true);
    setError(null);
    try {
      // URL corregida según el backend
      const response = await axiosInstance.post("/api/progresar/prestamos/calculate", loanData);
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
      if (!accountId || !loanData.monto || !loanData.numeroCuotas) {
        throw new Error("Datos de solicitud incompletos");
      }

      if (loanData.monto <= 0) {
        throw new Error("El monto debe ser mayor a 0");
      }

      if (loanData.numeroCuotas < 1 || loanData.numeroCuotas > 6) {
        throw new Error("El número de cuotas debe ser entre 1 y 6");
      }

      setLoading(true);
      setError(null);
      try {
        // URL corregida según el backend
        const response = await axiosInstance.post(`/api/progresar/prestamos/account/${accountId}`, loanData);
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
    if (!loanId || !paymentData.numeroCuotas || paymentData.numeroCuotas <= 0) {
      throw new Error("Datos de pago inválidos");
    }

    if (paymentData.numeroCuotas < 1 || paymentData.numeroCuotas > 6) {
      throw new Error("El número de cuotas debe ser entre 1 y 6");
    }

    setLoading(true);
    setError(null);
    try {
      // URL corregida según el backend
      const response = await axiosInstance.post(`/api/progresar/prestamos/pay/${loanId}`, paymentData);
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

      const cuotasText = paymentData.numeroCuotas === 1 ? "cuota" : "cuotas";
      Alert.alert("Éxito", `${paymentData.numeroCuotas} ${cuotasText} pagada(s) correctamente`);
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

  const getPendingInstallmentsCount = useCallback((loan: Loan): number => {
    if (!loan.cuotas || loan.cuotas.length === 0) {
      return loan.numeroCuotas - loan.cuotasPagadas;
    }
    return loan.cuotas.filter((cuota) => cuota.estado === "pendiente").length;
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

  // Validaciones del frontend que coinciden con el backend
  const validateLoanRequest = useCallback(
    (accountBalance: number, loanAmount: number, installmentAmount: number) => {
      const errors: string[] = [];

      // Validar monto máximo (5x el saldo)
      const maxAllowed = accountBalance * 5;
      if (loanAmount > maxAllowed) {
        errors.push(
          `Monto solicitado excede el límite. Máximo permitido: ${formatCurrency(maxAllowed)} (5x su saldo actual)`
        );
      }

      // Validar saldo mínimo para una cuota
      if (accountBalance < installmentAmount) {
        errors.push(`Saldo insuficiente. Necesita al menos ${formatCurrency(installmentAmount)} para cubrir una cuota`);
      }

      // Validar capacidad de pago (70% del saldo)
      const paymentCapacity = accountBalance * 0.7;
      if (installmentAmount > paymentCapacity) {
        errors.push(
          `La cuota mensual (${formatCurrency(
            installmentAmount
          )}) excede su capacidad de pago recomendada (${formatCurrency(paymentCapacity)})`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [formatCurrency]
  );

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
    getPendingInstallmentsCount,
    validateLoanRequest,
    formatCurrency,
  };
};
