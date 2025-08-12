// src/store/useAuthStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseURL } from "../config/constants";

interface IUser {
  _id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IResponseUser {
  login: boolean;
  user: IUser;
  loginDate: string;
  expirationDate: string;
  currentDate: string;
  accessToken: string;
  refreshToken: string;
}

interface IAuthStore {
  userStore: IResponseUser | null;
  setUser: (data: IResponseUser | null) => void;
  getUserFromStorage: () => Promise<void>;
  removeUser: () => void;
  toggleRole: () => void;
  token: string | null;
  isAdmin: boolean;
  refreshToken: () => Promise<void>;
}

const useAuthStore = create<IAuthStore>((set) => ({
  userStore: null,
  token: null,
  isAdmin: false,

  setUser: (data) => {
    set({
      userStore: data,
      token: data?.accessToken || null,
      isAdmin: data?.user?.role === "admin" || data?.user?.role === "collaborator",
    });
    AsyncStorage.setItem("userStore", JSON.stringify(data));
  },

  getUserFromStorage: async () => {
    const data = await AsyncStorage.getItem("userStore");
    if (data) {
      const parsedData: IResponseUser = JSON.parse(data);
      set({
        userStore: parsedData,
        token: parsedData.accessToken || null,
        isAdmin: parsedData.user.role === "admin" || parsedData.user.role === "collaborator",
      });
    }
  },

  removeUser: () => {
    set({ userStore: null, token: null, isAdmin: false });
    AsyncStorage.removeItem("userStore");
  },

  toggleRole: () => {
    set((state) => ({ isAdmin: !state.isAdmin }));
  },

  refreshToken: async () => {
    try {
      const storedData = await AsyncStorage.getItem("userStore");
      if (!storedData) return;

      const parsedData: IResponseUser = JSON.parse(storedData);
      if (!parsedData.refreshToken) return;

      const res = await fetch(`${baseURL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedData.refreshToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...parsedData, accessToken: data.accessToken };
        set({ userStore: updatedUser, token: data.accessToken });
        AsyncStorage.setItem("userStore", JSON.stringify(updatedUser));
      } else {
        console.error("Error al actualizar el token, cerrando sesión...");
        set({ userStore: null, token: null, isAdmin: false });
        AsyncStorage.removeItem("userStore");
      }
    } catch (error) {
      console.error("Error al refrescar el token:", error);
      set({ userStore: null, token: null, isAdmin: false });
      AsyncStorage.removeItem("userStore");
    }
  },
}));

export default useAuthStore;
