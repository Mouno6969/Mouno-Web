import Link from "next/link";
import { submitWithdrawalRequest } from "./actions";

export default async function WithdrawPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;

  return (
    <main className="section">
      <div className="grid2">
        <section className="panel">
          <span className="badge">Public promoter flow</span>
          <h1>Request a SOL withdrawal.</h1>
          <p className="lede">Promoter login is not required in v1. Submit your referral code, SOL wallet address, requested amount, and context for manual admin review.</p>
          <p className="notice">This form does not expose promoter balances and does not guarantee payout. Requests can be approved, rejected, or marked paid by admin.</p>
        </section>
        <section className="panel">
          <h2>Withdrawal request</h2>
          {query.submitted ? <p className="message">Request submitted for manual admin review.</p> : null}
          {query.error === "missing" ? <p className="message error">Referral code, SOL wallet, and amount are required.</p> : null}
          {query.error === "code" ? <p className="message error">Referral code is invalid or inactive.</p> : null}
          <form className="form" action={submitWithdrawalRequest}>
            <label className="field">Referral code <input name="code" required placeholder="your-code" /></label>
            <label className="field">SOL wallet address <input name="solWallet" required placeholder="Solana wallet address" /></label>
            <label className="field">Requested amount <input name="requestedAmount" required placeholder="Example: 0.5 SOL or $25 equivalent" /></label>
            <label className="field">Message <textarea name="message" placeholder="Optional notes for admin" /></label>
            <button className="button" type="submit">Submit request</button>
          </form>
          <p><Link href="/">Back to promo homepage</Link></p>
        </section>
      </div>
    </main>
  );
}
