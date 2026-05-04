import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${site.name} | Twitter/X Promoter Rewards`,
  description: "Unofficial promotional community portal for RefundYourSOL Twitter/X promoter points and admin-reviewed SOL rewards.",
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
              <Link href="/withdraw">Withdraw</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </header>
          {children}
          <footer className="footer">
            <p>Unofficial promotional community portal for RefundYourSOL. Not an official RefundYourSOL website.</p>
            <p>Rewards and payouts are manually reviewed and subject to admin approval.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
