import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site, socialLinks } from "@/lib/constants";

export default async function Home() {
  const rewardPool = await prisma.rewardPool.findUnique({ where: { id: 1 } });

  return (
    <main>
      <section className="hero">
        <div>
          <span className="badge">Unofficial promotional community portal</span>
          <h1>Promote RefundYourSOL. Track referrals. Request SOL payouts.</h1>
          <p className="lede">
            {site.name} helps community promoters share RefundYourSOL social destinations through referral pages while admins review clicks, claims, rewards, and withdrawal requests manually.
          </p>
          <div className="ctaRow">
            <a className="button" href={socialLinks.telegram} target="_blank" rel="noreferrer">Join Telegram</a>
            <a className="button purple" href={socialLinks.discord} target="_blank" rel="noreferrer">Join Discord</a>
            <a className="button dark" href={socialLinks.twitter} target="_blank" rel="noreferrer">Follow Twitter/X</a>
          </div>
        </div>
        <aside className="heroCard">
          <span className="badge">{site.brandUrl}</span>
          <div className="metric">
            <span>Current reward pool</span>
            <strong>{rewardPool?.active && rewardPool.amount ? rewardPool.amount : "Not announced"}</strong>
            <p>{rewardPool?.active ? rewardPool.description || "Rewards are active and reviewed by admin." : "The admin can activate or update the pool from the dashboard at any time."}</p>
          </div>
          <div className="metric">
            <span>Admin contact identifier</span>
            <strong>@Hazrod_m</strong>
            <p>Promoter login is not required in v1. Use your referral code and SOL wallet for public claim or withdrawal requests.</p>
          </div>
        </aside>
      </section>

      <section className="section grid3">
        <article className="card">
          <div className="cardNumber">1</div>
          <h3>Referral pages</h3>
          <p>Admins create promoter profiles with unique referral URLs like <strong>/r/code</strong>. Promoters share those pages across their community channels.</p>
        </article>
        <article className="card">
          <div className="cardNumber">2</div>
          <h3>Outbound click tracking</h3>
          <p>Telegram, Discord, and Twitter/X CTA clicks from referral pages are recorded by platform and referral code for admin review.</p>
        </article>
        <article className="card">
          <div className="cardNumber">3</div>
          <h3>Admin-approved rewards</h3>
          <p>Visitors and promoters can submit claims or withdrawal requests with SOL wallet addresses. Payouts are never automatic.</p>
        </article>
      </section>

      <section className="section grid2">
        <div className="panel">
          <h2>Built for community growth</h2>
          <p>Use the promoted social links to route traffic toward RefundYourSOL communities, then review participation and activity in one lightweight admin dashboard.</p>
          <div className="ctaRow">
            <Link className="button" href="/withdraw">Request a withdrawal</Link>
            <Link className="ghostButton" href="/admin/login">Admin login</Link>
          </div>
        </div>
        <div className="panel">
          <h2>Trust and safety</h2>
          <p className="notice">This is an unofficial promotional community site. It does not verify social joins automatically, does not guarantee rewards, and does not request private keys or seed phrases.</p>
          <p>Rewards are subject to admin approval, fraud checks, campaign budget, and the configured reward pool status.</p>
        </div>
      </section>
    </main>
  );
}
