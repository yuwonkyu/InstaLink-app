import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout() {
  const { session, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && session) {
      router.dismissAll();
      router.replace("/(app)");
    }
  }, [session, initialized]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
