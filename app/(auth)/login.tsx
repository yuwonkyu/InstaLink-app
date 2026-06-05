import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
  ScrollView, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { SocialLoginButtons, Divider } from "@/components/SocialButtons";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    else { router.dismissAll(); router.replace("/(app)"); }
  }

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
          {/* 로고 */}
          <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 40 }}>
            <View style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: "#111827",
              alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <Ionicons name="link" size={28} color="#fff" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#111827", letterSpacing: -0.5 }}>
              InstaLink
            </Text>
            <Text style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              인스타 바이오 링크 관리
            </Text>
          </View>

          {/* 폼 */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{
              borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
              flexDirection: "row", alignItems: "center",
              paddingHorizontal: 16, marginBottom: 12, backgroundColor: "#FAFAFA",
            }}>
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

            <View style={{
              borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
              flexDirection: "row", alignItems: "center",
              paddingHorizontal: 16, marginBottom: 20, backgroundColor: "#FAFAFA",
            }}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: "#111827", paddingVertical: 15 }}
                placeholder="비밀번호"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {loading ? "로그인 중…" : "로그인"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/reset-password")}
              style={{ alignItems: "center", paddingVertical: 14 }}
            >
              <Text style={{ fontSize: 13, color: "#9CA3AF" }}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>

            {/* 소셜 로그인 */}
            <Divider />
            <SocialLoginButtons />
          </View>

          {/* 회원가입 */}
          <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 40 }}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              style={{ flexDirection: "row", gap: 4, paddingVertical: 8, paddingHorizontal: 16 }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>계정이 없으신가요?</Text>
              <Text style={{ fontSize: 14, color: "#111827", fontWeight: "700" }}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
