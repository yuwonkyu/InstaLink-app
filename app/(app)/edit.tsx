import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Profile } from "@/lib/types";

export default function EditScreen() {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 편집 필드
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [kakaoUrl, setKakaoUrl] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [location, setLocation] = useState("");
  const [hours, setHours] = useState("");
  const [phoneUrl, setPhoneUrl] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = data as Profile;
          setProfile(p);
          setName(p.name ?? "");
          setShopName(p.shop_name ?? "");
          setTagline(p.tagline ?? "");
          setDescription(p.description ?? "");
          setKakaoUrl(p.kakao_url ?? "");
          setInstagramId(p.instagram_id ?? "");
          setLocation(p.location ?? "");
          setHours(p.hours ?? "");
          setPhoneUrl(p.phone_url ?? "");
        }
        setLoading(false);
      });
  }, [session]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name:         name.trim(),
        shop_name:    shopName.trim() || name.trim(),
        tagline:      tagline.trim(),
        description:  description.trim(),
        kakao_url:    kakaoUrl.trim(),
        instagram_id: instagramId.trim(),
        location:     location.trim(),
        hours:        hours.trim(),
        phone_url:    phoneUrl.trim(),
      })
      .eq("owner_id", session!.user.id);
    setSaving(false);
    if (error) {
      Alert.alert("오류", "저장에 실패했습니다.");
    } else {
      Alert.alert("저장 완료", "프로필이 업데이트됐습니다.");
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary items-center justify-center">
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-lg font-black text-primary">프로필 편집</Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-4 py-2"
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-sm font-bold text-white">{saving ? "저장 중…" : "저장"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <Field label="이름" value={name} onChangeText={setName} placeholder="홍길동" />
          <Field label="상호명" value={shopName} onChangeText={setShopName} placeholder="홍길동 필라테스" />
          <Field label="한줄 소개" value={tagline} onChangeText={setTagline} placeholder="강남 1:1 필라테스 전문" />
          <Field label="상세 설명" value={description} onChangeText={setDescription} placeholder="센터 소개를 입력하세요" multiline />
        </Section>

        {/* 연락처 */}
        <Section title="연락처">
          <Field label="카카오 상담 URL" value={kakaoUrl} onChangeText={setKakaoUrl} placeholder="https://open.kakao.com/..." keyboardType="url" />
          <Field label="전화번호 URL" value={phoneUrl} onChangeText={setPhoneUrl} placeholder="tel:010-0000-0000" keyboardType="url" />
          <Field label="인스타그램 ID" value={instagramId} onChangeText={setInstagramId} placeholder="@username" autoCapitalize="none" />
        </Section>

        {/* 위치·영업시간 */}
        <Section title="위치 · 영업시간">
          <Field label="위치" value={location} onChangeText={setLocation} placeholder="서울 강남구" />
          <Field label="영업시간" value={hours} onChangeText={setHours} placeholder="평일 10:00 - 20:00" />
        </Section>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{title}</Text>
      <View className="bg-card rounded-3xl overflow-hidden shadow-sm">
        {children}
      </View>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, multiline, keyboardType, autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "url" | "email-address";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View className="px-4 py-3 border-b border-gray-50 last:border-0">
      <Text className="text-xs text-muted mb-1">{label}</Text>
      <TextInput
        className="text-sm text-primary"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
      />
    </View>
  );
}
