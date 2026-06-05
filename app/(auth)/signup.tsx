import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ScrollView, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { SocialLoginButtons, Divider } from "@/components/SocialButtons";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const inputStyle = {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    flexDirection: "row" as const, alignItems: "center" as const,
    paddingHorizontal: 16, marginBottom: 12, backgroundColor: "#FAFAFA",
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24, alignSelf: "flex-start" }}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#111827", letterSpacing: -0.5 }}>
              회원가입
            </Text>
            <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              6월 한정 · Pro 평생 무료 이벤트 중 🎉
            </Text>
          </View>

          {/* 소셜 회원가입 */}
          <View style={{ paddingHorizontal: 24, marginBottom: 4 }}>
            <SocialLoginButtons />
            <Divider label="또는 이메일로 가입" />
          </View>

          {/* 이메일 폼 */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={inputStyle}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: 15 }}
                placeholder="이름"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={inputStyle}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: 15 }}
                placeholder="이메일"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={{ ...inputStyle, marginBottom: 20 }}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: 15 }}
                placeholder="비밀번호 (8자 이상)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 4 }}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#111827", borderRadius: 14,
                paddingVertical: 16, alignItems: "center",
                opacity: loading ? 0.6 : 1,
              }}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {loading ? "가입 중…" : "무료 시작하기"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 로그인 링크 */}
          <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 40 }}>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={{ flexDirection: "row", gap: 4, paddingVertical: 8, paddingHorizontal: 16 }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>이미 계정이 있으신가요?</Text>
              <Text style={{ fontSize: 14, color: "#111827", fontWeight: "700" }}>로그인</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
