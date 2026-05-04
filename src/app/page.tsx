import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { promoterQuality, site, socialLinks } from "@/lib/constants";
import { displayHandle, pointRules } from "@/lib/twitter";
import { formatDate } from "@/lib/format";

type LeaderboardRow = {
  promoterId: number;
  displayName: string;
  xHandle: string;
  points: number;
  submittedPosts: number;
  verifiedPosts: number;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [rewardPool, verifiedPointGroups] = await Promise.all([
    prisma.rewardPool.findUnique({ where: { id: 1 } }),
    prisma.promoterPost.groupBy({
      by: ["promoterId"],
      where: { status: "VERIFIED" },
      _sum: { points: true },
      _count: { _all: true },
    }),
  ]);
  const promoterIds = verifiedPointGroups.map((group) => group.promoterId);
  const [leaderboardPromoters, submittedPostGroups] = promoterIds.length
    ? await Promise.all([
        prisma.promoter.findMany({
          where: { id: { in: promoterIds } },
          select: { id: true, displayName: true, xHandle: true },
        }),
        prisma.promoterPost.groupBy({
          by: ["promoterId"],
          where: { promoterId: { in: promoterIds } },
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const promotersById = new Map(leaderboardPromoters.map((promoter) => [promoter.id, promoter]));
  const submittedPostsByPromoter = new Map(submittedPostGroups.map((group) => [group.promoterId, group._count._all]));
  const leaderboardRows = verifiedPointGroups
    .map((group): LeaderboardRow | null => {
      const promoter = promotersById.get(group.promoterId);
      const points = group._sum.points || 0;
      if (!promoter || points <= 0) return null;
      return {
        promoterId: group.promoterId,
        displayName: promoter.displayName,
        xHandle: displayHandle(promoter.xHandle),
        points,
        submittedPosts: submittedPostsByPromoter.get(group.promoterId) || group._count._all,
        verifiedPosts: group._count._all,
      };
    })
    .filter((row): row is LeaderboardRow => Boolean(row))
    .sort((a, b) => b.points - a.points || b.verifiedPosts - a.verifiedPosts || a.displayName.localeCompare(b.displayName))
    .slice(0, 5);
  const rewardStatus = rewardPool?.active ? "Active" : "Inactive";
  const poolLabel = rewardPool?.active && rewardPool.amount ? rewardPool.amount : "Inactive";
  const poolDescription = rewardPool?.active
    ? rewardPool.description || "Active promoter rewards are unofficial and reviewed by admin before payout."
    : "The reward pool is inactive until admins announce unofficial campaign terms.";
  const pointsToSolRate = rewardPool?.pointsToSolRate || "Inactive / not announced yet";
  const minimumWithdrawal = rewardPool?.minimumWithdrawal || "Inactive / not announced yet";
  const paymentCycle = rewardPool?.paymentCycle || "Manual / not active yet";
  const campaignWindow = rewardPool?.campaignStartAt || rewardPool?.campaignEndAt
    ? `${rewardPool.campaignStartAt ? formatDate(rewardPool.campaignStartAt) : "Open start"} → ${rewardPool.campaignEndAt ? formatDate(rewardPool.campaignEndAt) : "Open end"}`
    : "";

  return (
    <main className="homePage">
      <section className="promoHero" aria-labelledby="promo-title">
        <div className="heroSocialDock" aria-label="Project links">
          <a href={site.publicUrl} target="_blank" rel="noreferrer" aria-label="Website">↗<span>Site</span></a>
          <Link href="/promoters/apply" aria-label="Community">◇<span>Join</span></Link>
          <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter/X">𝕏<span>X</span></a>
          <a href={socialLinks.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">✈<span>TG</span></a>
          <a href={socialLinks.discord} target="_blank" rel="noreferrer" aria-label="Discord">☊<span>DC</span></a>
        </div>

        <div className="heroCenter">
          <span className="badge heroBadge">Unofficial Twitter/X promoter rewards</span>
          <div className="orbWrap" aria-hidden="true">
            <div className="promoOrb">
              <span className="orbRing one" />
              <span className="orbRing two" />
              <span className="orbCore">+pts</span>
            </div>
          </div>
          <h1 id="promo-title"><span className="headlinePlain">Promote RefundYourSOL on X.</span><span>Submit hashtag posts.</span></h1>
          <p className="lede heroCopy">
            Submit posts containing <strong>#RefundYourSol</strong> or <strong>#RYS</strong> for admin-reviewed points. SOL reward terms are inactive until admins announce a pool.
          </p>
          <div className="ctaRow heroActions">
            <Link className="button glowButton" href="/promoters/apply">Apply as promoter</Link>
            <Link className="button dark" href="/promoters/posts">Submit X post</Link>
            <Link className="ghostButton" href="/status">Check status</Link>
          </div>
        </div>

        <aside className="promoAdCard" aria-label="Current promoter reward pool">
          <div>
            <span>Promoter pool</span>
            <strong>{poolLabel}</strong>
            <p>{poolDescription}</p>
            {campaignWindow ? <p>Campaign: {campaignWindow}</p> : null}
          </div>
          <Link href="/status">Check status</Link>
        </aside>
      </section>

      <section className="homeStats" aria-label="Program facts">
        <article>
          <span>Verified threshold</span>
          <strong>{promoterQuality.minimumFollowersLabel}</strong>
          <p>followers submitted for review</p>
        </article>
        <article>
          <span>Point rules active</span>
          <strong>{pointRules.like}/{pointRules.comment}/{pointRules.repost}</strong>
          <p>like, comment, repost values</p>
        </article>
        <article>
          <span>Review mode</span>
          <strong>Manual</strong>
          <p>admin-approved rewards and payouts</p>
        </article>
      </section>

      <section className="rewardBanner">
        <div>
          <span>Twitter/X promoter rewards</span>
          <h2>Turn campaign posts into reviewed point totals.</h2>
          <p>Use the public forms to join, submit eligible X post URLs, and check public status. Withdrawal requests are promoter-only and only meaningful when admin-reviewed reward terms are active.</p>
        </div>
        <div className="bannerActions">
          <Link className="button purple" href="/promoters/apply">Start application</Link>
          <Link className="button dark" href="/promoters/posts">Add post</Link>
          <Link className="ghostButton" href="/status">Check status</Link>
        </div>
      </section>

      <section className="section grid2 leaderboardPreview" aria-label="Promoter leaderboard preview">
        <div className="panel leaderboardPanel">
          <span className="badge">Promoter leaderboard</span>
          <h2>Top verified point earners.</h2>
          <p>Rankings are based only on admin-verified submitted posts. Private payout details and admin notes are never shown here.</p>
          <div className="ctaRow">
            <Link className="button dark" href="/status">Check status</Link>
            <Link className="ghostButton" href="/promoters/apply">Apply as promoter</Link>
          </div>
        </div>
        <div className="panel leaderboardPanel compactPanel">
          {leaderboardRows.length ? (
            <div className="leaderboardRows">
              {leaderboardRows.map((row, index) => (
                <div className="leaderboardRow" key={row.promoterId}>
                  <strong className="leaderboardRank">#{index + 1}</strong>
                  <div className="leaderboardIdentity">
                    <b>{row.displayName}</b>
                    <span>{row.xHandle}</span>
                  </div>
                  <div className="leaderboardPoints">
                    <strong>{row.points.toLocaleString()} pts</strong>
                    <span>{row.submittedPosts.toLocaleString()} submitted / {row.verifiedPosts.toLocaleString()} verified</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyLeaderboard">
              <span className="status PENDING">Waiting for verified posts</span>
              <p>Leaderboard appears after admin verifies promoter points.</p>
            </div>
          )}
        </div>
      </section>

      <section className="learnCue" aria-label="Learn more">
        <span>Learn More</span>
        <b>⌄</b>
      </section>

      <section className="section grid2 infoSection">
        <div className="panel didYouKnow">
          <span className="badge">Did you know?</span>
          <h2>Free v1 uses reviewed submissions, not live X tracking.</h2>
          <p>
            There is no official X API key connected in this version, so the app does not claim automatic real-time tracking. Promoter activity is reviewed from submitted post URLs, pasted hashtag text, supporting evidence, and admin/API-ready engagement updates.
          </p>
        </div>
        <div className="panel rulesPanel">
          <h2>Point rules</h2>
          <div className="ruleList">
            <div><span>Like</span><strong>{pointRules.like} pts</strong></div>
            <div><span>Comment</span><strong>{pointRules.comment} pt</strong></div>
            <div><span>Repost</span><strong>{pointRules.repost} pts</strong></div>
            <div><span>Comment cap</span><strong>{pointRules.maxEligibleCommentsPerUser} per user/post</strong></div>
          </div>
          <p className="notice">Eligible posts must include <strong>#RefundYourSol</strong> or <strong>#RYS</strong>. Promoters need {promoterQuality.minimumFollowersLabel} followers, an established account, preferably a Crypto/Solana audience, no fake engagement, and must not impersonate the official RefundYourSOL account. Rewards and withdrawals remain subject to admin approval.</p>
        </div>
        <div className="panel">
          <span className="badge">Reward transparency</span>
          <h2>{rewardPool?.active ? "Unofficial reward terms are admin-reviewed." : "Unofficial reward terms are currently inactive."}</h2>
          <div className="grid2">
            <div className="metric"><span>Reward pool status</span><strong>{rewardStatus}</strong><p>{rewardPool?.amount || "No pool amount announced"}</p></div>
            <div className="metric"><span>Points → SOL conversion rate</span><strong>{pointsToSolRate}</strong></div>
            <div className="metric"><span>Minimum withdrawal</span><strong>{minimumWithdrawal}</strong></div>
            <div className="metric"><span>Payment cycle</span><strong>{paymentCycle}</strong></div>
          </div>
          <p className="notice">Example fixed rate: 100 points = 0.05 SOL. This is an example only, not live terms, unless admins save it as the configured conversion rate and activate the reward pool.</p>
        </div>
      </section>
    </main>
  );
}
