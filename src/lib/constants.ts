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

export const promoterQuality = {
  minimumFollowers: 1000,
  minimumFollowersLabel: "1000+",
  requiredHashtags: ["#RefundYourSol", "#RYS"],
  officialHandle: "@RefundYourSOL",
  criteria: [
    "Minimum 1000+ followers.",
    "Established Twitter/X account required; new or unclear accounts may be rejected.",
    "Crypto/Solana-related audience preferred.",
    "No bot or fake engagement.",
    "Posts must use #RefundYourSol or #RYS.",
    "Do not impersonate the official RefundYourSOL account.",
  ],
  rejectionRisks: "Applications and posts may be rejected for new or unclear accounts, fake engagement, missing required hashtags, or impersonating the official RefundYourSOL account.",
} as const;
