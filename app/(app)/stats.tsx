import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { router } from "expo-router";

const STATS_URL = "https://instalink.kkustudio.com/dashboard/stats";

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-sm text-muted">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">방문자 통계</Text>
      </View>
      <WebView
        source={{ uri: STATS_URL }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
