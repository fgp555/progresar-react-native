import { View, Text, Image, ActivityIndicator, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { apiUserService } from "@/src/services/apiUser";
import { useLocalSearchParams } from "expo-router";
import { apiBaseURL, iconUserUrl } from "@/src/utils/varGlobal";
import { validateImgPath } from "@/src/utils/validateImgPath";
import ButtonFloat from "@/src/components/ButtonFloat";
import UserDetailsComp from "@/src/components/UserDetailsComp";

export default function UserDetailsScreen() {
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useLocalSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiUserService.getUserById(userId);
        setUserDetail(userData);
      } catch (error) {
        console.error("❌ Error obteniendo usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  if (!userDetail) {
    return (
      <View style={styles.container}>
        <Text>No se encontró el usuario.</Text>
      </View>
    );
  }

  return <UserDetailsComp userDetail={userDetail} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "gray",
  },
  phone: {
    fontSize: 16,
    marginTop: 5,
  },
  role: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  operator: {
    fontSize: 16,
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    marginTop: 5,
    color: "gray",
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  deviceItem: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: "100%",
  },
});
