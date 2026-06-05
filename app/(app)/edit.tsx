import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  const [imageUrl, setImageUrl] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  // 아코디언 상태 — 기본정보만 열림
  const [open, setOpen] = useState<Record<string, boolean>>({
    basic: true,
    contact: false,
    location: false,
    services: false,
    reviews: false,
    gallery: false,
    links: false,
  });

  const toggle = (key: string) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

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
          setImageUrl(p.image_url ?? "");
          setServices(p.services ?? []);
          setReviews(p.reviews ?? []);
          setGallery(p.gallery ?? []);
          setCustomLinks(p.custom_links ?? []);
        }
        setLoading(false);
      });
  }, [session]);

  // 이미지 업로드 공통 함수
  async function uploadImage(uri: string, path: string): Promise<string | null> {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const fileName = `${path}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: `image/${ext}`, upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
      return publicUrl;
    } catch {
      return null;
    }
  }

  async function handlePickProfileImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const url = await uploadImage(uri, `profile/${session!.user.id}`);
    if (url) setImageUrl(url);
    else {
      // 업로드 실패 시 로컬 URI로 임시 표시
      setImageUrl(uri);
      Alert.alert("알림", "이미지 업로드에 실패했습니다. 저장 시 반영되지 않을 수 있어요.");
    }
  }

  async function handlePickGalleryImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const url = await uploadImage(uri, `gallery/${session!.user.id}`);
    setGallery(prev => [...prev, { url: url ?? uri, caption: "" }]);
  }

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
        image_url:    imageUrl.trim(),
        services:     services.filter(s => s.name.trim()),
        reviews:      reviews.filter(r => r.text.trim()),
        gallery:      gallery.filter(g => g.url.trim()),
        custom_links: customLinks.filter(l => l.url.trim()),
      })
      .eq("owner_id", session!.user.id);
    setSaving(false);
    if (error) Alert.alert("오류", "저장에 실패했습니다.");
    else Alert.alert("저장 완료", "프로필이 업데이트됐습니다.");
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
      {/* 헤더 */}
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
          contentContainerStyle={{ padding: 16, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 프로필 사진 */}
          <View className="items-center py-6 bg-white rounded-3xl shadow-sm mb-4">
            <TouchableOpacity onPress={handlePickProfileImage} className="relative">
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-24 h-24 rounded-full bg-gray-100"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="person" size={40} color="#D1D5DB" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-xs text-muted mt-2">프로필 사진 변경</Text>
          </View>

          {/* 기본 정보 */}
          <Accordion title="기본 정보" isOpen={open.basic} onToggle={() => toggle("basic")}>
            <Field label="이름" value={name} onChangeText={setName} placeholder="홍길동" />
            <Field label="상호명" value={shopName} onChangeText={setShopName} placeholder="홍길동 필라테스" />
            <Field label="한줄 소개" value={tagline} onChangeText={setTagline} placeholder="강남 1:1 필라테스 전문" />
            <Field label="상세 설명" value={description} onChangeText={setDescription} placeholder="센터 소개를 입력하세요" multiline />
          </Accordion>

          {/* 연락처 */}
          <Accordion title="연락처" isOpen={open.contact} onToggle={() => toggle("contact")}>
            <Field label="카카오 상담 URL" value={kakaoUrl} onChangeText={setKakaoUrl} placeholder="https://open.kakao.com/..." keyboardType="url" />
            <Field label="전화번호 URL" value={phoneUrl} onChangeText={setPhoneUrl} placeholder="tel:010-0000-0000" keyboardType="url" />
            <Field label="인스타그램 ID" value={instagramId} onChangeText={setInstagramId} placeholder="@username" autoCapitalize="none" />
          </Accordion>

          {/* 위치·영업시간 */}
          <Accordion title="위치 · 영업시간" isOpen={open.location} onToggle={() => toggle("location")}>
            <Field label="위치" value={location} onChangeText={setLocation} placeholder="서울 강남구" />
            <Field label="영업시간" value={hours} onChangeText={setHours} placeholder="평일 10:00 - 20:00" />
          </Accordion>

          {/* 서비스 */}
          <Accordion
            title={`서비스${services.length > 0 ? ` (${services.length})` : ""}`}
            isOpen={open.services}
            onToggle={() => toggle("services")}
            onAdd={() => setServices(prev => [...prev, { name: "", price: "", note: "" }])}
            addLabel="서비스 추가"
          >
            {services.map((item, i) => (
              <ArrayItem key={i} onDelete={() => setServices(prev => prev.filter((_, idx) => idx !== i))}>
                <Field label="서비스명" value={item.name}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, name: v } : s))}
                  placeholder="1:1 PT 1회" />
                <Field label="가격" value={item.price}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, price: v } : s))}
                  placeholder="80,000원" />
                <Field label="메모 (선택)" value={item.note ?? ""}
                  onChangeText={v => setServices(prev => prev.map((s, idx) => idx === i ? { ...s, note: v } : s))}
                  placeholder="60분 / 체험 가능" />
              </ArrayItem>
            ))}
          </Accordion>

          {/* 후기 */}
          <Accordion
            title={`후기${reviews.length > 0 ? ` (${reviews.length})` : ""}`}
            isOpen={open.reviews}
            onToggle={() => toggle("reviews")}
            onAdd={() => setReviews(prev => [...prev, { text: "", author: "", date: "" }])}
            addLabel="후기 추가"
          >
            {reviews.map((item, i) => (
              <ArrayItem key={i} onDelete={() => setReviews(prev => prev.filter((_, idx) => idx !== i))}>
                <Field label="후기 내용" value={item.text}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, text: v } : r))}
                  placeholder="선생님이 정말 친절하세요!" multiline />
                <Field label="작성자" value={item.author}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, author: v } : r))}
                  placeholder="김*연" />
                <Field label="날짜 (선택)" value={item.date ?? ""}
                  onChangeText={v => setReviews(prev => prev.map((r, idx) => idx === i ? { ...r, date: v } : r))}
                  placeholder="2026.05" />
              </ArrayItem>
            ))}
          </Accordion>

          {/* 갤러리 */}
          <Accordion
            title={`갤러리${gallery.length > 0 ? ` (${gallery.length})` : ""}`}
            isOpen={open.gallery}
            onToggle={() => toggle("gallery")}
            onAdd={handlePickGalleryImage}
            addLabel="사진 추가"
          >
            {gallery.map((item, i) => (
              <ArrayItem key={i} onDelete={() => setGallery(prev => prev.filter((_, idx) => idx !== i))}>
                <View className="px-4 pt-3 pb-2">
                  {item.url ? (
                    <Image source={{ uri: item.url }} className="w-full h-40 rounded-2xl bg-gray-100 mb-2" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-40 rounded-2xl bg-gray-100 items-center justify-center mb-2">
                      <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                    </View>
                  )}
                </View>
                <Field label="캡션 (선택)" value={item.caption ?? ""}
                  onChangeText={v => setGallery(prev => prev.map((g, idx) => idx === i ? { ...g, caption: v } : g))}
                  placeholder="센터 내부" />
              </ArrayItem>
            ))}
          </Accordion>

          {/* 커스텀 링크 */}
          <Accordion
            title={`커스텀 링크${customLinks.length > 0 ? ` (${customLinks.length})` : ""}`}
            isOpen={open.links}
            onToggle={() => toggle("links")}
            onAdd={() => setCustomLinks(prev => [...prev, { title: "", url: "", style: "card" }])}
            addLabel="링크 추가"
          >
            {customLinks.map((item, i) => (
              <ArrayItem key={i} onDelete={() => setCustomLinks(prev => prev.filter((_, idx) => idx !== i))}>
                <Field label="링크 제목" value={item.title ?? item.label ?? ""}
                  onChangeText={v => setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, title: v } : l))}
                  placeholder="네이버 예약 바로가기" />
                <Field label="URL" value={item.url}
                  onChangeText={v => setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, url: v } : l))}
                  placeholder="https://..." keyboardType="url" autoCapitalize="none" />
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
          </Accordion>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Accordion({
  title, isOpen, onToggle, onAdd, addLabel, children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}) {
  const childCount = Array.isArray(children) ? children.filter(Boolean).length : (children ? 1 : 0);

  return (
    <View className="bg-white rounded-3xl overflow-hidden shadow-sm mb-2">
      {/* 헤더 */}
      <TouchableOpacity
        className="flex-row items-center justify-between px-4 py-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text className="text-sm font-bold text-primary">{title}</Text>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* 컨텐츠 */}
      {isOpen && (
        <>
          {childCount === 0 && onAdd ? (
            <View className="px-4 pb-2 items-center">
              <Text className="text-xs text-muted py-2">아직 없어요. 추가해보세요!</Text>
            </View>
          ) : (
            <View className="gap-3 px-0 pb-2">{children}</View>
          )}

          {onAdd && (
            <TouchableOpacity
              onPress={onAdd}
              className="flex-row items-center justify-center gap-1 mx-4 mb-4 py-3 rounded-2xl border border-dashed border-gray-200"
            >
              <Ionicons name="add-circle-outline" size={16} color="#6B7280" />
              <Text className="text-sm font-medium text-muted">{addLabel}</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

function ArrayItem({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <View className="mx-4 bg-secondary rounded-2xl overflow-hidden">
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
    <View className="px-4 py-3 border-b border-gray-100">
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
