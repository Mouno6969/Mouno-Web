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
- Website-only AI Support with server-side provider fallback and admin-managed API keys

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
- AI Support is a read-only English-only website assistant for this RefundYourSOL Promo website. It answers from website knowledge only, cannot approve or modify anything, and must not use bot-specific or private project information.

## AI Support

The floating AI Support widget is available globally on public website pages. It is website-only support for RefundYourSOL Promo / Mouno-Web, answers only in English regardless of user language, and is not official RefundYourSOL platform support.

AI provider calls are server-side only. Provider keys can be added or updated from the protected `/admin` dashboard; saved database keys are preferred over environment keys. The admin UI shows only configured/not configured and masked previews, never full saved keys after saving. Environment keys remain optional fallback configuration for deployments or recovery.

Default provider fallback priority is:

```text
groq,nvidia_llama_8b,nvidia_kimi,nvidia_qwen_7b,nvidia_mistral_small,nvidia_nemotron_nano,nvidia_llama4_scout,openrouter,gemini,huggingface,cohere,mistral,nvidia_deepseek,nvidia_gemma
```

Groq is tried first, then NVIDIA Llama 3.1 8B, then NVIDIA Kimi K2.6, then the remaining supported providers. Every provider request has a 2-second timeout and empty model responses fall through to the next configured provider. At least one admin-saved or environment API key is required for AI Support to answer.

Safety boundaries:

- AI Support is read-only and cannot approve applications, verify posts, change points, approve withdrawals, make payouts, access admin notes, access secrets, or guarantee live X tracking.
- It should guide users to `/promoters/apply`, `/promoters/posts`, `/status`, `/withdraw`, `/admin/login` for admins, and the official site URL for official platform actions.
- It must not include or rely on bot-specific information, private project details, bKash automation, Telegram Stars, crypto-selling bot flows, private keys, or seed phrases.
- It may mention only public website social links when asked, including the public community link listed in this website.

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

# Optional server-side AI Support fallback configuration.
# Admin-saved provider keys from /admin are preferred over these env keys.
# At least one admin-saved or env API key is required for AI Support to answer.
WEBSITE_AI_PROVIDER_ORDER="groq,nvidia_llama_8b,nvidia_kimi,nvidia_qwen_7b,nvidia_mistral_small,nvidia_nemotron_nano,nvidia_llama4_scout,openrouter,gemini,huggingface,cohere,mistral,nvidia_deepseek,nvidia_gemma"
GROQ_API_KEY=""
GROQ_MODEL="llama-3.1-8b-instant"
NVIDIA_API_KEY=""
NVIDIA_LLAMA_8B_API_KEY=""
NVIDIA_LLAMA_8B_MODEL="meta/llama-3.1-8b-instruct"
NVIDIA_KIMI_API_KEY=""
NVIDIA_KIMI_MODEL="moonshotai/kimi-k2.6"
NVIDIA_QWEN_7B_API_KEY=""
NVIDIA_QWEN_7B_MODEL="qwen/qwen2-7b-instruct"
NVIDIA_MISTRAL_SMALL_API_KEY=""
NVIDIA_MISTRAL_SMALL_MODEL="mistralai/mistral-small-24b-instruct"
NVIDIA_NEMOTRON_NANO_API_KEY=""
NVIDIA_NEMOTRON_NANO_MODEL="nvidia/llama-3.1-nemotron-nano-8b-v1"
NVIDIA_LLAMA4_SCOUT_API_KEY=""
NVIDIA_LLAMA4_SCOUT_MODEL="meta/llama-4-scout-17b-16e-instruct"
NVIDIA_DEEPSEEK_API_KEY=""
NVIDIA_DEEPSEEK_MODEL="deepseek-ai/deepseek-v4-pro"
NVIDIA_GEMMA_API_KEY=""
NVIDIA_GEMMA_MODEL="google/gemma-4-31b-it"
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"
HUGGINGFACE_API_KEY=""
HF_TOKEN=""
HUGGINGFACE_MODEL="HuggingFaceH4/zephyr-7b-beta"
COHERE_API_KEY=""
COHERE_MODEL="command-r"
MISTRAL_API_KEY=""
MISTRAL_MODEL="mistral-small-latest"
```

Do not commit `.env`, production passwords, AI provider keys, private keys, seed phrases, or wallet secrets.

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
- AI provider keys saved in admin settings must remain server-side only and must not be included in public responses, CSV exports, logs, or client code.
