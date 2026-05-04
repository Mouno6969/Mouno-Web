import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site, socialLinks } from "@/lib/constants";
import { pointRules } from "@/lib/twitter";

export default async function Home() {
  const rewardPool = await prisma.rewardPool.findUnique({ where: { id: 1 } });

  return (
    <main>
      <section className="hero">
        <div>
          <span className="badge">Unofficial Twitter/X promotional community portal</span>
          <h1>Earn Twitter/X promo points for RefundYourSOL.</h1>
          <p className="lede">
            {site.name} helps promoters apply with an X profile, submit posts containing <strong>#RefundYourSol</strong> or <strong>#RYS</strong>, and request admin-approved SOL payouts from verified Twitter/X activity.
          </p>
          <div className="ctaRow">
            <Link className="button" href="/promoters/apply">Apply as promoter</Link>
            <Link className="button purple" href="/promoters/posts">Submit X post</Link>
            <Link className="button dark" href="/withdraw">Request withdrawal</Link>
          </div>
          <div className="ctaRow">
            <a className="ghostButton" href={socialLinks.telegram} target="_blank" rel="noreferrer">Telegram</a>
            <a className="ghostButton" href={socialLinks.discord} target="_blank" rel="noreferrer">Discord</a>
            <a className="ghostButton" href={socialLinks.twitter} target="_blank" rel="noreferrer">Twitter/X</a>
          </div>
        </div>
        <aside className="heroCard">
          <span className="badge">{site.brandUrl}</span>
          <div className="metric">
            <span>Current reward pool</span>
            <strong>{rewardPool?.active && rewardPool.amount ? rewardPool.amount : "Not announced"}</strong>
            <p>{rewardPool?.active ? rewardPool.description || "Twitter/X rewards are active and reviewed by admin." : "The admin can activate or update the pool from the dashboard at any time."}</p>
          </div>
          <div className="metric">
            <span>Verified promoter threshold</span>
            <strong>&gt; 1000 followers</strong>
            <p>Follower counts are submitted by promoters/admins in this free first version and can be updated during review.</p>
          </div>
        </aside>
      </section>

      <section className="section grid3">
        <article className="card">
          <div className="cardNumber">1</div>
          <h3>Apply with X profile</h3>
          <p>Your Twitter/X account link becomes your promoter identifier. Accounts with more than 1000 followers are marked verified in the product model.</p>
        </article>
        <article className="card">
          <div className="cardNumber">2</div>
          <h3>Post with required hashtag</h3>
          <p>Submit Twitter/X post URLs. Eligible posts must contain <strong>#RefundYourSol</strong> or <strong>#RYS</strong> in pasted text or admin-verified evidence.</p>
        </article>
        <article className="card">
          <div className="cardNumber">3</div>
          <h3>Points become reviewed rewards</h3>
          <p>Admin-imported engagement counts calculate points automatically. Rewards and withdrawals remain manually approved.</p>
        </article>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Twitter/X point rules</h2>
          <div className="grid3">
            <div className="metric"><span>Like</span><strong>{pointRules.like}</strong><p>points each</p></div>
            <div className="metric"><span>Comment</span><strong>{pointRules.comment}</strong><p>point each, max two eligible comments per Twitter user per post</p></div>
            <div className="metric"><span>Repost</span><strong>{pointRules.repost}</strong><p>points each</p></div>
          </div>
        </div>
        <div className="panel">
          <h2>Free/manual verification scope</h2>
          <p className="notice">This version does not use an official X API key and does not claim real-time Twitter/X tracking. Activity is verified from submitted post URLs, pasted text/evidence, and admin/API-ready engagement updates.</p>
          <p>Do not submit private keys or seed phrases. Payouts use SOL wallet addresses only after admin approval.</p>
        </div>
      </section>
    </main>
  );
}
