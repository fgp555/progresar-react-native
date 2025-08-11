import axios from "axios";
import { apiBaseURL } from "@/src/utils/varGlobal";
import useAuthStore from "../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosCreate = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token antes de cada solicitud
axiosCreate.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState(); // Obtener el token desde Zustand

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
axiosCreate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      // Limpiar el almacenamiento y cerrar sesión
      await AsyncStorage.removeItem("userStore");
      useAuthStore.getState().removeUser();
    }
    return Promise.reject(error);
  }
);

export default axiosCreate;
