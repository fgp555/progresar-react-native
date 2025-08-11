import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseURL } from "@/src/utils/varGlobal";

interface IUser {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  whatsapp: string | null;
  image: string;
  role: string;
  createdAt: string;
  operator: IOperator | null;
}

interface IOperator {
  id: any;
  name: string;
  email: string;
  whatsapp: string | null;
  website: string | null;
  image: string | null;
  registrationDate: string;
}

interface IResponseUser {
  user: IUser;
  token: string;
  login: boolean;
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
      token: data?.token,
      isAdmin: data?.user?.role === "admin" || data?.user?.role === "collaborator",
    });
    AsyncStorage.setItem("userStore", JSON.stringify(data));
  },

  getUserFromStorage: async () => {
    const data = await AsyncStorage.getItem("userStore");
    if (data) {
      const parsedData = JSON.parse(data);
      set({
        userStore: parsedData,
        token: parsedData.token,
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

      const { token } = JSON.parse(storedData);
      if (!token) return;

      const res = await fetch(`${apiBaseURL}/api/auth/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...JSON.parse(storedData), token: data.newAccessToken };
        set({ userStore: updatedUser, token: data.newAccessToken });
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
