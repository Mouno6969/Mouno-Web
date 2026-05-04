import Link from "next/link";
import { applyPromoter } from "./actions";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;

  return (
    <main className="section">
      <div className="grid2">
        <section className="panel">
          <span className="badge">Twitter/X promoter application</span>
          <h1>Apply with your X profile.</h1>
          <p className="lede">Your Twitter/X account link becomes your public promoter identifier. Profiles with more than 1000 followers are automatically marked verified in the product model.</p>
          <p className="notice">No X API key is configured in v1. Follower count is submitted for admin/manual review and can be updated by admin later.</p>
        </section>
        <section className="panel">
          <h2>Promoter details</h2>
          {query.submitted ? <p className="message">Application submitted. Status: {query.verified === "1" ? "verified promoter" : "not verified yet"}.</p> : null}
          {query.exists ? <p className="message">That X profile already exists. Status: {query.verified === "1" ? "verified promoter" : "not verified yet"}.</p> : null}
          {query.error === "missing" ? <p className="message error">Display name, valid X profile URL/handle, and follower count are required.</p> : null}
          <form className="form" action={applyPromoter}>
            <label className="field">Display name <input name="displayName" required placeholder="Your name or brand" /></label>
            <label className="field">Twitter/X profile URL or handle <input name="xProfileUrl" required placeholder="https://x.com/yourhandle or @yourhandle" /></label>
            <label className="field">Follower count <input name="followerCount" required inputMode="numeric" placeholder="Example: 1250" /></label>
            <label className="field">SOL wallet address <input name="solWallet" placeholder="Optional payout wallet" /></label>
            <button className="button" type="submit">Apply as promoter</button>
          </form>
          <p><Link href="/promoters/posts">Already applied? Submit a post.</Link></p>
        </section>
      </div>
    </main>
  );
}
