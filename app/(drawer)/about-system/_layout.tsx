import React, { useLayoutEffect } from "react";
import { Slot, useNavigation } from "expo-router";

export default function OrderListLayout() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Sobre Nosotros`,
    });
  }, [navigation]);
  return <Slot />;
}
