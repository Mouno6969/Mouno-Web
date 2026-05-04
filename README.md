# RefundYourSol Promo

Unofficial promotional community portal for RefundYourSOL at `Refundyoursol.com`.

This v1 site is positioned around a sharper public flow: promote RefundYourSOL on X, submit hashtag posts, and earn reviewed SOL rewards through an unofficial community portal. Promoters apply with their X profile, submit RefundYourSOL hashtag posts, admins manually/API-ready-sync engagement counts, points are calculated automatically, and SOL withdrawals are manually reviewed.

## Stack

- Next.js App Router + TypeScript
- Prisma ORM + SQLite for lightweight first deployment
- Server Actions for public/admin forms
- Signed httpOnly cookie admin session
- No promoter authentication in v1
- Public status lookup by X handle/profile plus SOL wallet
- No official X API key required for the first version

## Social links promoted

These are general community links, not referral-code links:

- Telegram: `https://t.me/refundyoursolbot?start=ref_8704145840`
- Discord: `https://discord.gg/VJ6tqnhrdu`
- Twitter/X: `https://x.com/RefundYourSOL`

## Product behavior

- Promoter codes are not used.
- Promoters are identified by Twitter/X profile URL or handle.
- A promoter is marked verified automatically when `followerCount >= 1000`, then remains subject to admin/manual quality review.
- Promoter quality criteria: minimum 1000+ followers; established Twitter/X account required or reviewed, with new/unclear accounts rejectable; Crypto/Solana-related audience preferred; no bot/fake engagement; posts must use `#RefundYourSol` or `#RYS`; promoters must not impersonate the official RefundYourSOL account.
- Promoters submit Twitter/X post URLs and optional pasted post text/evidence.
- Eligible posts must contain `#RefundYourSol` or `#RYS`, case-insensitively. If no text/evidence is submitted, the post stays pending for manual admin review.
- Points are calculated as:
  - Like = 2 points
  - Comment = 1 point
  - Repost = 3 points
  - At most two comments from the same Twitter/X user count per post.
- Rewards and withdrawals are manually approved by admin and paid outside the app.
- Reward transparency is managed from the website admin dashboard, including active/inactive status, points-to-SOL conversion rate, minimum withdrawal, and payment cycle. Nullable fields stay inactive-safe until configured.
- Admins can show fixed-rate examples such as `100 points = 0.05 SOL`, but examples are not live reward terms unless saved as configured terms and the reward pool is activated.
- Promoters can check `/status` with their X handle/profile plus a SOL wallet from their profile or withdrawal request. Failed lookup responses are generic and do not reveal whether a handle exists.
- Admins can export promoter, post, and withdrawal CSVs from protected `/admin/export/...` endpoints.
- Withdrawal records can store a payout transaction hash for internal tracking and public proof of payment on matched status lookups.
- Reward pools can include nullable campaign start/end dates plus nullable reward transparency terms displayed on the homepage and status page when present.
- Admin notes are internal-only: they are visible/editable in the admin dashboard and admin CSV exports, but are not exposed on the public status page.

## Free/manual X verification limitation

This app does **not** claim real-time or guaranteed Twitter/X tracking in production because no official X API key is configured. The first version is API-ready/manual-review:

- Public users submit profile URLs, post URLs, and optional pasted post text/evidence.
- Admins verify hashtag status from submitted evidence or manual checks.
- Admins import/update like, repost, and comment counts.
- The app enforces the two-eligible-comments-per-commenter rule when admin imports commenter rows.
- Once engagement data exists, points recalculate automatically.

A future authorized X API integration can populate the same `PromoterPost` and `PostCommentEngagement` models without changing the public flow. If an official X API bearer token becomes available later, add it as a new environment variable and implement server-side sync jobs against the existing schema.

## Data model

Prisma models are defined in `prisma/schema.prisma`.

- `Promoter`: display name, unique X profile URL, optional handle, follower count, automatic/manual verified flag, optional SOL wallet, active flag.
- `RewardPool`: singleton record (`id = 1`) with display amount, description, active flag, optional points-to-SOL conversion rate, optional minimum withdrawal, optional payment cycle, optional campaign start/end dates, and update timestamp.
- `PromoterPost`: submitted X post URL, optional text/evidence, hashtag status, review status (`PENDING`, `VERIFIED`, `REJECTED`), engagement counts, calculated points, admin note.
- `PostCommentEngagement`: per-post commenter handle and comment count. `eligibleCount` is capped at `min(commentCount, 2)`.
- `WithdrawalRequest`: promoter-linked SOL wallet request with amount, message, status (`PENDING`, `APPROVED`, `REJECTED`, `PAID`), optional payout transaction hash, and internal admin note.

Admin credentials are not stored in the database. The v1 admin username defaults to `@Hazrod_m`, and the password is read from `ADMIN_PASSWORD`.

## Environment variables

Copy `.env.example` to `.env` locally or create these variables on the VPS:

```bash
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="@Hazrod_m"
ADMIN_PASSWORD="replace-with-a-long-random-password"
ADMIN_SESSION_SECRET="replace-with-at-least-32-random-characters"
NEXT_PUBLIC_SITE_URL="https://refundyoursol.com"
# Optional future authorized X API integration; not used by v1 manual-sync flow.
X_API_BEARER_TOKEN=""
```

Do not commit `.env`, production passwords, private keys, seed phrases, or wallet secrets.

## Local development

```bash
npm install
cp .env.example .env
# edit ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

Admin login:

- URL: `/admin/login`
- Username: `@Hazrod_m` unless `ADMIN_USERNAME` is changed
- Password: value of `ADMIN_PASSWORD`

Public flows:

- Apply as promoter: `/promoters/apply`
- Submit Twitter/X post: `/promoters/posts`
- Request withdrawal: `/withdraw`
- Check public promoter status: `/status`

## Production build

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run build
npm run start
```

For SQLite on a VPS, keep the database file on persistent disk and back it up regularly. The default `DATABASE_URL="file:./dev.db"` stores `dev.db` under the Prisma directory at runtime.

## Oracle VPS deployment outline

High-level Oracle Ubuntu VPS flow from Termux/Android SSH:

```bash
# Termux local device
pkg update
pkg install openssh git
ssh ubuntu@YOUR_ORACLE_VPS_IP
```

On the Oracle VPS:

```bash
sudo apt update
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Clone and configure:

```bash
git clone https://github.com/Mouno6969/Mouno-Web.git
cd Mouno-Web
npm install
cp .env.example .env
nano .env
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run build
pm2 start npm --name refundyoursol-promo -- start
pm2 save
pm2 startup
```

Example Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name refundyoursol.com www.refundyoursol.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/refundyoursol.com /etc/nginx/sites-enabled/refundyoursol.com
sudo nginx -t
sudo systemctl reload nginx
```

Add HTTPS with Certbot after DNS points to the VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d refundyoursol.com -d www.refundyoursol.com
```

## Operational notes

- The site must always be described as an unofficial promotional community portal, not an official RefundYourSOL website.
- No unauthorized scraping or guaranteed real-time X tracking is implemented.
- Rewards, points eligibility, and withdrawals are manually reviewed by the admin.
- Admin manual review should apply the promoter quality criteria: 1000+ followers, established/non-impersonating account, preferably Crypto/Solana audience, no bot/fake engagement, and required hashtags on submitted posts.
- Promoters do not log in. They use their Twitter/X profile URL or handle for post submissions, withdrawals, and public `/status` lookup with a SOL wallet factor.
- Admin notes must remain internal-only and should not be rendered on public pages.
- Never ask users for private keys or seed phrases.
