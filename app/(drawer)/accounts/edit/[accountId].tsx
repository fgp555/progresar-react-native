// app\(drawer)\accounts\edit\[accountId].tsx

import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AccountsEditParams() {
  const { id: accountId } = useLocalSearchParams();
  // const params = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      {/* <Stack.Screen name="AccountsEdit/[id]" options={{ title: "AccountsEdit " + accountId }} /> */}

      <Text> AccountsEdit {accountId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
