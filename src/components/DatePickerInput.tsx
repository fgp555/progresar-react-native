import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerInputProps {
  label: string;
  dateValue: string;
  onChange: (date: string) => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  dateValue,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      // Si se cancela en Android, no cambiar la fecha
      setShowPicker(false);
      return;
    }

    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]); // Formato YYYY-MM-DD
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputBox} onPress={() => setShowPicker(true)}>
        <Text style={styles.inputText}>{dateValue || `${label} `}</Text>
        <Ionicons name="calendar" size={20} color="#5558" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateValue ? new Date(dateValue) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleConfirm}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10, flex: 1 },
  inputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
  },
  inputText: { fontSize: 14, color: "#555" },
});

export default DatePickerInput;
