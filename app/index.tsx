import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { session, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return <Redirect href={session ? "/(app)" : "/(auth)/login"} />;
}
