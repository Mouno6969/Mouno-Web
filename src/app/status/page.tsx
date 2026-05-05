import Link from "next/link";
import { PromotionalPurposeNotice } from "@/components/PromotionalPurposeNotice";
import { prisma } from "@/lib/prisma";
import { cleanText, formatDate, maskWallet } from "@/lib/format";
import { displayHandle, findPromoterByXIdentifier } from "@/lib/twitter";

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function latestUpdatedAt(items: { updatedAt: Date }[]) {
  return items.reduce<Date | null>((latest, item) => (!latest || item.updatedAt > latest ? item.updatedAt : latest), null);
}

async function loadPromoterStatus(xIdentifier: string, solWallet: string) {
  if (!xIdentifier || !solWallet) return null;
  const resolved = await findPromoterByXIdentifier(xIdentifier);
  if (!resolved?.active) return null;
  const promoter = await prisma.promoter.findUnique({
    where: { id: resolved.id },
    include: {
      posts: { orderBy: { createdAt: "desc" } },
      withdrawalRequests: { orderBy: { createdAt: "desc" } },
    },
  });
  const walletMatches = promoter?.solWallet === solWallet || promoter?.withdrawalRequests.some((request) => request.solWallet === solWallet);
  return walletMatches ? promoter : null;
}

export default async function StatusPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const xIdentifier = cleanText(queryValue(query.xIdentifier), 180);
  const solWallet = cleanText(queryValue(query.solWallet), 120);
  const searched = Boolean(xIdentifier || solWallet);
  const [promoter, rewardPool] = await Promise.all([
    loadPromoterStatus(xIdentifier, solWallet),
    prisma.rewardPool.findUnique({ where: { id: 1 } }),
  ]);
  const rewardStatus = rewardPool?.active ? "Active" : "Inactive";
  const pointsToSolRate = rewardPool?.pointsToSolRate || "Inactive / not announced yet";
  const minimumWithdrawal = rewardPool?.minimumWithdrawal || "Inactive / not announced yet";
  const paymentCycle = rewardPool?.paymentCycle || "Manual / not active yet";

  const posts = promoter?.posts || [];
  const withdrawals = promoter?.withdrawalRequests || [];
  const recentPosts = posts.slice(0, 30);
  const recentWithdrawals = withdrawals.slice(0, 30);
  const totalVerifiedPoints = posts.filter((post) => post.status === "VERIFIED").reduce((sum, post) => sum + post.points, 0);
  const postCounts = {
    submitted: posts.length,
    pending: posts.filter((post) => post.status === "PENDING").length,
    verified: posts.filter((post) => post.status === "VERIFIED").length,
    rejected: posts.filter((post) => post.status === "REJECTED").length,
  };
  const lastAdminReviewDate = latestUpdatedAt([
    ...posts.filter((post) => post.status !== "PENDING"),
    ...withdrawals.filter((request) => request.status !== "PENDING"),
  ]);
  const lastPointsUpdate = latestUpdatedAt(
    posts.filter(
      (post) => post.points > 0 || post.likeCount > 0 || post.repostCount > 0 || post.eligibleCommentCount > 0 || post.totalCommentCount > 0,
    ),
  );

  return (
    <main className="section">
      <PromotionalPurposeNotice compact />
      <div className="grid2">
        <section className="panel">
          <span className="badge">Public promoter lookup</span>
          <h1>Check promoter status.</h1>
          <p className="lede">Enter your Twitter/X profile URL or handle plus a SOL wallet you used on your promoter profile or withdrawal request.</p>
          <p className="notice">This public page shows submitted posts, reviewed points, and withdrawal status without promoter login. It never shows internal admin notes.</p>
        </section>
        <section className="panel">
          <h2>Status lookup</h2>
          {searched && !promoter ? <p className="message error">No matching promoter status found.</p> : null}
          <form className="form" method="get" action="/status">
            <label className="field">Twitter/X profile URL or handle <input name="xIdentifier" required defaultValue={xIdentifier} placeholder="https://x.com/yourhandle or @yourhandle" /></label>
            <label className="field">SOL wallet address <input name="solWallet" required defaultValue={solWallet} placeholder="Wallet used on profile or withdrawal" /></label>
            <button className="button" type="submit">Check status</button>
          </form>
          <p><Link href="/promoters/posts">Submit a post</Link> · <Link href="/withdraw">Request withdrawal</Link></p>
        </section>
        <section className="panel">
          <span className="badge">Reward transparency</span>
          <h2>Reward terms</h2>
          <div className="grid2">
            <div className="metric"><span>Reward pool status</span><strong>{rewardStatus}</strong></div>
            <div className="metric"><span>Points → SOL rate</span><strong>{pointsToSolRate}</strong></div>
            <div className="metric"><span>Minimum withdrawal</span><strong>{minimumWithdrawal}</strong></div>
            <div className="metric"><span>Payment cycle</span><strong>{paymentCycle}</strong></div>
          </div>
          <p className="notice">Example fixed rate: 100 points = 0.05 SOL is an example only, not live terms, unless admins configure it and activate the unofficial reward pool.</p>
        </section>
      </div>

      {promoter ? (
        <>
          <section className="section">
            <div className="panel">
              <h2>{promoter.displayName} {displayHandle(promoter.xHandle)}</h2>
              <div className="grid3">
                <div className="metric"><span>Promoter status</span><strong>{promoter.active ? "Active" : "Inactive"}</strong><p>{promoter.verified ? "Verified" : "Not verified"}</p></div>
                <div className="metric"><span>Followers</span><strong>{promoter.followerCount.toLocaleString()}</strong><p>Submitted for review</p></div>
                <div className="metric"><span>Total verified points</span><strong>{totalVerifiedPoints}</strong><p>Admin-reviewed posts only</p></div>
                <div className="metric compactMetric"><span>Last admin review date</span><strong>{lastAdminReviewDate ? formatDate(lastAdminReviewDate) : "Not reviewed yet"}</strong><p>Based on reviewed posts or withdrawal requests in this app.</p></div>
                <div className="metric compactMetric"><span>Last points update</span><strong>{lastPointsUpdate ? formatDate(lastPointsUpdate) : "No points update yet"}</strong><p>Based on admin-updated points or engagement records, not live X tracking.</p></div>
              </div>
              <p>Created: {formatDate(promoter.createdAt)} · Updated: {formatDate(promoter.updatedAt)}</p>
            </div>
          </section>

          <section className="section">
            <div className="grid3">
              <div className="metric"><span>Submitted posts</span><strong>{postCounts.submitted}</strong></div>
              <div className="metric"><span>Pending posts</span><strong>{postCounts.pending}</strong></div>
              <div className="metric"><span>Verified / rejected</span><strong>{postCounts.verified}/{postCounts.rejected}</strong></div>
            </div>
          </section>

          <section className="section">
            <h2>Recent submitted posts</h2>
            <div className="tableWrap">
              <table>
                <thead><tr><th>Post URL</th><th>Status</th><th>Engagement</th><th>Points</th><th>Dates</th></tr></thead>
                <tbody>
                  {recentPosts.map((post) => (
                    <tr key={post.id}>
                      <td><a className="copyBox" href={post.postUrl} target="_blank" rel="noreferrer">{post.postUrl}</a></td>
                      <td><span className={`status ${post.status}`}>{post.status}</span><br /><span className={`status ${post.hasRequiredHashtag ? "APPROVED" : "PENDING"}`}>{post.hasRequiredHashtag ? "HASHTAG OK" : "HASHTAG REVIEW"}</span></td>
                      <td>{post.likeCount} likes<br />{post.eligibleCommentCount}/{post.totalCommentCount} eligible comments<br />{post.repostCount} reposts</td>
                      <td><strong>{post.status === "VERIFIED" ? post.points : 0}</strong><br /><small>{post.points} calculated</small></td>
                      <td>Submitted {formatDate(post.createdAt)}<br />Updated {formatDate(post.updatedAt)}</td>
                    </tr>
                  ))}
                  {recentPosts.length === 0 ? <tr><td colSpan={5}>No posts submitted yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <h2>Withdrawal requests</h2>
            <div className="tableWrap">
              <table>
                <thead><tr><th>Amount</th><th>Wallet</th><th>Status</th><th>Payout transaction</th><th>Dates</th></tr></thead>
                <tbody>
                  {recentWithdrawals.map((request) => (
                    <tr key={request.id}>
                      <td>{request.requestedAmount}</td>
                      <td className="copyBox">{maskWallet(request.solWallet)}</td>
                      <td><span className={`status ${request.status}`}>{request.status}</span></td>
                      <td className="copyBox">{request.payoutTxHash || "—"}</td>
                      <td>Submitted {formatDate(request.createdAt)}<br />Updated {formatDate(request.updatedAt)}</td>
                    </tr>
                  ))}
                  {recentWithdrawals.length === 0 ? <tr><td colSpan={5}>No withdrawal requests submitted yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
