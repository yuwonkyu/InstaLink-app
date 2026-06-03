import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

async function handleSocialLogin(provider: "google" | "kakao") {
  const redirectTo = "https://instalink.kkustudio.com/app-redirect";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    Alert.alert("오류", "소셜 로그인을 시작할 수 없습니다.");
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success") {
    const { error: err } = await supabase.auth.exchangeCodeForSession(result.url);
    if (err) Alert.alert("오류", "로그인 처리에 실패했습니다.");
    else router.replace("/(app)");
  }
}

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
    if (error) Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    else router.replace("/(app)");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-black text-primary mb-1">InstaLink</Text>
        <Text className="text-sm text-muted mb-10">인스타 바이오 링크 관리</Text>

        {/* 소셜 로그인 */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            className="w-full rounded-2xl py-4 items-center"
            style={{ backgroundColor: "#FEE500", borderWidth: 1, borderColor: "#e8d600" }}
            onPress={() => handleSocialLogin("kakao")}
          >
            <Text className="text-base font-bold" style={{ color: "#3C1E1E" }}>
              카카오로 계속하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full rounded-2xl bg-white py-4 items-center border border-gray-200"
            onPress={() => handleSocialLogin("google")}
          >
            <Text className="text-base font-bold text-gray-700">Google로 계속하기</Text>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-xs text-muted">또는 이메일로 로그인</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* 이메일 로그인 */}
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
          className="mt-4 w-full rounded-2xl bg-primary py-4 items-center"
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
