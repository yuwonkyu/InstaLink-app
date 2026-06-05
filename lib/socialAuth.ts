import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export async function socialLogin(provider: "google" | "kakao") {
  const redirectTo = "https://instalink.kkustudio.com/app-redirect";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    Alert.alert("오류", "소셜 로그인을 시작할 수 없습니다.");
    return;
  }

  const subscription = Linking.addEventListener("url", async ({ url }) => {
    if (!url.includes("app-redirect")) return;
    subscription.remove();
    WebBrowser.dismissBrowser();

    const match = url.match(/[?&]code=([^&]+)/);
    const authCode = match?.[1];
    if (!authCode) return;

    const sbKey = (supabase.auth as any).storageKey ?? "";
    const rawVerifier = await AsyncStorage.getItem(`${sbKey}-code-verifier`);
    const codeVerifier = rawVerifier ? JSON.parse(rawVerifier).split("/")[0] : null;
    if (!codeVerifier) { Alert.alert("오류", "인증에 실패했습니다. 다시 시도해주세요."); return; }

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
        Alert.alert("소셜 로그인 실패", tokenData.error_description ?? "다시 시도해주세요.");
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
  if (result.type === "success") {
    subscription.remove();
    const match = result.url.match(/[?&]code=([^&]+)/);
    const code = match?.[1];
    if (code) {
      const { error: err } = await supabase.auth.exchangeCodeForSession(code);
      if (!err) { router.dismissAll(); router.replace("/(app)"); }
    }
  } else {
    setTimeout(() => subscription.remove(), 2000);
  }
}
