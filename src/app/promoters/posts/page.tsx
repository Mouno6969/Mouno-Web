import Link from "next/link";
import { promoterQuality } from "@/lib/constants";
import { pointRules } from "@/lib/twitter";
import { submitPromoterPost } from "./actions";

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;

  return (
    <main className="section">
      <div className="grid2">
        <section className="panel">
          <span className="badge">Submit Twitter/X activity</span>
          <h1>Submit a post for points review.</h1>
          <p className="lede">Paste your X profile URL or handle, the post URL, and optional post text. Posts must include #RefundYourSol or #RYS to be eligible for points.</p>
          <p className="notice">Because there is no official X API key in this free first version, likes/comments/reposts are added by admin/manual sync before points are finalized. {promoterQuality.rejectionRisks}</p>
          <div className="grid3">
            <div className="metric"><span>Like</span><strong>{pointRules.like}</strong></div>
            <div className="metric"><span>Comment</span><strong>{pointRules.comment}</strong></div>
            <div className="metric"><span>Repost</span><strong>{pointRules.repost}</strong></div>
          </div>
        </section>
        <section className="panel">
          <h2>Post submission</h2>
          {query.submitted ? <p className="message">Post submitted. Hashtag status: {query.hashtag === "1" ? "required hashtag found" : "pending manual hashtag verification"}.</p> : null}
          {query.error === "missing" ? <p className="message error">X profile/handle and post URL are required.</p> : null}
          {query.error === "promoter" ? <p className="message error">Promoter not found or inactive. Apply first.</p> : null}
          {query.error === "duplicate" ? <p className="message error">That post URL has already been submitted.</p> : null}
          <form className="form" action={submitPromoterPost}>
            <label className="field">Twitter/X profile URL or handle <input name="xIdentifier" required placeholder="https://x.com/yourhandle or @yourhandle" /></label>
            <label className="field">Twitter/X post URL <input name="postUrl" required placeholder="https://x.com/yourhandle/status/123" /></label>
            <label className="field">Pasted post text or evidence <textarea name="postText" placeholder="Required: include #RefundYourSol or #RYS" /></label>
            <button className="button" type="submit">Submit post</button>
          </form>
          <p><Link href="/promoters/apply">Need to apply first?</Link></p>
        </section>
      </div>
    </main>
  );
}
