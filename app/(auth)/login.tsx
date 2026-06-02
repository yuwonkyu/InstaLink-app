import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    } else {
      router.replace("/(app)");
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-black text-primary mb-1">InstaLink</Text>
        <Text className="text-sm text-muted mb-10">인스타 바이오 링크 관리</Text>

        <View className="gap-3">
          <TextInput
            className="w-full rounded-2xl bg-secondary px-4 py-4 text-base text-primary"
            placeholder="이메일"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full rounded-2xl bg-secondary px-4 py-4 text-base text-primary"
            placeholder="비밀번호"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          className="mt-6 w-full rounded-2xl bg-primary py-4 items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-base font-bold text-white">
            {loading ? "로그인 중…" : "로그인"}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center gap-4">
          <Link href="/(auth)/signup">
            <Text className="text-sm text-muted">회원가입</Text>
          </Link>
          <Text className="text-sm text-muted">·</Text>
          <Link href="/(auth)/reset-password">
            <Text className="text-sm text-muted">비밀번호 찾기</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
