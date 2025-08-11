import React, { useLayoutEffect } from "react";
import { Redirect, Slot, useNavigation } from "expo-router";

export default function OrderListLayout() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Usuarios`,
    });
  }, [navigation]);
  return <Slot />;
}
