export const site = {
  name: "RefundYourSol Promo",
  brandUrl: "Refundyoursol.com",
  publicUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://refundyoursol.com",
  adminUsername: process.env.ADMIN_USERNAME || "@Hazrod_m",
};

export const socialLinks = {
  telegram: "https://t.me/refundyoursolbot?start=ref_8704145840",
  discord: "https://discord.gg/VJ6tqnhrdu",
  twitter: "https://x.com/RefundYourSOL",
} as const;

export type SocialKey = keyof typeof socialLinks;
