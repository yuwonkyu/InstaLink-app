import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) {
      Alert.alert("입력 오류", "이메일을 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      Alert.alert("오류", error.message);
    } else {
      Alert.alert("발송 완료", "비밀번호 재설정 링크를 이메일로 보냈습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="text-sm text-muted">← 돌아가기</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-black text-primary mb-1">비밀번호 찾기</Text>
        <Text className="text-sm text-muted mb-10">가입한 이메일로 재설정 링크를 보내드립니다.</Text>

        <TextInput
          className="w-full rounded-2xl bg-secondary px-4 py-4 text-base text-primary"
          placeholder="이메일"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          className="mt-6 w-full rounded-2xl bg-primary py-4 items-center"
          onPress={handleReset}
          disabled={loading}
        >
          <Text className="text-base font-bold text-white">
            {loading ? "발송 중…" : "재설정 링크 보내기"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
