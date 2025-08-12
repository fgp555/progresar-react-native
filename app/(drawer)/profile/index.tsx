// app/(drawer)/profile/index.tsx

import axiosInstance from "@/src/config/axiosInstance";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

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

const ProfileScreen = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/me");
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No se pudo cargar la información del usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.label}>
        Nombre: <Text style={styles.value}>{user.name}</Text>
      </Text>
      <Text style={styles.label}>
        Usuario: <Text style={styles.value}>{user.username}</Text>
      </Text>
      <Text style={styles.label}>
        Email: <Text style={styles.value}>{user.email}</Text>
      </Text>
      <Text style={styles.label}>
        Rol: <Text style={styles.value}>{user.role}</Text>
      </Text>
      <Text style={styles.label}>
        Cuenta pública: <Text style={styles.value}>{user.isPublic ? "Sí" : "No"}</Text>
      </Text>
      <Text style={styles.label}>
        Creado: <Text style={styles.value}>{new Date(user.createdAt).toLocaleString()}</Text>
      </Text>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 8,
  },
  value: {
    fontWeight: "600",
  },
});
