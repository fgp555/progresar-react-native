// src/services/axiosInstance.ts

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../hooks/useAuthStore";
import { baseURL } from "./constants";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el accessToken antes de cada solicitud
axiosInstance.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState(); // token = accessToken actual
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores y refrescar token si expira
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es error de autenticación y no hemos intentado refrescar aún
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const storedData = await AsyncStorage.getItem("userStore");
        if (!storedData) {
          useAuthStore.getState().removeUser();
          return Promise.reject(error);
        }

        const parsedData = JSON.parse(storedData);
        const refreshToken = parsedData?.refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().removeUser();
          return Promise.reject(error);
        }

        // Llamar al endpoint para refrescar token
        const res = await axios.post(`${baseURL}/api/auth/refresh-token`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (res.status === 200 && res.data?.accessToken) {
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken || refreshToken;

          // Actualizar AsyncStorage y Zustand
          const updatedUserStore = {
            ...parsedData,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          await AsyncStorage.setItem(
            "userStore",
            JSON.stringify(updatedUserStore)
          );
          useAuthStore.setState({
            userStore: updatedUserStore,
            token: newAccessToken,
            isAdmin:
              updatedUserStore.user?.role === "admin" ||
              updatedUserStore.user?.role === "collaborator",
          });

          // Reintentar la solicitud original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error al refrescar token:", refreshError);
        useAuthStore.getState().removeUser();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
