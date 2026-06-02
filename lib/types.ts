// 웹(InstaLink)과 동일한 타입 — 수정 시 양쪽 동기화 필요

export type Service = {
  name: string;
  price: string;
  note?: string;
};

export type CustomLinkStyle = "card" | "thumb" | "text";

export type CustomLink = {
  title?: string;
  label?: string;
  url: string;
  style?: CustomLinkStyle;
  image_url?: string;
};

export function getLinkTitle(link: CustomLink): string {
  return link.title ?? link.label ?? "";
}

export type GalleryImage = {
  url: string;
  caption?: string;
};

export type GalleryLayout = "grid2" | "grid3";

export type BusinessHours = {
  mon?: string | null;
  tue?: string | null;
  wed?: string | null;
  thu?: string | null;
  fri?: string | null;
  sat?: string | null;
  sun?: string | null;
};

export type Review = {
  text: string;
  author: string;
  date?: string;
};

export type Theme =
  | "light"
  | "dark"
  | "ucc"
  | "softsage"
  | "warmlinen"
  | "energysteel"
  | "instagram";

export type Plan = "free" | "basic" | "pro";

export type Profile = {
  id: string;
  slug: string;
  owner_id: string;
  name: string;
  shop_name: string;
  tagline: string;
  description?: string;
  kakao_url: string;
  kakao_booking_url?: string | null;
  naver_booking_url?: string | null;
  instagram_id: string;
  location: string;
  hours: string;
  image_url: string;
  theme: Theme;
  plan: Plan;
  plan_expires_at?: string | null;
  services: Service[];
  reviews: Review[];
  is_active: boolean;
  is_available?: boolean;
  is_mvp?: boolean | null;
  created_at: string;
  referral_code?: string | null;
  custom_links?: CustomLink[] | null;
  view_count?: number;
  phone_url?: string | null;
  instagram_dm_url?: string | null;
  kakao_channel_url?: string | null;
  gallery?: GalleryImage[] | null;
  parking_info?: string | null;
  section_order?: string[] | null;
  button_color?: string | null;
  button_text_color?: string | null;
  gallery_layout?: GalleryLayout | null;
  business_hours?: BusinessHours | null;
};

export const PLAN_META: Record<Plan, { label: string; price: number }> = {
  free:  { label: "Free",  price: 0 },
  basic: { label: "Basic", price: 19900 },
  pro:   { label: "Pro",   price: 29900 },
};
