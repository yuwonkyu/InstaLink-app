import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AppRedirect() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    if (code === undefined) return;

    async function exchange() {
      const codeStr = Array.isArray(code) ? code[0] : code;
      if (!codeStr) {
        router.replace("/(auth)/login");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(codeStr);
      if (error) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(app)");
      }
    }
    exchange();
  }, [code]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#111827" />
    </View>
  );
}
