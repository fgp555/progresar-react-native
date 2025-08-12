import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Tabs, useNavigation, usePathname, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, Linking } from "react-native";
import React, { useLayoutEffect } from "react";
import useAuthStore from "@/src/hooks/useAuthStore";
import { ColorsConstants } from "@/src/config/Colors";
import { baseURL } from "@/src/config/constants";

export default function OrderListLayout() {
  const navigation = useNavigation();
  const router = useRouter() as any;
  const { isAdmin } = useAuthStore();
  // const showTabs = true;
  const pathname = usePathname(); // Obtiene la ruta actual

  const showTabs = !pathname.startsWith("/operations/");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Operaciones",
    });
  }, [navigation]);

  // return <Slot/>

  return (
    <>
      <Tabs screenOptions={{ tabBarStyle: { display: "none" }, headerShown: false }} />
      {showTabs && (
        <View style={styles.customTabBar}>
          <CustomTabButton
            title="Buscar"
            icon="magnifying-glass"
            onPress={() => router.push("/operations")}
            iconColor={pathname === "/operations" ? "#b00" : ColorsConstants.light.gray}
          />
          {isAdmin && (
            <>
              <CustomTabButton
                title="Agregar"
                icon="plus"
                // onPress={() => router.push("/order/create")}
                onPress={() => Linking.openURL(`${baseURL}/dashboard/order/create`)}
              />
              <CustomTabButton
                title="Reportes"
                icon="whatsapp"
                onPress={() => router.push("/order/wablas/list")}
                iconColor={pathname === "/order/wablas/list" ? "#b00" : ColorsConstants.light.gray}
                // onPress={() => Linking.openURL(`${apiBaseURL}/dashboard/order/wa-report`)}
              />
            </>
          )}
        </View>
      )}
    </>
  );
}

const CustomTabButton = ({ title, icon, onPress, iconColor = ColorsConstants.light.gray }: any) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <FontAwesome6 name={icon} size={24} color={iconColor} />
      <Text style={{ ...styles.text, color: iconColor }}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopColor: ColorsConstants.light.line,
    borderTopWidth: 1,
    backgroundColor: ColorsConstants.light.white,
    gap: 10,
  },
  button: {
    alignItems: "center",
    paddingVertical: 5,
    flex: 1,
  },
  text: {
    color: ColorsConstants.light.gray,
    fontSize: 12,
  },
});
