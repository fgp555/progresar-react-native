import { TouchableOpacity } from "react-native";
import React from "react";
import Drawer from "expo-router/drawer";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { CustomDrawer } from "@/src/components/CustomDrawer/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawer}
      screenOptions={({ navigation }) => ({
        drawerPosition: "left",
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
            {/* <Ionicons name="grid-outline" size={30} color="white" /> */}
            <FontAwesome6 name="bars" size={24} color="#b00" />
          </TouchableOpacity>
        ),
        headerTitleAlign: "center",
        // headerStyle: { backgroundColor: "#b00" },
        headerTintColor: "#b00",
      })}
    ></Drawer>
  );
}
