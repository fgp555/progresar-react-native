// [userId].tsx

import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function UserIdParams() {
  const { userId } = useLocalSearchParams();
  // const params = useLocalSearchParams<{ userId: string }>();

  return (
    <View style={styles.container}>
       {/* <Stack.Screen name="/user/details/[userId]" options={{ title: "UserId " + userId }} /> */}
       <Stack.Screen options={{ title: `Usuario ${userId}` }} />


       <Text> UserId {userId}</Text>
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