import React from "react";
import { TouchableOpacity, Linking, StyleSheet, Image, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { ColorsConstants } from "../config/Colors";

interface IButtonFloat {
  url: string;
  icon?: string;
}

export default function ButtonFloat({ url, icon = "add" }: IButtonFloat) {
  const openUrl = () => {
    Linking.openURL(url).catch(() => alert("No se pudo abrir URL"));
  };

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={openUrl}>
      <FontAwesome6 name={icon} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: ColorsConstants.light.accent,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Sombra en Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  icon: {
    width: 40,
    height: 40,
    tintColor: "#fff",
  },
});
