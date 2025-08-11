import { FontAwesome6 } from "@expo/vector-icons";
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "../store/useAuthStore";
import { customDrawerstyles as styles } from "../styles/customDrawerstyles";
import { androidVersion, apiDomain, logoBusinessImg, playStoreUrl } from "../utils/varGlobal";

export const CustomDrawer = (props: DrawerContentComponentProps) => {
  const router = useRouter() as any;
  const pathname = usePathname();
  const { userStore, removeUser, token, isAdmin } = useAuthStore();
  const user = userStore?.user;
  const email = user?.email;

  const handleLogout = () => {
    removeUser();
    router.push("/");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={{ uri: logoBusinessImg }} style={styles.img} />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/order/list")}
          style={[styles.buttonContainer, pathname === "/order/list" && styles.activeButton]}
        >
          <View style={styles.button}>
            <FontAwesome6
              name="list-check"
              size={16}
              color={pathname === "/order/list" ? "#fff" : "#333"}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, pathname === "/order/list" && styles.activeButtonText]}>Ordenes</Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={pathname === "/order/list" ? "#fff" : "#333"}
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
            <TouchableOpacity
              onPress={() => router.push("/operator/list")}
              style={[styles.buttonContainer, pathname === "/operator/list" && styles.activeButton]}
            >
              <View style={styles.button}>
                <FontAwesome6
                  name="briefcase"
                  size={16}
                  color={pathname === "/operator/list" ? "#fff" : "#333"}
                  style={styles.icon}
                />
                <Text style={[styles.buttonText, pathname === "/operator/list" && styles.activeButtonText]}>
                  Operadores
                </Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={16}
                color={pathname === "/operator/list" ? "#fff" : "#333"}
                style={styles.icon}
              />
            </TouchableOpacity>
          </>
        )}
        {user && user.id && (
          <TouchableOpacity
            onPress={() => router.push(`/user/details/${user.id}`)}
            style={[styles.buttonContainer, pathname === `/user/details/${user.id}` && styles.activeButton]}
          >
            <View style={styles.button}>
              <FontAwesome6
                name="user"
                size={16}
                color={pathname === `/user/details/${user.id}` ? "#fff" : "#333"}
                style={styles.icon}
              />
              <Text style={[styles.buttonText, pathname === `/user/details/${user.id}` && styles.activeButtonText]}>
                Mi Cuenta
              </Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={pathname === `/user/details/${user.id}` ? "#fff" : "#333"}
              style={styles.icon}
            />
          </TouchableOpacity>
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
            <Text style={[styles.buttonText, pathname === "/about" && styles.activeButtonText]}>Quienes Somos</Text>
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
        <TouchableOpacity onPress={() => Linking.openURL(`https://${apiDomain}`)} style={[styles.buttonContainer]}>
          <View style={styles.button}>
            <FontAwesome6 name="globe" size={16} color={"#333"} style={styles.icon} />
            <Text style={[styles.buttonText]}>{apiDomain}</Text>
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
