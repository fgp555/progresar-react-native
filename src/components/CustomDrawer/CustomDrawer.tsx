import { androidVersion, backendDomain, playStoreUrl } from "@/src/config/constants";
import { customDrawerstyles as styles } from "./customDrawerStyles";
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import useAuthStore from "@/src/hooks/useAuthStore";

export const CustomDrawer = (props: DrawerContentComponentProps) => {
  const router = useRouter() as any;
  const pathname = usePathname();
  const { userStore, removeUser, token, isAdmin } = useAuthStore();
  const user = userStore?.user;

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
