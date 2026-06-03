import { useEffect } from "react";
import { Alert } from "react-native";
import { Stack } from "expo-router";

// 크래시 원인 파악용 글로벌 에러 핸들러 (확인 후 삭제)
if (typeof ErrorUtils !== "undefined") {
  const prev = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert("CRASH", `${error?.message}\n${error?.stack?.slice(0, 200)}`);
    prev?.(error, isFatal);
  });
}
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    async function handleOAuthUrl(url: string) {
      if (!url.includes("code=")) return;
      WebBrowser.dismissBrowser();
      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (!error) router.replace("/(app)");
    }

    Linking.getInitialURL().then((url) => { if (url) handleOAuthUrl(url); });
    const subscription = Linking.addEventListener("url", ({ url }) => handleOAuthUrl(url));
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
