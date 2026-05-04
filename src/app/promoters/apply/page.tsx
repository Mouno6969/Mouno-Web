import Link from "next/link";
import { promoterCriteria, promoterCriteriaAcknowledgement } from "@/lib/promoterCriteria";
import { applyPromoter } from "./actions";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;

  return (
    <main className="section">
      <div className="grid2">
        <section className="panel">
          <span className="badge">Twitter/X promoter application</span>
          <h1>Apply with your X profile.</h1>
          <p className="lede">Your Twitter/X account link becomes your public promoter identifier. Profiles with 1000+ followers are automatically marked verified in the product model.</p>
          <p className="notice">No X API key is configured in v1. Follower count is submitted for admin/manual review and can be updated by admin later.</p>
          <div className="criteriaMini">
            <h2>Before you apply</h2>
            <p>RefundYourSol Promo is unofficial. Do not impersonate the official RefundYourSOL account.</p>
            <ul className="criteriaList compact">
              {promoterCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
            </ul>
          </div>
        </section>
        <section className="panel">
          <h2>Promoter details</h2>
          {query.submitted ? <p className="message">Application submitted. Status: {query.verified === "1" ? "verified promoter" : "not verified yet"}.</p> : null}
          {query.exists ? <p className="message">That X profile already exists. Status: {query.verified === "1" ? "verified promoter" : "not verified yet"}.</p> : null}
          {query.error === "missing" ? <p className="message error">Display name, valid X profile URL/handle, follower count, and account age are required.</p> : null}
          {query.error === "criteria" ? <p className="message error">Confirm the promoter quality criteria before applying.</p> : null}
          <form className="form" action={applyPromoter}>
            <label className="field">Display name <input name="displayName" required placeholder="Your name or brand" /></label>
            <label className="field">Twitter/X profile URL or handle <input name="xProfileUrl" required placeholder="https://x.com/yourhandle or @yourhandle" /></label>
            <label className="field">Follower count <input name="followerCount" required inputMode="numeric" placeholder="Example: 1250" /></label>
            <label className="field">Account age / created year <input name="accountAge" required placeholder="Example: created 2021 or 3 years old" /></label>
            <label className="field">SOL wallet address <input name="solWallet" placeholder="Optional payout wallet" /></label>
            <label className="checkField"><input type="checkbox" name="criteriaAccepted" required /> <span>{promoterCriteriaAcknowledgement}</span></label>
            <button className="button" type="submit">Apply as promoter</button>
          </form>
          <p><Link href="/promoters/posts">Already applied? Submit a post.</Link></p>
        </section>
      </div>
    </main>
  );
}
