// app/index.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import useAuthStore from "@/src/hooks/useAuthStore";
import { backendDomain, baseURL } from "@/src/config/constants";

const { width, height } = Dimensions.get("window");

export default function BankingLoginScreen() {
  const [email, setEmail] = useState("soporte@systered.com");
  const [password, setPassword] = useState("Jhlpjdln7308/*");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { token, setUser, getUserFromStorage, refreshToken } = useAuthStore();
  const router = useRouter();
  const pathRedirect = "./me"; // Redirigir a detalles del usuario con ID 1

  useEffect(() => {
    const initAuth = async () => {
      await getUserFromStorage();
      await refreshToken();
      setTimeout(() => setInitializing(false), 2000); // Simulando carga inicial
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (token) {
      router.replace(pathRedirect);
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

  const year = new Date().getFullYear();

  // Pantalla de carga inicial
  if (initializing) {
    return (
      <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.initContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#dc2626" />
        <View style={styles.initContent}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="account-balance" size={60} color="white" />
            <Text style={styles.initTitle}>PROGRESAR</Text>
            <Text style={styles.initSubtitle}>Proyeccion Fondo De Ahorro</Text>
          </View>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Iniciando sistema seguro...</Text>
            <Text style={styles.loadingSubtext}>Verificando credenciales de acceso</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#dc2626", "#b91c1c", "#991b1b"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

      {/* Header de Seguridad */}
      <View style={styles.securityBadge}>
        <MaterialIcons name="security" size={16} color="white" />
        <Text style={styles.securityText}>Conexión Segura SSL</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo y Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <MaterialIcons name="account-balance" size={50} color="#dc2626" />
            </View>
            <Text style={styles.bankName}>PROGRESAR</Text>
            <Text style={styles.systemName}>Proyeccion Fondo De Ahorro</Text>
          </View>

          {/* Ilustración Financiera */}
          <View style={styles.heroContainer}>
            <View style={styles.heroGrid}>
              <View style={styles.heroItem}>
                <MaterialIcons name="trending-up" size={24} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.heroItem}>
                <MaterialIcons name="account-balance-wallet" size={24} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.heroItem}>
                <MaterialIcons name="credit-card" size={24} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.heroItem}>
                <MaterialIcons name="security" size={24} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.heroItem}>
                <MaterialIcons name="savings" size={24} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.heroItem}>
                <MaterialIcons name="analytics" size={24} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </View>

          {/* Formulario de Login */}
          <BlurView intensity={20} tint="light" style={styles.formContainer}>
            <Text style={styles.formTitle}>ACCESO AL SISTEMA</Text>

            {/* Campo Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email:</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#ef4444" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, focusedInput === "email" && styles.inputFocused]}
                  placeholder="Ingrese su email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña:</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color="#ef4444" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput, focusedInput === "password" && styles.inputFocused]}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Botón de Login */}
            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadingButtonText}>Verificando...</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <LinearGradient colors={["#ef4444", "#dc2626"]} style={styles.buttonGradient}>
                    <FontAwesome6 name="right-to-bracket" size={18} color="white" />
                    <Text style={styles.buttonText}>ACCEDER AL SISTEMA</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desarrollado por{" "}
            <Link href="https://systered.com" style={styles.footerLink}>
              Systered.com
            </Link>
          </Text>
          <Text style={styles.footerCopyright}>Sistemas y Redes © {year}</Text>
          <Text style={styles.footerCopyright}>{`https://${backendDomain}`}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Estilos de inicialización
  initContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initContent: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  initTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
    letterSpacing: 1,
  },
  initSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  loaderContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  loadingSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 8,
  },

  // Estilos principales
  container: {
    flex: 1,
  },
  securityBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  securityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bankName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
  },
  systemName: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  // Hero Section
  heroContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heroItem: {},

  // Formulario
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 8,
    color: "#fff",
  },
  input: {
    flex: 1,
    height: 50,
    color: "white",
    fontSize: 16,
    paddingRight: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  inputFocused: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#ef4444",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "600",
  },

  // Botón
  buttonContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  loadingButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(220,38,38,0.8)",
    paddingVertical: 16,
    borderRadius: 12,
  },
  loadingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },

  // Aviso de Seguridad
  securityNotice: {
    flexDirection: "row",
    backgroundColor: "rgba(251,191,36,0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityNoticeTitle: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  securityNoticeText: {
    color: "rgba(251,191,36,0.8)",
    fontSize: 12,
    lineHeight: 16,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    textAlign: "center",
  },
  footerLink: {
    color: "#fca5a5",
    fontWeight: "600",
  },
  footerCopyright: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});
