import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AiSupportWidget } from "@/components/AiSupportWidget";
import { site } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${site.name} | Twitter/X Promoter Rewards`,
  description: "Promotional community portal for RefundYourSOL Twitter/X promoter submissions, admin-reviewed points, and payout review. Not a replacement for the official platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="nav">
            <Link href="/" className="logo" aria-label="RefundYourSol Promo home">
              <span className="logoMark">R</span>
              <span>
                <strong>RefundYourSol</strong>
                <small>Promo</small>
              </span>
            </Link>
            <nav>
              <Link href="/promoters/apply">Apply</Link>
              <Link href="/promoters/posts">Submit post</Link>
              <Link href="/status">Status</Link>
              <Link href="/withdraw">Payouts</Link>
              <Link href="/admin">Admin</Link>
              <a className="officialNavLink" href={site.publicUrl} target="_blank" rel="noreferrer">Official site</a>
            </nav>
          </header>
          {children}
          <footer className="footer">
            <p>This website exists only to promote RefundYourSOL and support community promoter activity. It does not replace or impersonate the official RefundYourSOL platform.</p>
            <p><a href={site.publicUrl} target="_blank" rel="noreferrer">Visit the official RefundYourSOL website</a> for official platform actions. Rewards and payouts here are manually reviewed and subject to admin approval.</p>
          </footer>
        </div>
        <AiSupportWidget />
      </body>
    </html>
  );
}
