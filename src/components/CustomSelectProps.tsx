import React from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ícono para el dropdown
import { ColorsConstants } from "../config/Colors";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, selectedValue, onSelect }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selectBox} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedText}>{selectedValue || label}</Text>
        <Ionicons name="chevron-down" size={20} color="#555" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        onSelect(item.value);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10, flex: 1 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  selectedText: { fontSize: 14, color: "#333" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  option: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
  optionText: { fontSize: 14 },
  closeButton: {
    padding: 10,
    backgroundColor: ColorsConstants.light.accent,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  closeText: { color: "white", fontWeight: "bold" },
});

export default CustomSelect;
