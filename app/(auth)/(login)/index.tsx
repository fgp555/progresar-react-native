import useAuthStore from "@/src/store/useAuthStore";
import { loginStyle as styles } from "@/src/styles/loginStyle";
import { apiBaseURL, apiDomain } from "@/src/utils/varGlobal";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function Index() {
  const [email, setEmail] = useState("admin@transpaservic.com.co");
  const [password, setPassword] = useState("*Transpa/*123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token, setUser, userStore, getUserFromStorage, refreshToken } = useAuthStore();
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const router = useRouter();

  useEffect(() => {
    getUserFromStorage();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      await getUserFromStorage();
      await refreshToken();
      console.log("token", token);
    };

    fetchUser();
  }, []);

  const pathRedirect = "./order/list";

  useEffect(() => {
    if (token) {
      // console.log("token2", token);
      router.push(pathRedirect);
    }
  }, [token]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseURL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const data = await res.json();
      setUser(data);
      router.push(pathRedirect);
    } catch (error) {
      console.error(error);
      alert("El servidor no responde.");
    } finally {
      setLoading(false);
    }
  };
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null); // Guarda el input activo
  // const pathname = usePathname();

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
              <Link href={`https://${apiDomain}/password/forgot`}>
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
          <TouchableOpacity style={styles.button2}>
            <Link href={`https://${apiDomain}/consultas`}>
              <View style={styles.buttonContent}>
                <FontAwesome6 name="magnifying-glass" size={20} color="white" />
                <Text style={styles.buttonText}>Consultas por Documento</Text>
              </View>
            </Link>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Diseñado por{" "}
          <Link href="https://www.systered.com" style={{ color: "#b00" }}>
            Systered.com
          </Link>
        </Text>
        <Text style={styles.footerText}>Sistemas y Redes © 2025</Text>
      </View>
    </ScrollView>
  );
}
