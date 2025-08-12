import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { apiUserService } from "@/src/services/apiUser";
import { Redirect, useRouter } from "expo-router";
import { validateImgPath } from "@/src/utils/validateImgPath";
import ButtonFloat from "@/src/components/ButtonFloat";
import React, { useEffect, useState, useCallback } from "react";
import useAuthStore from "@/src/hooks/useAuthStore";
import { ColorsConstants } from "@/src/config/Colors";
import { baseURL, iconUserUrl } from "@/src/config/constants";

export default function UserScreen() {
  const [users, setUsers] = useState<{ results: any[] }>({ results: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter() as any;
  const [search, setSearch] = useState("");
  const { isAdmin } = useAuthStore();
  const pathRedirect = "./operations";

  if (!isAdmin) return <Redirect href={pathRedirect} />;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiUserService.getAllUsers({ search });
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchUsers();
    setSearch("");
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // Función para actualizar al hacer scroll en top
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.ScrollViewContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Lista de Usuarios</Text>

        <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={setSearch} />
        {/* <Text>{JSON.stringify({search}, null, 2)}</Text> */}

        {loading ? (
          <ActivityIndicator size="large" color={ColorsConstants.light.accent} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          users.results.map((user, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => router.push(`/user/details/${user.id}`)}>
              <Image source={{ uri: validateImgPath(user.image, iconUserUrl) }} style={styles.avatar} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>
                  {user.firstName || "Usuario"} {user.lastName || ""}
                </Text>
                <Text style={styles.email}>{user.email}</Text>
                <Text style={styles.role}>Rol: {user.role === "admin" ? "Administrador" : "Usuario"}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <ButtonFloat url={`${baseURL}/dashboard/user/register`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ScrollViewContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: ColorsConstants.light.accent,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: ColorsConstants.light.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: ColorsConstants.light.secondaryText,
  },
  role: {
    fontSize: 14,
    color: ColorsConstants.light.accent,
  },
  operator: {
    fontSize: 12,
    color: ColorsConstants.light.secondaryText,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: ColorsConstants.light.line,
    backgroundColor: ColorsConstants.light.white,
    color: ColorsConstants.light.text,
  },
});
