import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { session, signOut } = useAuthStore();

  async function handleSignOut() {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <View className="px-4 py-6">
        <Text className="text-xl font-black text-primary mb-6">설정</Text>

        <View className="bg-card rounded-3xl overflow-hidden shadow-sm mb-4">
          <View className="px-5 py-4 border-b border-gray-50">
            <Text className="text-xs text-muted mb-0.5">계정</Text>
            <Text className="text-sm font-semibold text-primary">{session?.user.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-card rounded-3xl px-5 py-4 shadow-sm"
          onPress={handleSignOut}
        >
          <Text className="text-sm font-semibold text-red-500">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
