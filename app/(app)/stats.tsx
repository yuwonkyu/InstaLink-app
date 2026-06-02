import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

type DailyBar = { label: string; total: number };
type ClickStats = { kakao: number; instagram: number; phone: number };

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export default function StatsScreen() {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [dailyBars, setDailyBars] = useState<DailyBar[]>([]);
  const [weekClicks, setWeekClicks] = useState<ClickStats>({ kakao: 0, instagram: 0, phone: 0 });
  const [totalClicks, setTotalClicks] = useState<ClickStats>({ kakao: 0, instagram: 0, phone: 0 });

  useEffect(() => {
    loadStats();
  }, [session]);

  async function loadStats() {
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, view_count")
      .eq("owner_id", session.user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    setViewCount(profile.view_count ?? 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [{ data: totalData }, { data: weekData }, { data: clickData }] = await Promise.all([
      supabase.from("link_clicks").select("link_type").eq("profile_id", profile.id),
      supabase.from("link_clicks").select("link_type, created_at").eq("profile_id", profile.id).gte("created_at", weekAgo.toISOString()),
      supabase.from("link_clicks").select("created_at").eq("profile_id", profile.id).gte("created_at", weekAgo.toISOString()),
    ]);

    // 클릭 타입 집계
    const sumClicks = (data: { link_type: string }[] | null): ClickStats =>
      (data ?? []).reduce((acc, row) => {
        if (row.link_type === "kakao") acc.kakao += 1;
        if (row.link_type === "instagram") acc.instagram += 1;
        if (row.link_type === "phone") acc.phone += 1;
        return acc;
      }, { kakao: 0, instagram: 0, phone: 0 });

    setTotalClicks(sumClicks(totalData));
    setWeekClicks(sumClicks(weekData));

    // 7일 바 차트
    const byDate: Record<string, number> = {};
    for (const row of clickData ?? []) {
      const date = new Date(row.created_at).toISOString().split("T")[0];
      byDate[date] = (byDate[date] ?? 0) + 1;
    }
    const bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().split("T")[0];
      return { label: i === 6 ? "오늘" : DAYS_KO[d.getDay()], total: byDate[date] ?? 0 };
    });
    setDailyBars(bars);
    setLoading(false);
  }

  const maxBar = Math.max(...dailyBars.map(b => b.total), 1);

  return (
    <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 bg-card border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-sm text-muted">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">방문자 통계</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* 누적 방문자 */}
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <Text className="text-xs text-muted font-semibold uppercase mb-2">누적 방문자</Text>
            <Text className="text-4xl font-black text-primary">{viewCount.toLocaleString()}</Text>
            <Text className="text-sm text-muted mt-1">명이 내 페이지를 방문했어요</Text>
          </View>

          {/* 7일 바 차트 */}
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <Text className="text-xs text-muted font-semibold uppercase mb-4">최근 7일 링크 클릭</Text>
            {dailyBars.some(b => b.total > 0) ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "flex-end", height: 80, gap: 4, marginBottom: 6 }}>
                  {dailyBars.map((b, i) => (
                    <View key={i} style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                      <View style={{
                        width: "100%",
                        height: `${Math.max((b.total / maxBar) * 100, b.total > 0 ? 8 : 0)}%`,
                        backgroundColor: "#111827",
                        borderRadius: 4,
                        opacity: 0.8,
                      }} />
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row" }}>
                  {dailyBars.map((b, i) => (
                    <Text key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9CA3AF" }}>{b.label}</Text>
                  ))}
                </View>
              </>
            ) : (
              <Text className="text-sm text-muted text-center py-4">아직 링크 클릭 데이터가 없어요</Text>
            )}
          </View>

          {/* 클릭 통계 */}
          <View className="bg-card rounded-3xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs text-muted font-semibold uppercase">링크 클릭</Text>
              <Text className="text-xs text-muted">이번 주 / 전체</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { label: "카카오", week: weekClicks.kakao, total: totalClicks.kakao },
                { label: "인스타", week: weekClicks.instagram, total: totalClicks.instagram },
                { label: "전화", week: weekClicks.phone, total: totalClicks.phone },
              ].map(item => (
                <View key={item.label} className="flex-1 bg-secondary rounded-2xl p-3 items-center">
                  <Text className="text-2xl font-black text-primary">{item.week}</Text>
                  <Text className="text-xs text-muted">{item.total > 0 ? `/ ${item.total}` : "—"}</Text>
                  <Text className="text-xs text-muted mt-1">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
