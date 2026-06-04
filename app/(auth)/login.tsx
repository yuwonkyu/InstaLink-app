import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Linking,
} from "react-native";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  // 딥링크로 code가 돌아오면 SDK lock/race 우회 - AsyncStorage에서 직접 verifier 읽어 수동 교환
  const subscription = Linking.addEventListener("url", async ({ url }) => {
    if (!url.includes("app-redirect")) return;
    subscription.remove();
    WebBrowser.dismissBrowser();

    const match = url.match(/[?&]code=([^&]+)/);
    const authCode = match?.[1];
    if (!authCode) {
      Alert.alert("오류", "인증 코드를 찾을 수 없습니다.");
      return;
    }

    // SDK 내부 lock/race 우회: AsyncStorage에서 직접 verifier를 읽어 REST API로 교환
    const sbKey = (supabase.auth as any).storageKey ?? "";
    const rawVerifier = await AsyncStorage.getItem(`${sbKey}-code-verifier`);
    const codeVerifier = rawVerifier ? JSON.parse(rawVerifier).split("/")[0] : null;

    if (!codeVerifier) {
      Alert.alert("오류", "PKCE verifier를 찾을 수 없습니다.");
      return;
    }

    const supabaseUrl = (supabase as any).supabaseUrl as string;
    const supabaseKey = (supabase as any).supabaseKey as string;

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseKey },
        body: JSON.stringify({ auth_code: authCode, code_verifier: codeVerifier }),
      });
      const tokenData = await res.json();
      if (!res.ok || !tokenData.access_token) {
        Alert.alert("소셜 로그인 실패", tokenData.error_description ?? tokenData.message ?? "교환 실패");
        return;
      }
      await supabase.auth.setSession({ access_token: tokenData.access_token, refresh_token: tokenData.refresh_token });
      await AsyncStorage.removeItem(`${sbKey}-code-verifier`);
      router.dismissAll();
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("소셜 로그인 실패", e.message);
    }
  });

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  // iOS 등 openAuthSessionAsync가 직접 URL 캡처한 경우
  if (result.type === "success") {
    subscription.remove();
    const match = result.url.match(/[?&]code=([^&]+)/);
    const code = match?.[1];
    if (code) {
      const { error: err } = await supabase.auth.exchangeCodeForSession(code);
      if (err) Alert.alert("소셜 로그인 실패", err.message);
      else router.replace("/(app)");
    }
  } else {
    // 안드로이드: 브라우저가 dismiss됐지만 Linking 이벤트가 뒤늦게 올 수 있음
    // 2초 후에 구독 해제
    setTimeout(() => subscription.remove(), 2000);
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
