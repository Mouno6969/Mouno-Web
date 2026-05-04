import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site, socialLinks } from "@/lib/constants";
import { pointRules } from "@/lib/twitter";

export default async function Home() {
  const rewardPool = await prisma.rewardPool.findUnique({ where: { id: 1 } });
  const poolLabel = rewardPool?.active && rewardPool.amount ? rewardPool.amount : "Awaiting admin update";
  const poolDescription = rewardPool?.active
    ? rewardPool.description || "Active promoter rewards are reviewed by admin before payout."
    : "The reward pool can be activated or adjusted from the admin dashboard when a campaign is ready.";

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
          <h1 id="promo-title"><span className="headlinePlain">Promote RefundYourSOL</span><span>Earn reviewed rewards</span></h1>
          <p className="lede heroCopy">
            Apply with your X profile, submit posts containing <strong>#RefundYourSol</strong> or <strong>#RYS</strong>, and earn points from reviewed engagement evidence.
          </p>
          <div className="ctaRow heroActions">
            <Link className="button glowButton" href="/promoters/apply">Apply as promoter</Link>
            <Link className="button dark" href="/promoters/posts">Submit X post</Link>
            <Link className="ghostButton" href="/withdraw">Request withdrawal</Link>
          </div>
        </div>

        <aside className="promoAdCard" aria-label="Current promoter reward pool">
          <div>
            <span>Promoter pool</span>
            <strong>{poolLabel}</strong>
            <p>{poolDescription}</p>
          </div>
          <Link href="/promoters/posts">Submit evidence</Link>
        </aside>
      </section>

      <section className="homeStats" aria-label="Program facts">
        <article>
          <span>Verified threshold</span>
          <strong>&gt; 1000</strong>
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
          <p>Use the public forms to join, submit eligible X post URLs, and request withdrawal after admin approval.</p>
        </div>
        <div className="bannerActions">
          <Link className="button purple" href="/promoters/apply">Start application</Link>
          <Link className="button dark" href="/promoters/posts">Add post</Link>
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
          <p className="notice">Eligible posts must include <strong>#RefundYourSol</strong> or <strong>#RYS</strong>. Rewards and withdrawals remain subject to admin approval.</p>
        </div>
      </section>
    </main>
  );
}
