import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { socialLogin } from "@/lib/socialAuth";

function KakaoIcon() {
  return (
    <View style={{
      width: 20, height: 20, borderRadius: 5,
      backgroundColor: "#3C1E1E",
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ color: "#FEE500", fontSize: 11, fontWeight: "900", lineHeight: 14 }}>K</Text>
    </View>
  );
}

function GoogleIcon() {
  return <AntDesign name="google" size={18} color="#EA4335" />;
}

export function SocialLoginButtons() {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <TouchableOpacity
        onPress={() => socialLogin("kakao")}
        style={{
          flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
          backgroundColor: "#FEE500", borderRadius: 14, paddingVertical: 14, gap: 8,
        }}
        activeOpacity={0.85}
      >
        <KakaoIcon />
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#3C1E1E" }}>카카오</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => socialLogin("google")}
        style={{
          flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
          backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, gap: 8,
          borderWidth: 1.5, borderColor: "#E5E7EB",
        }}
        activeOpacity={0.85}
      >
        <GoogleIcon />
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>구글</Text>
      </TouchableOpacity>
    </View>
  );
}

function Divider({ label = "또는" }: { label?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
      <Text style={{ fontSize: 12, color: "#9CA3AF", marginHorizontal: 12 }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
    </View>
  );
}

export { Divider };
