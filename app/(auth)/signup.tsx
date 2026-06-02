import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("입력 오류", "비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert("가입 실패", error.message);
    } else {
      Alert.alert("가입 완료", "이메일을 확인해주세요.", [
        { text: "확인", onPress: () => router.replace("/(auth)/login") },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <Text className="text-3xl font-black text-primary mb-1">회원가입</Text>
          <Text className="text-sm text-muted mb-10">6월 한정 · Pro 평생 무료 이벤트 중</Text>

          <View className="gap-3">
            <TextInput
              className="w-full rounded-2xl bg-secondary px-4 py-4 text-base text-primary"
              placeholder="이름"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="mt-6 w-full rounded-2xl bg-primary py-4 items-center"
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-base font-bold text-white">
              {loading ? "가입 중…" : "무료 시작하기"}
            </Text>
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Link href="/(auth)/login">
              <Text className="text-sm text-muted">이미 계정이 있으신가요? 로그인</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
