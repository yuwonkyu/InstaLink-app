# InstaLink App

인스타그램 바이오 링크 관리 서비스 — 모바일 앱 (Expo / React Native)

## 기술 스택

- **Framework**: Expo SDK 54, React Native 0.81
- **라우팅**: Expo Router v6
- **인증**: Supabase Auth (이메일 + 소셜 로그인)
- **스타일**: NativeWind (Tailwind CSS)
- **상태관리**: Zustand
- **빌드**: EAS Build

## 개발 환경 설정

```bash
npm install
npx expo start
```

핸드폰에 development APK 설치 후 QR 스캔으로 연결.

## 빌드

```bash
# Development 빌드 (expo-dev-client)
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android
```

## 소셜 로그인 구조

카카오 / 구글 OAuth는 PKCE flow를 사용하며, 안드로이드 딥링크 특성상 SDK 우회 방식으로 구현됨.

```
앱 → signInWithOAuth → 브라우저(카카오/구글) 
  → Supabase → instalink.kkustudio.com/app-redirect 
  → 딥링크(instalink://) → 앱
  → AsyncStorage에서 verifier 직접 읽어 REST API로 교환
  → setSession → 로그인 완료
```

> Supabase SDK 내부 lock/race 조건으로 `exchangeCodeForSession`이 정상 동작하지 않아,
> AsyncStorage에서 verifier를 직접 읽어 `/auth/v1/token?grant_type=pkce` 엔드포인트로 수동 교환함.

## 환경변수

`eas.json`의 각 프로필에 직접 주입 (`.env.local`은 EAS 클라우드 빌드에 포함되지 않음).

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## 프로젝트 구조

```
app/
├── (auth)/       # 로그인, 회원가입, 비밀번호 찾기
├── (app)/        # 메인 앱 (대시보드, 편집)
└── app-redirect  # 소셜 로그인 딥링크 수신 후 세션 대기
lib/
└── supabase.ts   # Supabase 클라이언트
```
