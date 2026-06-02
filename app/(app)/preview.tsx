import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

const SITE_URL = "https://instalink.kkustudio.com";

export default function PreviewScreen() {
  const { session } = useAuthStore();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("slug")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setSlug(data?.slug ?? null));
  }, [session]);

  if (!slug) {
    return (
      <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-sm font-semibold text-primary text-center">미리보기</Text>
      </View>
      <WebView
        source={{ uri: `${SITE_URL}/${slug}` }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
