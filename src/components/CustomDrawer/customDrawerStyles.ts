import { StyleSheet } from "react-native";

export const customDrawerstyles = StyleSheet.create({
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
