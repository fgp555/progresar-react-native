// import "../global.css";
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const pathname = usePathname();
  console.log("Ruta actual:", pathname);

  useEffect(() => {
    const handleBackPress = () => {
      if (pathname === "/order/approval/undefined" || pathname.includes("/order/list")) {
        Alert.alert("Salir de la aplicación", "¿Estás seguro de que deseas salir?", [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Salir",
            onPress: () => BackHandler.exitApp(),
          },
        ]);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      // console.log("Desmontado");
      // BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <StatusBar style="light" backgroundColor="#fff" /> */}
      <StatusBar style="dark" backgroundColor="#fff" />

      <Slot />
      {/* <CustomDrawer /> */}
    </GestureHandlerRootView>
  );
}
