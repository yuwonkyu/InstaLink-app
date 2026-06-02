import { View, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Plan } from "@/lib/types";
import { PLAN_META } from "@/lib/types";

const PLANS: { plan: Plan; features: string[] }[] = [
  {
    plan: "free",
    features: ["기본 프로필 페이지", "라이트 테마", "서비스·후기 3개", "갤러리 3장"],
  },
  {
    plan: "basic",
    features: ["테마 3종", "서비스·후기 6개", "갤러리 6장", "영업시간 표시"],
  },
  {
    plan: "pro",
    features: ["테마 7종", "방문자 통계", "AI 문구 추천", "섹션 순서·버튼 색상"],
  },
];

export default function BillingScreen() {
  const { session } = useAuthStore();
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [isMvp, setIsMvp] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("plan, is_mvp")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCurrentPlan((data.plan as Plan) ?? "free");
          setIsMvp(data.is_mvp ?? false);
        }
      });
  }, [session]);

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 bg-card border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-sm text-muted">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">플랜 변경</Text>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        {/* MVP 배너 */}
        {isMvp && (
          <View className="bg-amber-50 border border-amber-200 rounded-3xl p-4">
            <Text className="text-sm font-bold text-amber-800">⭐ MVP 얼리어답터 혜택</Text>
            <Text className="text-xs text-amber-700 mt-1">
              초기 가입자 혜택으로 Pro 플랜을 영구 무료로 이용하고 계십니다.
            </Text>
          </View>
        )}

        {/* 결제 오픈 예정 안내 */}
        <View className="bg-blue-50 border border-blue-100 rounded-3xl p-4">
          <Text className="text-sm font-bold text-blue-800">🗓 결제 시스템 준비 중</Text>
          <Text className="text-xs text-blue-700 mt-1">
            토스페이먼츠 심사 완료 후 6월 20일부터 결제가 가능합니다.
          </Text>
        </View>

        {/* 플랜 카드들 */}
        {PLANS.map(({ plan, features }) => {
          const meta = PLAN_META[plan];
          const isCurrent = currentPlan === plan;
          return (
            <View
              key={plan}
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 20,
                borderWidth: 2,
                borderColor: isCurrent ? "#111827" : plan === "pro" ? "#FCD34D" : "#F3F4F6",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>
                  {meta.label}
                </Text>
                {isCurrent && (
                  <View style={{ backgroundColor: "#111827", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>현재 플랜</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#111827", marginBottom: 12 }}>
                {meta.price === 0 ? "무료" : `${meta.price.toLocaleString()}원`}
                {meta.price > 0 && <Text style={{ fontSize: 13, fontWeight: "400", color: "#9CA3AF" }}>/월</Text>}
              </Text>
              {features.map(f => (
                <Text key={f} style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                  ✓ {f}
                </Text>
              ))}
            </View>
          );
        })}

        {/* 문의 */}
        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:duck01777@naver.com?subject=InstaLink 플랜 문의")}
          className="items-center py-3"
        >
          <Text className="text-xs text-muted">플랜 관련 문의: duck01777@naver.com</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
