import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, referralUrl } from "@/lib/format";
import { platformLabels } from "@/lib/constants";
import { createPromoter, logoutAdmin, setPromoterActive, updateClaim, updateRewardPool, updateWithdrawal } from "./actions";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdmin();
  const query = await searchParams;
  const [rewardPool, promoterCount, claimCount, pendingClaims, pendingWithdrawals, promoters, claims, withdrawals, clickGroups] = await Promise.all([
    prisma.rewardPool.findUnique({ where: { id: 1 } }),
    prisma.promoter.count(),
    prisma.referralClaim.count(),
    prisma.referralClaim.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.promoter.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { outboundClicks: true, referralClaims: true, withdrawalRequests: true } } } }),
    prisma.referralClaim.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { promoter: true } }),
    prisma.withdrawalRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { promoter: true } }),
    prisma.outboundClick.groupBy({ by: ["platform"], _count: { _all: true } }),
  ]);

  const clicks = {
    TELEGRAM: clickGroups.find((group) => group.platform === "TELEGRAM")?._count._all || 0,
    DISCORD: clickGroups.find((group) => group.platform === "DISCORD")?._count._all || 0,
    TWITTER: clickGroups.find((group) => group.platform === "TWITTER")?._count._all || 0,
  };
  const totalClicks = clicks.TELEGRAM + clicks.DISCORD + clicks.TWITTER;
  const clicksByCode = await prisma.outboundClick.groupBy({ by: ["code", "platform"], _count: { _all: true } });
  const clickSummary = (code: string) => {
    const parts = (["TELEGRAM", "DISCORD", "TWITTER"] as const).map((platform) => {
      const count = clicksByCode.find((row) => row.code === code && row.platform === platform)?._count._all || 0;
      return `${platformLabels[platform]}: ${count}`;
    });
    return parts.join(" · ");
  };

  return (
    <main>
      <div className="adminHeader">
        <div>
          <span className="badge">Signed in as {session.username}</span>
          <h1>Admin dashboard</h1>
          <p className="lede">Manage promoters, reward pool settings, pending claims, withdrawal reviews, and outbound click activity.</p>
        </div>
        <form action={logoutAdmin}><button className="ghostButton" type="submit">Logout</button></form>
      </div>

      {query.error === "promoter-name" ? <p className="message error">Promoter name is required.</p> : null}

      <section className="statGrid">
        <div className="stat"><span>Total promoters</span><strong>{promoterCount}</strong></div>
        <div className="stat"><span>Referral claims</span><strong>{claimCount}</strong></div>
        <div className="stat"><span>Outbound clicks</span><strong>{totalClicks}</strong></div>
        <div className="stat"><span>Pending reviews</span><strong>{pendingClaims + pendingWithdrawals}</strong></div>
        <div className="stat"><span>Reward pool</span><strong>{rewardPool?.active && rewardPool.amount ? rewardPool.amount : "Off"}</strong></div>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Reward pool</h2>
          <form className="form" action={updateRewardPool}>
            <label className="field">Display amount <input name="amount" defaultValue={rewardPool?.amount || ""} placeholder="Example: 50 SOL" /></label>
            <label className="field">Description <textarea name="description" defaultValue={rewardPool?.description || ""} placeholder="Campaign reward terms or status" /></label>
            <label className="field"><span><input type="checkbox" name="active" defaultChecked={Boolean(rewardPool?.active)} /> Active and visible on homepage</span></label>
            <button className="button" type="submit">Update reward pool</button>
          </form>
        </div>
        <div className="panel">
          <h2>Click overview</h2>
          <div className="grid3">
            <div className="metric"><span>Telegram</span><strong>{clicks.TELEGRAM}</strong></div>
            <div className="metric"><span>Discord</span><strong>{clicks.DISCORD}</strong></div>
            <div className="metric"><span>Twitter/X</span><strong>{clicks.TWITTER}</strong></div>
          </div>
        </div>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Create promoter</h2>
          <form className="form" action={createPromoter}>
            <div className="formRow">
              <label className="field">Name <input name="name" required placeholder="Promoter name" /></label>
              <label className="field">Handle <input name="handle" placeholder="@handle" /></label>
            </div>
            <div className="formRow">
              <label className="field">Custom code <input name="code" placeholder="optional-code" /></label>
              <label className="field">SOL wallet <input name="solWallet" placeholder="Optional wallet" /></label>
            </div>
            <button className="button" type="submit">Create promoter</button>
          </form>
        </div>
        <div className="panel">
          <h2>Current reward status</h2>
          <p>{rewardPool?.description || "No reward pool description configured."}</p>
          <p>Last updated: {rewardPool ? formatDate(rewardPool.updatedAt) : "Not seeded"}</p>
        </div>
      </section>

      <section className="section">
        <h2>Promoters</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Name</th><th>Code / URL</th><th>Wallet</th><th>Activity</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {promoters.map((promoter) => (
                <tr key={promoter.id}>
                  <td><strong>{promoter.name}</strong><br />{promoter.handle || "No handle"}<br /><small>{formatDate(promoter.createdAt)}</small></td>
                  <td><div className="copyBox">{promoter.code}</div><div className="copyBox">{referralUrl(promoter.code)}</div></td>
                  <td className="copyBox">{promoter.solWallet || "—"}</td>
                  <td>{promoter._count.outboundClicks} clicks<br />{promoter._count.referralClaims} claims<br />{promoter._count.withdrawalRequests} withdrawals</td>
                  <td><span className={`status ${promoter.active ? "APPROVED" : "REJECTED"}`}>{promoter.active ? "ACTIVE" : "INACTIVE"}</span></td>
                  <td>
                    <form action={setPromoterActive}>
                      <input type="hidden" name="id" value={promoter.id} />
                      <input type="hidden" name="active" value={promoter.active ? "false" : "true"} />
                      <button className="ghostButton" type="submit">{promoter.active ? "Deactivate" : "Activate"}</button>
                    </form>
                  </td>
                </tr>
              ))}
              {promoters.length === 0 ? <tr><td colSpan={6}>No promoters created yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Referral claims</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Claim</th><th>Wallet</th><th>Referral activity</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td><strong>{claim.displayName || "Anonymous"}</strong><br />{claim.contactHandle || "No contact"}<br />Code: {claim.code}<br /><small>{formatDate(claim.createdAt)}</small></td>
                  <td className="copyBox">{claim.solWallet}</td>
                  <td>{claim.promoter?.name || "Unknown promoter"}<br />{clickSummary(claim.code)}</td>
                  <td><span className={`status ${claim.status}`}>{claim.status}</span><br />{claim.approvedAmount || "No approved amount"}</td>
                  <td>
                    <form className="inlineForm" action={updateClaim}>
                      <input type="hidden" name="id" value={claim.id} />
                      <select name="status" defaultValue={claim.status}>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approve</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                      <input name="approvedAmount" placeholder="Approved amount" defaultValue={claim.approvedAmount || ""} />
                      <input name="adminNote" placeholder="Admin note" defaultValue={claim.adminNote || ""} />
                      <button className="ghostButton" type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {claims.length === 0 ? <tr><td colSpan={5}>No referral claims submitted yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Withdrawal requests</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Request</th><th>Wallet</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>
              {withdrawals.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.promoter?.name || "Unknown promoter"}</strong><br />Code: {request.code}<br />{request.message || "No message"}<br /><small>{formatDate(request.createdAt)}</small></td>
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
