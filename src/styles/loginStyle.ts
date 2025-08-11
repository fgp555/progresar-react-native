import { StyleSheet } from "react-native";

export const loginStyle = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    margin: 20,
    color: "#888",
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
    color: "#888",
  },
  forgotPassword: {
    textAlign: "right",
  },
  link: {
    color: "#888",
  },
  formContainer: {
    width: "80%",
  },
  inputContainer: {},
  inputFocused: {
    borderColor: "#b00",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputPassword: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  eyeButton: {
    position: "absolute",
    right: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#b00",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  button2: {
    width: "100%",
    backgroundColor: "#444",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10, // Espacio entre el icono y el texto
    fontWeight: "bold",
  },
  footer: {
    margin: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
  },
});
