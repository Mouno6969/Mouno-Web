import Link from "next/link";
import { PromotionalPurposeNotice } from "@/components/PromotionalPurposeNotice";
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

type LeaderboardScope = "campaign" | "weekly" | "monthly" | "all";

const leaderboardScopes: { key: LeaderboardScope; label: string }[] = [
  { key: "campaign", label: "Current campaign" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all", label: "All-time" },
];

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function isLeaderboardScope(value: string): value is LeaderboardScope {
  return ["campaign", "weekly", "monthly", "all"].includes(value);
}

function leaderboardScopeLabel(scope: LeaderboardScope) {
  if (scope === "campaign") return "Current campaign leaderboard";
  if (scope === "weekly") return "Weekly leaderboard";
  if (scope === "monthly") return "Monthly leaderboard";
  return "All-time leaderboard";
}

function leaderboardDateRange(scope: LeaderboardScope, rewardPool: { campaignStartAt: Date | null; campaignEndAt: Date | null } | null) {
  if (scope === "all") return undefined;
  const now = new Date();
  if (scope === "weekly") return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  if (scope === "monthly") return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  if (!rewardPool?.campaignStartAt && !rewardPool?.campaignEndAt) return null;
  return {
    ...(rewardPool.campaignStartAt ? { gte: rewardPool.campaignStartAt } : {}),
    ...(rewardPool.campaignEndAt ? { lte: rewardPool.campaignEndAt } : {}),
  };
}

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [query, rewardPool] = await Promise.all([
    searchParams,
    prisma.rewardPool.findUnique({ where: { id: 1 } }),
  ]);
  const hasCampaignDates = Boolean(rewardPool?.campaignStartAt || rewardPool?.campaignEndAt);
  const requestedScope = queryValue(query.leaderboard);
  const selectedScope = isLeaderboardScope(requestedScope) ? requestedScope : hasCampaignDates ? "campaign" : "all";
  const dateRange = leaderboardDateRange(selectedScope, rewardPool);
  const verifiedPointGroups = dateRange === null
    ? []
    : await prisma.promoterPost.groupBy({
      by: ["promoterId"],
      where: { status: "VERIFIED", hasRequiredHashtag: true, ...(dateRange ? { createdAt: dateRange } : {}) },
      _sum: { points: true },
      _count: { _all: true },
    });
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
  const selectedScopeLabel = leaderboardScopeLabel(selectedScope);
  const leaderboardDescription = selectedScope === "campaign"
    ? campaignWindow
      ? `Verified posts submitted during ${campaignWindow}.`
      : "Current campaign dates are not configured yet. Use all-time for the full verified leaderboard."
    : selectedScope === "weekly"
      ? "Verified posts submitted in the last 7 days."
      : selectedScope === "monthly"
        ? "Verified posts submitted in the last 30 days."
        : "All admin-verified submitted posts.";

  return (
    <main className="homePage">
      <section className="promoHero visualHero" aria-labelledby="promo-title">
        <img className="visualHeroImage" src="/images/refundyoursol-hero-visual.png" alt="RefundYourSOL promotional portal mascot" />
        <div className="visualHeroHairWind" aria-hidden="true">
          <span className="hairWisp hairWispOne" />
          <span className="hairWisp hairWispTwo" />
          <span className="hairWisp hairWispThree" />
        </div>
        <div className="visualHeroLightSweep" aria-hidden="true" />
        <div className="visualHeroOverlay" />

        <div className="visualHeroContent">
          <span className="badge heroBadge">Promotional Community Portal</span>
          <h1 id="promo-title"><span>RefundYourSOL</span><span>Promo Portal</span></h1>
          <p className="lede heroCopy">
            Built only for community promotion. Apply as a promoter, submit <strong>#RefundYourSol</strong> or <strong>#RYS</strong> posts, and track admin-reviewed points. Official actions stay on Refundyoursol.com.
          </p>
          <div className="ctaRow heroActions">
            <a className="button glowButton" href={site.publicUrl} target="_blank" rel="noreferrer">Visit Official Website</a>
            <Link className="button dark" href="/promoters/apply">Apply as Promoter</Link>
            <Link className="ghostButton" href="/promoters/posts">Submit X Post</Link>
          </div>
        </div>

        <div className="heroSocialDock" aria-label="Project links">
          <a href={site.publicUrl} target="_blank" rel="noreferrer" aria-label="Official website">↗<span>Site</span></a>
          <Link href="/promoters/apply" aria-label="Community">◇<span>Join</span></Link>
          <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter/X">𝕏<span>X</span></a>
          <a href={socialLinks.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">✈<span>TG</span></a>
          <a href={socialLinks.discord} target="_blank" rel="noreferrer" aria-label="Discord">☊<span>DC</span></a>
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

      <PromotionalPurposeNotice className="homePurposeNotice" />

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

      <section id="leaderboard" className="section grid2 leaderboardPreview" aria-label="Promoter leaderboard preview">
        <div className="panel leaderboardPanel">
          <span className="badge">Promoter leaderboard</span>
          <h2>{selectedScopeLabel}</h2>
          <p>{leaderboardDescription}</p>
          <p className="notice">Only admin-verified posts with required hashtags count. Private payout details and admin notes are never shown here.</p>
          <div className="leaderboardTabs" aria-label="Leaderboard scope">
            {leaderboardScopes.map((scope) => (
              <Link className={`leaderboardTab ${scope.key === selectedScope ? "active" : ""}`} href={`/?leaderboard=${scope.key}#leaderboard`} key={scope.key}>
                {scope.label}
              </Link>
            ))}
          </div>
          <div className="ctaRow">
            <Link className="button dark" href="/status">Check status</Link>
            <Link className="ghostButton" href="/promoters/apply">Apply as promoter</Link>
            <Link className="ghostButton" href="/promoters/posts">Submit X post</Link>
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
                    <span>{row.submittedPosts.toLocaleString()} total submitted / {row.verifiedPosts.toLocaleString()} scoped verified</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyLeaderboard">
              <span className="status PENDING">Waiting for verified posts</span>
              <p>{dateRange === null ? "Current campaign dates are not configured yet." : "Leaderboard appears after admin verifies promoter points in this scope."}</p>
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
