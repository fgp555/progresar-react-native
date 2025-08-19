// app/_layout.tsx

import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const pathname = usePathname();
  console.log("pathname:", pathname);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <StatusBar style="dark" translucent /> */}
      <StatusBar />
      <Slot />
    </GestureHandlerRootView>
  );
}
