import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Profile, Service, Review, GalleryImage, CustomLink } from "@/lib/types";

export default function EditScreen() {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [kakaoUrl, setKakaoUrl] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [location, setLocation] = useState("");
  const [hours, setHours] = useState("");
  const [phoneUrl, setPhoneUrl] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

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
          setServices(p.services ?? []);
          setReviews(p.reviews ?? []);
          setGallery(p.gallery ?? []);
          setCustomLinks(p.custom_links ?? []);
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
        services:     services.filter(s => s.name.trim()),
        reviews:      reviews.filter(r => r.text.trim()),
        gallery:      gallery.filter(g => g.url.trim()),
        custom_links: customLinks.filter(l => l.url.trim()),
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

          {/* 서비스 */}
          <ArraySection
            title="서비스"
            emptyText="등록된 서비스가 없습니다"
            onAdd={() => setServices(prev => [...prev, { name: "", price: "", note: "" }])}
          >
            {services.map((item, i) => (
              <ArrayItem
                key={i}
                onDelete={() => setServices(prev => prev.filter((_, idx) => idx !== i))}
              >
                <Field
                  label="서비스명"
                  value={item.name}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, name: v } : s))}
                  placeholder="1:1 PT 1회"
                />
                <Field
                  label="가격"
                  value={item.price}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, price: v } : s))}
                  placeholder="80,000원"
                />
                <Field
                  label="메모 (선택)"
                  value={item.note ?? ""}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, note: v } : s))}
                  placeholder="60분 / 체험 가능"
                />
              </ArrayItem>
            ))}
          </ArraySection>

          {/* 후기 */}
          <ArraySection
            title="후기"
            emptyText="등록된 후기가 없습니다"
            onAdd={() => setReviews(prev => [...prev, { text: "", author: "", date: "" }])}
          >
            {reviews.map((item, i) => (
              <ArrayItem
                key={i}
                onDelete={() => setReviews(prev => prev.filter((_, idx) => idx !== i))}
              >
                <Field
                  label="후기 내용"
                  value={item.text}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, text: v } : r))}
                  placeholder="선생님이 정말 친절하세요!"
                  multiline
                />
                <Field
                  label="작성자"
                  value={item.author}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, author: v } : r))}
                  placeholder="김*연"
                />
                <Field
                  label="날짜 (선택)"
                  value={item.date ?? ""}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, date: v } : r))}
                  placeholder="2026.05"
                />
              </ArrayItem>
            ))}
          </ArraySection>

          {/* 갤러리 */}
          <ArraySection
            title="갤러리"
            emptyText="등록된 이미지가 없습니다"
            onAdd={() => setGallery(prev => [...prev, { url: "", caption: "" }])}
          >
            {gallery.map((item, i) => (
              <ArrayItem
                key={i}
                onDelete={() => setGallery(prev => prev.filter((_, idx) => idx !== i))}
              >
                <Field
                  label="이미지 URL"
                  value={item.url}
                  onChangeText={v => setGallery(prev => prev.map((g, idx) => idx === i ? { ...g, url: v } : g))}
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                />
                <Field
                  label="캡션 (선택)"
                  value={item.caption ?? ""}
                  onChangeText={v => setGallery(prev => prev.map((g, idx) => idx === i ? { ...g, caption: v } : g))}
                  placeholder="센터 내부"
                />
              </ArrayItem>
            ))}
          </ArraySection>

          {/* 커스텀 링크 */}
          <ArraySection
            title="커스텀 링크"
            emptyText="등록된 링크가 없습니다"
            onAdd={() => setCustomLinks(prev => [...prev, { title: "", url: "", style: "card" }])}
          >
            {customLinks.map((item, i) => (
              <ArrayItem
                key={i}
                onDelete={() => setCustomLinks(prev => prev.filter((_, idx) => idx !== i))}
              >
                <Field
                  label="링크 제목"
                  value={item.title ?? item.label ?? ""}
                  onChangeText={v => setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, title: v } : l))}
                  placeholder="네이버 예약 바로가기"
                />
                <Field
                  label="URL"
                  value={item.url}
                  onChangeText={v => setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, url: v } : l))}
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                />
                <View className="px-4 py-3 border-b border-gray-50">
                  <Text className="text-xs text-muted mb-2">스타일</Text>
                  <View className="flex-row gap-2">
                    {(["card", "thumb", "text"] as const).map(style => (
                      <TouchableOpacity
                        key={style}
                        onPress={() => setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, style } : l))}
                        className={`px-3 py-1 rounded-full border ${item.style === style ? "bg-primary border-primary" : "border-gray-200 bg-white"}`}
                      >
                        <Text className={`text-xs font-medium ${item.style === style ? "text-white" : "text-muted"}`}>
                          {style === "card" ? "카드" : style === "thumb" ? "썸네일" : "텍스트"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ArrayItem>
            ))}
          </ArraySection>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
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

function ArraySection({
  title, children, emptyText, onAdd,
}: {
  title: string;
  children: React.ReactNode;
  emptyText: string;
  onAdd: () => void;
}) {
  const count = Array.isArray(children) ? children.length : (children ? 1 : 0);
  return (
    <View>
      <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{title}</Text>
      {count === 0 ? (
        <View className="bg-card rounded-3xl py-6 items-center shadow-sm mb-3">
          <Text className="text-sm text-muted">{emptyText}</Text>
        </View>
      ) : (
        <View className="gap-3 mb-3">{children}</View>
      )}
      <TouchableOpacity
        onPress={onAdd}
        className="flex-row items-center justify-center gap-1 bg-card rounded-2xl py-3 shadow-sm border border-dashed border-gray-200"
      >
        <Ionicons name="add-circle-outline" size={16} color="#6B7280" />
        <Text className="text-sm font-medium text-muted">{title} 추가</Text>
      </TouchableOpacity>
    </View>
  );
}

function ArrayItem({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <View className="bg-card rounded-3xl overflow-hidden shadow-sm">
      {children}
      <TouchableOpacity
        onPress={onDelete}
        className="flex-row items-center justify-center gap-1 py-3 border-t border-red-50"
      >
        <Ionicons name="trash-outline" size={14} color="#EF4444" />
        <Text className="text-xs font-medium text-red-400">삭제</Text>
      </TouchableOpacity>
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
    <View className="px-4 py-3 border-b border-gray-50">
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
