import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { promoterQuality } from "@/lib/constants";
import { displayHandle, pointRules } from "@/lib/twitter";
import { createPromoter, logoutAdmin, updatePost, updatePromoter, updateRewardPool, updateWithdrawal, upsertCommentEngagement } from "./actions";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdmin();
  const query = await searchParams;
  const [rewardPool, promoters, posts, withdrawals] = await Promise.all([
    prisma.rewardPool.findUnique({ where: { id: 1 } }),
    prisma.promoter.findMany({ orderBy: { createdAt: "desc" }, include: { posts: true, _count: { select: { posts: true, withdrawalRequests: true } } } }),
    prisma.promoterPost.findMany({ orderBy: { createdAt: "desc" }, take: 80, include: { promoter: true, commentEngagements: { orderBy: { updatedAt: "desc" }, take: 6 } } }),
    prisma.withdrawalRequest.findMany({ orderBy: { createdAt: "desc" }, take: 80, include: { promoter: true } }),
  ]);

  const verifiedPromoters = promoters.filter((promoter) => promoter.verified).length;
  const pendingPosts = posts.filter((post) => post.status === "PENDING").length;
  const pendingWithdrawals = withdrawals.filter((request) => request.status === "PENDING").length;
  const totalPoints = posts.filter((post) => post.status === "VERIFIED").reduce((sum, post) => sum + post.points, 0);
  const promoterPoints = (promoterId: number) => posts.filter((post) => post.promoterId === promoterId && post.status === "VERIFIED").reduce((sum, post) => sum + post.points, 0);

  return (
    <main>
      <div className="adminHeader">
        <div>
          <span className="badge">Signed in as {session.username}</span>
          <h1>Twitter/X promoter admin</h1>
          <p className="lede">Manage X promoter profiles, follower-based verification, submitted hashtag posts, manual/API-ready engagement counts, points, and withdrawals.</p>
        </div>
        <form action={logoutAdmin}><button className="ghostButton" type="submit">Logout</button></form>
      </div>

      {query.error === "promoter" ? <p className="message error">Promoter name and valid X profile are required.</p> : null}
      {query.error === "duplicate-promoter" ? <p className="message error">That X profile already exists.</p> : null}
      {query.error === "comment" ? <p className="message error">Post and commenter handle are required for comment import.</p> : null}

      <section className="statGrid">
        <div className="stat"><span>Total promoters</span><strong>{promoters.length}</strong></div>
        <div className="stat"><span>Verified promoters</span><strong>{verifiedPromoters}</strong></div>
        <div className="stat"><span>Submitted posts</span><strong>{posts.length}</strong></div>
        <div className="stat"><span>Total verified points</span><strong>{totalPoints}</strong></div>
        <div className="stat"><span>Pending reviews</span><strong>{pendingPosts + pendingWithdrawals}</strong></div>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Reward pool</h2>
          <form className="form" action={updateRewardPool}>
            <label className="field">Display amount <input name="amount" defaultValue={rewardPool?.amount || ""} placeholder="Example: 50 SOL" /></label>
            <label className="field">Description <textarea name="description" defaultValue={rewardPool?.description || ""} placeholder="Twitter/X reward terms or campaign status" /></label>
            <label className="field"><span><input type="checkbox" name="active" defaultChecked={Boolean(rewardPool?.active)} /> Active and visible on homepage</span></label>
            <button className="button" type="submit">Update reward pool</button>
          </form>
        </div>
        <div className="panel">
          <h2>Points policy</h2>
          <div className="grid3">
            <div className="metric"><span>Like</span><strong>{pointRules.like}</strong></div>
            <div className="metric"><span>Comment</span><strong>{pointRules.comment}</strong><p>max two eligible comments per Twitter user per post</p></div>
            <div className="metric"><span>Repost</span><strong>{pointRules.repost}</strong></div>
          </div>
          <p className="notice">No official X API key is configured. Counts are manually imported or ready for future authorized API sync.</p>
          <p className="notice">Manual review criteria: {promoterQuality.criteria.join(" ")}</p>
        </div>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Create promoter</h2>
          <form className="form" action={createPromoter}>
            <div className="formRow">
              <label className="field">Display name <input name="displayName" required placeholder="Promoter name" /></label>
              <label className="field">X profile URL/handle <input name="xProfileUrl" required placeholder="https://x.com/handle" /></label>
            </div>
            <div className="formRow">
              <label className="field">Follower count <input name="followerCount" required inputMode="numeric" placeholder="1000" /></label>
              <label className="field">SOL wallet <input name="solWallet" placeholder="Optional wallet" /></label>
            </div>
            <button className="button" type="submit">Create promoter</button>
          </form>
        </div>
        <div className="panel">
          <h2>Current reward status</h2>
          <p>{rewardPool?.active && rewardPool.amount ? `${rewardPool.amount}: ${rewardPool.description || "Active"}` : "Reward pool is not active."}</p>
          <p>Last updated: {rewardPool ? formatDate(rewardPool.updatedAt) : "Not seeded"}</p>
        </div>
      </section>

      <section className="section">
        <h2>Promoters</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Profile</th><th>Followers / status</th><th>Wallet</th><th>Activity</th><th>Update</th></tr></thead>
            <tbody>
              {promoters.map((promoter) => (
                <tr key={promoter.id}>
                  <td><strong>{promoter.displayName}</strong><br /><a className="copyBox" href={promoter.xProfileUrl} target="_blank" rel="noreferrer">{promoter.xProfileUrl}</a><br />{displayHandle(promoter.xHandle)}<br /><small>{formatDate(promoter.createdAt)}</small></td>
                  <td>{promoter.followerCount.toLocaleString()} followers<br /><span className={`status ${promoter.verified ? "APPROVED" : "PENDING"}`}>{promoter.verified ? "VERIFIED" : "UNVERIFIED"}</span><br /><span className={`status ${promoter.active ? "APPROVED" : "REJECTED"}`}>{promoter.active ? "ACTIVE" : "INACTIVE"}</span></td>
                  <td className="copyBox">{promoter.solWallet || "—"}</td>
                  <td>{promoter._count.posts} posts<br />{promoter._count.withdrawalRequests} withdrawals<br />{promoterPoints(promoter.id)} verified points</td>
                  <td>
                    <form className="form" action={updatePromoter}>
                      <input type="hidden" name="id" value={promoter.id} />
                      <input name="displayName" defaultValue={promoter.displayName} />
                      <input name="xProfileUrl" defaultValue={promoter.xProfileUrl} />
                      <input name="followerCount" defaultValue={promoter.followerCount} inputMode="numeric" />
                      <select name="verificationMode" defaultValue="auto">
                        <option value="auto">Auto by followers (1000+)</option>
                        <option value="verified">Force verified</option>
                        <option value="unverified">Force unverified</option>
                      </select>
                      <input name="solWallet" defaultValue={promoter.solWallet || ""} placeholder="SOL wallet" />
                      <label className="field"><span><input type="checkbox" name="active" defaultChecked={promoter.active} /> Active</span></label>
                      <button className="ghostButton" type="submit">Save promoter</button>
                    </form>
                  </td>
                </tr>
              ))}
              {promoters.length === 0 ? <tr><td colSpan={5}>No promoters created yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Submitted Twitter/X posts</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Post</th><th>Status</th><th>Engagement / points</th><th>Update counts</th><th>Comment importer</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.promoter.displayName}</strong> {displayHandle(post.promoter.xHandle)}<br /><a className="copyBox" href={post.postUrl} target="_blank" rel="noreferrer">{post.postUrl}</a><br /><small>{formatDate(post.createdAt)}</small><br />{post.postText ? <span>{post.postText}</span> : <span>No pasted text.</span>}</td>
                  <td><span className={`status ${post.status}`}>{post.status}</span><br /><span className={`status ${post.hasRequiredHashtag ? "APPROVED" : "PENDING"}`}>{post.hasRequiredHashtag ? "HASHTAG OK" : "NEEDS HASHTAG REVIEW"}</span><br />{post.adminNote || "No note"}</td>
                  <td>{post.likeCount} likes × {pointRules.like}<br />{post.eligibleCommentCount}/{post.totalCommentCount} eligible comments × {pointRules.comment}<br />{post.repostCount} reposts × {pointRules.repost}<br /><strong>{post.points} points</strong></td>
                  <td>
                    <form className="form" action={updatePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <select name="status" defaultValue={post.status}>
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <label className="field"><span><input type="checkbox" name="hasRequiredHashtag" defaultChecked={post.hasRequiredHashtag} /> Hashtag verified</span></label>
                      <input name="likeCount" defaultValue={post.likeCount} inputMode="numeric" placeholder="Likes" />
                      <input name="eligibleCommentCount" defaultValue={post.eligibleCommentCount} inputMode="numeric" placeholder="Eligible comments" />
                      <input name="totalCommentCount" defaultValue={post.totalCommentCount} inputMode="numeric" placeholder="Total comments" />
                      <input name="repostCount" defaultValue={post.repostCount} inputMode="numeric" placeholder="Reposts" />
                      <textarea name="postText" defaultValue={post.postText || ""} placeholder="Post text/evidence" />
                      <input name="adminNote" defaultValue={post.adminNote || ""} placeholder="Admin note" />
                      <button className="ghostButton" type="submit">Save post</button>
                    </form>
                  </td>
                  <td>
                    <form className="inlineForm" action={upsertCommentEngagement}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input name="commenterHandle" placeholder="@commenter" />
                      <input name="commentCount" placeholder="Comment count" inputMode="numeric" />
                      <button className="ghostButton" type="submit">Import</button>
                    </form>
                    <p>Eligible count is capped at 2 per commenter.</p>
                    {post.commentEngagements.length ? post.commentEngagements.map((comment) => <div className="copyBox" key={comment.id}>@{comment.commenterHandle}: {comment.eligibleCount}/{comment.commentCount}</div>) : <p>No commenter rows yet.</p>}
                  </td>
                </tr>
              ))}
              {posts.length === 0 ? <tr><td colSpan={5}>No posts submitted yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Withdrawal requests</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Promoter</th><th>Wallet</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>
              {withdrawals.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.promoter.displayName}</strong><br /><a className="copyBox" href={request.promoter.xProfileUrl} target="_blank" rel="noreferrer">{request.promoter.xProfileUrl}</a><br />{request.message || "No message"}<br /><small>{formatDate(request.createdAt)}</small></td>
                  <td className="copyBox">{request.solWallet}</td>
                  <td>{request.requestedAmount}</td>
                  <td><span className={`status ${request.status}`}>{request.status}</span></td>
                  <td>
                    <form className="inlineForm" action={updateWithdrawal}>
                      <input type="hidden" name="id" value={request.id} />
                      <select name="status" defaultValue={request.status}>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approve</option>
                        <option value="REJECTED">Reject</option>
                        <option value="PAID">Mark paid</option>
                      </select>
                      <input name="adminNote" placeholder="Admin note" defaultValue={request.adminNote || ""} />
                      <button className="ghostButton" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 ? <tr><td colSpan={5}>No withdrawal requests submitted yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
