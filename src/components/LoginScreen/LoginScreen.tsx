// app/index.tsx

import useAuthStore from "@/src/hooks/useAuthStore";
import { loginStyle as styles } from "./LoginScreenStyle";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { backendDomain, baseURL } from "@/src/config/constants";

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@gmail.com");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // 🔹 para carga inicial
  const { token, setUser, getUserFromStorage, refreshToken } = useAuthStore();

  const router = useRouter();
  const pathRedirect = "./operations";

  useEffect(() => {
    const initAuth = async () => {
      await getUserFromStorage();
      await refreshToken();
      setInitializing(false); // 🔹 terminamos la carga inicial
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (token) {
      router.replace(pathRedirect); // 🔹 uso replace para que no vuelva atrás al login
    }
  }, [token]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Something went wrong");

      const data = await res.json();
      setUser(data);
      router.replace(pathRedirect);
    } catch (error) {
      console.error(error);
      alert("El servidor no responde.");
    } finally {
      setLoading(false);
    }
  };

  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null); // Guarda el input activo
  // const pathname = usePathname();

  const year = new Date().getFullYear();

  // 🔹 Loader inicial para evitar que se muestre el login unos segundos
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b00" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Image source={require("@/src/assets/images/logo-business.png")} style={{ width: 190, height: 50 }} />
        <View style={{ height: 20 }} />
        <Image source={require("@/src/assets/images/login-hero.png")} style={{ width: "112%", height: 250 }} />

        <Text style={styles.title}>INICIAR SESION</Text>
        {/* <Text>{JSON.stringify(focusedInput, null, 2)}</Text> */}
        <View style={styles.formContainer}>
          <View style={[styles.inputContainer]}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={[styles.input, focusedInput === "email" && styles.inputFocused]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPassword, focusedInput === "password" && styles.inputFocused]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="gray" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, styles.forgotPassword]}>
              <Link href={`https://${backendDomain}/password/forgot`}>
                <Text style={styles.link}>RECUPERAR CONTRASEÑA</Text>
              </Link>
            </Text>
          </View>
          <View style={{ height: 20 }} />
          {loading ? (
            <ActivityIndicator size="large" color="#b00" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <View style={styles.buttonContent}>
                <FontAwesome6 name="right-to-bracket" size={20} color="white" />
                <Text style={styles.buttonText}>Ingresar</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={{ height: 20 }} />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Diseñado por{" "}
          <Link href="https://systered.com" style={{ color: "#b00" }}>
            Systered.com
          </Link>
        </Text>
        <Text style={styles.footerText}>Sistemas y Redes © {year}</Text>
      </View>
    </ScrollView>
  );
}
