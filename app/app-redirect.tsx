import { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AppRedirect() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    if (!code) return;

    async function waitForSession() {
      // login.tsx의 Linking 리스너가 PKCE 교환 중 — 세션 생길 때까지 최대 5초 대기
      for (let i = 0; i < 17; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(app)");
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      Alert.alert("소셜 로그인 실패", "다시 시도해주세요.", [{ text: "확인" }]);
      router.replace("/(auth)/login");
    }
    waitForSession();
  }, [code]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#111827" />
    </View>
  );
}
