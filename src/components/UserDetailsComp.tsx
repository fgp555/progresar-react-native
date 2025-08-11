import { View, Text, FlatList, StyleSheet } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { validateImgPath } from "../utils/validateImgPath";
import { apiBaseURL, iconUserUrl } from "../utils/varGlobal";
import ButtonFloat from "./ButtonFloat";

export default function UserDetailsComp({ userDetail }: any) {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: validateImgPath(userDetail.image, iconUserUrl),
        }}
        style={styles.image}
      />
      <Text style={styles.name}>
        {userDetail.firstName} {userDetail.lastName || ""}
      </Text>
      <Text style={styles.role}>
        Rol:{" "}
        {userDetail.role === "admin" ? "Administrador" : userDetail.role === "collaborator" ? "Colaborador" : "Usuario"}
      </Text>

      <Text style={styles.email}>{userDetail.email}</Text>
      <Text style={styles.phone}>WhatsApp: {userDetail.whatsapp || "—"}</Text>
      <Text style={styles.operator}>Operador: {userDetail.operator?.name || "—"}</Text>
      <Text style={styles.date}>Creado el: {new Date(userDetail.createdAt).toLocaleDateString()}</Text>

      {/* Lista de dispositivos */}
      <Text style={styles.deviceTitle}>📱 Dispositivos Registrados:</Text>
      {userDetail.devices?.length > 0 ? (
        <FlatList
          data={userDetail.devices}
          keyExtractor={(item) => item.expoPushToken}
          renderItem={({ item }) => (
            <View style={styles.deviceItem}>
              <Text>📌 Tipo: {item.deviceType}</Text>
              <Text>🔑 Token: {item.expoPushToken}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No hay dispositivos registrados.</Text>
      )}

      <ButtonFloat url={`${apiBaseURL}/dashboard/user/${userDetail.id}/update`} icon="pencil" />
    </View>
  );
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
