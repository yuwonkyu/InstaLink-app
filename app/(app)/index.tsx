import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Profile } from "@/lib/types";
import { PLAN_META } from "@/lib/types";
import * as Clipboard from "expo-clipboard";

const SITE_URL = "https://instalink.kkustudio.com";

export default function DashboardScreen() {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);

  async function fetchProfile() {
    if (!session?.user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle();
    setProfile(data as Profile | null);
    setLoading(false);
  }

  useEffect(() => { fetchProfile(); }, [session]);

  async function handleCopy() {
    if (!profile) return;
    await Clipboard.setStringAsync(`${SITE_URL}/${profile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }

  async function handleSlugSave() {
    if (!profile || !slugInput.trim()) return;
    const slug = slugInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (slug.length < 2) {
      Alert.alert("오류", "주소는 2자 이상이어야 합니다.");
      return;
    }
    setSlugSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ slug })
      .eq("owner_id", session!.user.id);
    setSlugSaving(false);
    if (error) {
      Alert.alert("오류", "이미 사용 중인 주소입니다.");
    } else {
      setProfile(prev => prev ? { ...prev, slug } : null);
      setEditingSlug(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
        <Text className="text-muted text-sm">불러오는 중…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* 헤더 */}
        <View className="mb-2">
          <Text className="text-xl font-black text-primary">
            안녕하세요{profile?.name ? `, ${profile.name}님` : ""}! 👋
          </Text>
          <Text className="text-sm text-muted mt-0.5">내 InstaLink 페이지를 관리하세요.</Text>
        </View>

        {/* 내 페이지 카드 */}
        {profile && (
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-primary">내 페이지</Text>
              <View className={`rounded-full px-3 py-1 ${profile.is_active ? "bg-green-100" : "bg-gray-100"}`}>
                <Text className={`text-xs font-semibold ${profile.is_active ? "text-green-700" : "text-muted"}`}>
                  {profile.is_active ? "공개 중" : "비공개"}
                </Text>
              </View>
            </View>
            <Text className="text-lg font-bold text-primary">{profile.shop_name || profile.name}</Text>
            <Text className="text-sm text-muted mt-0.5 mb-4">{profile.tagline || "소개글 없음"}</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
                onPress={() => Linking.openURL(`${SITE_URL}/${profile.slug}`)}
              >
                <Text className="text-sm font-semibold text-white">내 페이지 보기 →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-500 rounded-2xl py-3 items-center"
                onPress={() => router.push("/(app)/edit")}
              >
                <Text className="text-sm font-semibold text-white">✏️ 편집하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 내 링크 */}
        {profile && (
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-primary">내 링크</Text>
              {profile.plan === "pro" && !editingSlug && (
                <TouchableOpacity onPress={() => { setSlugInput(profile.slug); setEditingSlug(true); }}>
                  <Text className="text-xs font-semibold text-indigo-500">주소 변경</Text>
                </TouchableOpacity>
              )}
            </View>
            {editingSlug ? (
              <View>
                <View className="flex-row items-center bg-secondary rounded-2xl px-4 py-3 mb-2">
                  <Text className="text-sm text-muted">{SITE_URL}/</Text>
                  <TextInput
                    className="flex-1 text-sm text-primary"
                    value={slugInput}
                    onChangeText={setSlugInput}
                    autoFocus
                    autoCapitalize="none"
                    placeholder="새 주소 입력"
                  />
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-primary rounded-2xl py-2.5 items-center"
                    onPress={handleSlugSave}
                    disabled={slugSaving}
                  >
                    <Text className="text-sm font-bold text-white">{slugSaving ? "저장 중…" : "저장"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-secondary rounded-2xl py-2.5 items-center"
                    onPress={() => setEditingSlug(false)}
                  >
                    <Text className="text-sm font-semibold text-muted">취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-secondary rounded-2xl px-4 py-3 flex-row items-center justify-between"
                onPress={handleCopy}
              >
                <Text className="text-sm text-primary flex-1" numberOfLines={1}>
                  {SITE_URL}/{profile.slug}
                </Text>
                <Text className="text-xs font-semibold text-accent ml-2">
                  {copied ? "복사됨 ✓" : "복사"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 방문자 통계 */}
        {profile && (
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-primary">누적 방문자</Text>
              {(profile.plan === "pro" || profile.plan === "basic") && (
                <TouchableOpacity onPress={() => router.push("/(app)/stats")}>
                  <Text className="text-xs font-semibold text-blue-500">상세 통계 →</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-4xl font-black text-primary">
              {(profile.view_count ?? 0).toLocaleString()}
            </Text>
            <Text className="text-sm text-muted mt-1">명이 내 페이지를 방문했어요</Text>
          </View>
        )}

        {/* 플랜 카드 */}
        {profile && (
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-primary">구독 플랜</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/billing")}>
                <Text className="text-xs font-semibold text-accent">플랜 변경 →</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-2 flex-wrap">
              <View className="bg-primary rounded-full px-3 py-1">
                <Text className="text-xs font-bold text-white uppercase">{profile.plan}</Text>
              </View>
              {profile.is_mvp && (
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: "#F59E0B" }}>
                  <Text className="text-xs font-bold text-white">⭐ MVP</Text>
                </View>
              )}
              <Text className="text-sm text-muted">
                {profile.is_mvp
                  ? "얼리어답터 무료"
                  : PLAN_META[profile.plan]?.price === 0
                    ? "무료"
                    : `${PLAN_META[profile.plan]?.price.toLocaleString()}원/월`}
              </Text>
            </View>
            {profile.is_mvp && (
              <Text className="text-xs text-accent font-medium mt-2">
                초기 가입자 혜택으로 Pro를 영구 무료로 이용하고 계세요.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
