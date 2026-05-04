# RefundYourSol Promo

Unofficial promotional community portal for RefundYourSOL at `Refundyoursol.com`.

This v1 site promotes the public Telegram, Discord, and Twitter/X links, lets admins create promoter referral URLs, tracks outbound CTA clicks by referral code, accepts public claim submissions, and supports admin-reviewed SOL withdrawal requests.

## Stack

- Next.js App Router + TypeScript
- Prisma ORM + SQLite for a lightweight first VPS deployment
- Server Actions for forms
- Signed httpOnly cookie admin session
- No promoter authentication in v1

## Social links promoted

- Telegram: `https://t.me/refundyoursolbot?start=ref_8704145840`
- Discord: `https://discord.gg/VJ6tqnhrdu`
- Twitter/X: `https://x.com/RefundYourSOL`

## Data model

Prisma models are defined in `prisma/schema.prisma`.

- `Promoter`: name, optional handle, unique referral code, optional SOL wallet, active flag.
- `RewardPool`: singleton record (`id = 1`) with display amount, description, active flag, and update timestamp.
- `OutboundClick`: referral code, optional promoter relation, platform enum (`TELEGRAM`, `DISCORD`, `TWITTER`), hashed/truncated IP metadata, user agent, timestamp.
- `ReferralClaim`: public claim tied to referral code/promoter, display/contact info, SOL wallet, status (`PENDING`, `APPROVED`, `REJECTED`), optional approved amount/admin note.
- `WithdrawalRequest`: public withdrawal request tied to referral code/promoter, SOL wallet, requested amount, message, status (`PENDING`, `APPROVED`, `REJECTED`, `PAID`), optional admin note.

Admin credentials are not stored in the database. The v1 admin username defaults to `@Hazrod_m`, and the password is read from `ADMIN_PASSWORD`.

## Environment variables

Copy `.env.example` to `.env` locally or create these variables on the VPS:

```bash
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="@Hazrod_m"
ADMIN_PASSWORD="replace-with-a-long-random-password"
ADMIN_SESSION_SECRET="replace-with-at-least-32-random-characters"
NEXT_PUBLIC_SITE_URL="https://refundyoursol.com"
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
- Social join verification is not implemented in v1; the app tracks outbound clicks and public submissions only.
- Rewards, claims, and withdrawals are manually reviewed by the admin.
- Promoters do not log in. They use referral codes and public withdrawal requests.
- Never ask users for private keys or seed phrases.
