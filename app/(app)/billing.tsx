import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { router } from "expo-router";

const BILLING_URL = "https://instalink.kkustudio.com/billing";

export default function BillingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-sm text-muted">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">플랜 변경</Text>
      </View>
      <WebView
        source={{ uri: BILLING_URL }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
