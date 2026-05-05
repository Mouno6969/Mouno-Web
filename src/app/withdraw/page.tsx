import Link from "next/link";
import { PromotionalPurposeNotice } from "@/components/PromotionalPurposeNotice";
import { submitWithdrawalRequest } from "./actions";

export default async function WithdrawPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;

  return (
    <main className="section">
      <PromotionalPurposeNotice compact />
      <div className="grid2">
        <section className="panel">
          <span className="badge">Twitter/X promoter payout request</span>
          <h1>Request a SOL withdrawal.</h1>
          <p className="lede">Submit your Twitter/X profile URL or handle, SOL wallet address, requested amount, and context for manual admin review.</p>
          <p className="notice">Withdrawals are not automatic. Admins review promoter status, verified posts, points, reward pool availability, and payout details before approval or payment.</p>
        </section>
        <section className="panel">
          <h2>Withdrawal request</h2>
          {query.submitted ? <p className="message">Request submitted for manual admin review. Use <Link href="/status">status lookup</Link> to check withdrawal updates.</p> : null}
          {query.error === "missing" ? <p className="message error">Twitter/X profile, SOL wallet, and amount are required.</p> : null}
          {query.error === "promoter" ? <p className="message error">Promoter not found or inactive. Apply first.</p> : null}
          <form className="form" action={submitWithdrawalRequest}>
            <label className="field">Twitter/X profile URL or handle <input name="xIdentifier" required placeholder="https://x.com/yourhandle or @yourhandle" /></label>
            <label className="field">SOL wallet address <input name="solWallet" required placeholder="Solana wallet address" /></label>
            <label className="field">Requested amount <input name="requestedAmount" required placeholder="Example: 0.5 SOL or $25 equivalent" /></label>
            <label className="field">Message <textarea name="message" placeholder="Optional notes for admin" /></label>
            <button className="button" type="submit">Submit request</button>
          </form>
          <p><Link href="/promoters/apply">Apply as promoter</Link> · <Link href="/promoters/posts">Submit post</Link> · <Link href="/status">Check status</Link></p>
        </section>
      </div>
    </main>
  );
}
