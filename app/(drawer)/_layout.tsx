import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Drawer from "expo-router/drawer";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { androidVersion, backendDomain, playStoreUrl } from "@/src/config/constants";
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import useAuthStore from "@/src/hooks/useAuthStore";

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

const CustomDrawer = (props: DrawerContentComponentProps) => {
  const router = useRouter() as any;
  const pathname = usePathname();
  const { userStore, removeUser, token, isAdmin } = useAuthStore();

  const handleLogout = () => {
    removeUser();
    router.push("/");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          {/* <Image source={{ uri: logoBusinessImg }} style={styles.img} /> */}
          <Image source={require("@/src/assets/images/logo-business.png")} style={styles.img} />
        </View>
        <TouchableOpacity
          onPress={() => router.push("/operations")}
          style={[styles.buttonContainer, pathname === "/operations" && styles.activeButton]}
        >
          <View style={styles.button}>
            <FontAwesome6
              name="landmark"
              size={16}
              color={pathname === "/operations" ? "#fff" : "#333"}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, pathname === "/operations" && styles.activeButtonText]}>Operaciones</Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={pathname === "/operations" ? "#fff" : "#333"}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={[styles.buttonContainer, pathname === "/profile" && styles.activeButton]}
        >
          <View style={styles.button}>
            <FontAwesome6 name="user" size={16} color={pathname === "/profile" ? "#fff" : "#333"} style={styles.icon} />
            <Text style={[styles.buttonText, pathname === "/profile" && styles.activeButtonText]}>Mi Perfil</Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={pathname === "/profile" ? "#fff" : "#333"}
            style={styles.icon}
          />
        </TouchableOpacity>
        {isAdmin && (
          <>
            <TouchableOpacity
              onPress={() => router.push("/user/list")}
              style={[styles.buttonContainer, pathname === "/user/list" && styles.activeButton]}
            >
              <View style={styles.button}>
                <FontAwesome6
                  name="users"
                  size={16}
                  color={pathname === "/user/list" ? "#fff" : "#333"}
                  style={styles.icon}
                />
                <Text style={[styles.buttonText, pathname === "/user/list" && styles.activeButtonText]}>Usuarios</Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={16}
                color={pathname === "/user/list" ? "#fff" : "#333"}
                style={styles.icon}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
          <FontAwesome6 name="right-from-bracket" size={16} style={styles.icon} color={"#b00"} />
          <Text style={[styles.buttonText, styles.logoutButtonText]}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/about")}
          style={[styles.buttonContainer, pathname === "/about" && styles.activeButton]}
        >
          <View style={styles.button}>
            <FontAwesome6
              name="circle-info"
              size={16}
              color={pathname === "/about" ? "#fff" : "#333"}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, pathname === "/about" && styles.activeButtonText]}>Acerca de</Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={pathname === "/about" ? "#fff" : "#333"}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(playStoreUrl)} style={[styles.buttonContainer]}>
          <View style={styles.button}>
            <FontAwesome6 name="google-play" size={16} color={"#333"} style={styles.icon} />
            <Text style={[styles.buttonText]}>Actualizar</Text>
          </View>
          <FontAwesome6 name="up-right-from-square" size={16} color={"#333"} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`https://${backendDomain}`)} style={[styles.buttonContainer]}>
          <View style={styles.button}>
            <FontAwesome6 name="globe" size={16} color={"#333"} style={styles.icon} />
            <Text style={[styles.buttonText]}>{backendDomain}</Text>
          </View>
          <FontAwesome6 name="up-right-from-square" size={16} color={"#333"} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonContainer]}>
          <View style={styles.button}>
            <FontAwesome6 name="download" size={16} color={"#777"} style={styles.icon} />
            <Text
              style={[
                styles.buttonText,
                {
                  color: "#777",
                },
              ]}
            >
              build {androidVersion}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  img: {
    width: 281,
    height: 72,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    marginVertical: 5,
    paddingVertical: 3,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: "#b00",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  activeButtonText: {
    color: "#fff",
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  logoutButton: {},
  logoutButtonText: {
    color: "#b00",
    textAlign: "center",
  },
  profileContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  profileButton: {
    backgroundColor: "#2196f3",
  },
  profileButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});
