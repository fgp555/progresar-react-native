import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { ColorsConstants } from "../config/Colors";

interface CustomButtonProps {
  title: string;
  onPress: (event: any) => void;
}

export default function CustomButton({ title, onPress }: CustomButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: ColorsConstants.light.accent, // Color de fondo
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 42,
  },
  buttonText: {
    color: ColorsConstants.light.white, // Color del texto
    fontSize: 14,
    fontWeight: "bold",
  },
});
