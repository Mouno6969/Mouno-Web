import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { submitReferralClaim } from "./actions";

export default async function ReferralPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { code } = await params;
  const query = await searchParams;
  const promoter = await prisma.promoter.findUnique({ where: { code } });

  if (!promoter || !promoter.active) {
    return (
      <main className="section">
        <div className="panel">
          <span className="badge">Invalid referral</span>
          <h1>Referral code not found.</h1>
          <p className="lede">This promoter link is inactive or does not exist. You can still visit the RefundYourSOL promo homepage.</p>
          <Link className="button" href="/">Back home</Link>
        </div>
      </main>
    );
  }

  const claimAction = submitReferralClaim.bind(null, promoter.code);

  return (
    <main>
      <section className="hero">
        <div>
          <span className="badge">Referral code: {promoter.code}</span>
          <h1>Join through {promoter.name}&apos;s promo page.</h1>
          <p className="lede">Choose a community destination below. Outbound clicks are tracked for this referral code and reviewed by the admin for reward decisions.</p>
          <div className="ctaRow">
            <a className="button" href={`/go/telegram?code=${encodeURIComponent(promoter.code)}`}>Telegram</a>
            <a className="button purple" href={`/go/discord?code=${encodeURIComponent(promoter.code)}`}>Discord</a>
            <a className="button dark" href={`/go/twitter?code=${encodeURIComponent(promoter.code)}`}>Twitter/X</a>
          </div>
        </div>
        <aside className="heroCard">
          <span className="badge">Promoter</span>
          <div className="metric">
            <span>Name / handle</span>
            <strong>{promoter.name}</strong>
            <p>{promoter.handle || "No public handle provided."}</p>
          </div>
          <p className="notice">Rewards are not automatic. Submitting a claim only creates a pending record for admin review.</p>
        </aside>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Submit optional participation claim</h2>
          {query.submitted ? <p className="message">Claim submitted for manual admin review.</p> : null}
          {query.error === "wallet" ? <p className="message error">SOL wallet address is required.</p> : null}
          <form className="form" action={claimAction}>
            <label className="field">Display name <input name="displayName" placeholder="Your name or alias" /></label>
            <label className="field">Contact handle <input name="contactHandle" placeholder="Telegram, X, or Discord handle" /></label>
            <label className="field">SOL wallet address <input name="solWallet" required placeholder="Solana wallet for any approved payout" /></label>
            <button className="button" type="submit">Submit claim</button>
          </form>
        </div>
        <div className="panel">
          <h2>How tracking works</h2>
          <p>Each social button click records the referral code, destination platform, timestamp, and limited technical metadata for abuse prevention.</p>
          <p>No balances are exposed publicly. Admins approve or reject rewards and withdrawals manually.</p>
          <Link className="ghostButton" href="/withdraw">Promoter withdrawal request</Link>
        </div>
      </section>
    </main>
  );
}
