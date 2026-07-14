# HariOm Vastu Solutions

Production-oriented single-page event registration website built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and Razorpay.

## Features

- Premium SaaS-style landing page with custom hero, benefits, trainer, gallery, and registration flow
- Auto-loading gallery from `public/images/gallery`
- React Hook Form + Zod validation on the client and server
- Razorpay order creation and signature verification
- Booking confirmation only after payment verification
- Receipt download endpoint
- Supabase PostgreSQL schema with transactional seat reduction function
- In-memory fallback mode for local UI work when Supabase or Razorpay env vars are not configured

## Stack

- Next.js 15 App Router
- React 19 RC
- TypeScript
- Tailwind CSS
- Framer Motion
- Swiper.js
- React Hook Form
- Zod
- Supabase
- Razorpay

## Project Structure

```text
app/
components/
config/
features/
hooks/
lib/
services/
supabase/
types/
public/images/gallery/
```

## Environment Variables

Copy `.env.example` into `.env.local` and configure:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### What each variable means

- `NEXT_PUBLIC_APP_URL`
  This is the base URL of your site, for example `http://localhost:3000` in local development or `https://yourdomain.com` in production.
- `NEXT_PUBLIC_APP_URL`
  It is marked `NEXT_PUBLIC_` because values with that prefix are allowed to be available in browser-side code.
- `NEXT_PUBLIC_APP_URL`
  In this project it is mainly for environment clarity and future-safe absolute URL usage. Typical examples are receipt links, redirects, metadata, canonical URLs, webhook callbacks, and any server logic that needs to know the public site domain.
- `NEXT_PUBLIC_APP_URL`
  For local development, set it to `http://localhost:3000`.
- `NEXT_PUBLIC_SUPABASE_URL`
  Your Supabase project URL. Safe to expose to the frontend.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  Your Supabase anonymous public key. Safe to expose to the frontend when used with proper Supabase policies.
- `SUPABASE_SERVICE_ROLE_KEY`
  Server-only secret key for privileged Supabase operations. Never expose this in the browser.
- `RAZORPAY_KEY_ID`
  Your Razorpay public key used by Checkout.
- `RAZORPAY_KEY_SECRET`
  Your Razorpay secret key used only on the server to create orders and verify signatures.

### Example `.env.local`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database Setup

Run the SQL migration in [supabase/migrations/001_initial_schema.sql](/D:/Software/Vasthu/supabase/migrations/001_initial_schema.sql) against your Supabase project.

The migration creates:

- `classes`
- `customers`
- `gallery_images`
- `payment_logs`
- `confirm_booking_payment(...)` RPC for concurrency-safe payment confirmation

## API Endpoints

- `GET /api/classes`
- `GET /api/gallery`
- `POST /api/register`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/booking/:bookingId`
- `GET /api/receipt/:bookingId`

## Razorpay Notes

- Secret keys stay server-side only.
- Checkout supports UPI, cards, net banking, and common wallet flows through Razorpay Checkout.
- If Razorpay env vars are missing, the app uses a mock flow so the interface can still be tested locally.

## Razorpay Setup: Step By Step

This section assumes you have never used Razorpay before.

### 1. Create your Razorpay account

1. Go to Razorpay and create a merchant account.
2. Complete the business signup process.
3. Finish KYC and bank account verification inside Razorpay Dashboard.

You cannot use real live payments properly until account verification is complete.

### 2. Understand test mode vs live mode

- `Test Mode` is for development. No real money is collected.
- `Live Mode` is for real customer payments.

Start with `Test Mode`. Do not put live keys into local development first.

### 3. Find your API keys

Inside Razorpay Dashboard:

1. Open `Settings`.
2. Open `API Keys`.
3. Generate or view keys for `Test Mode`.
4. Copy:
   - `Key Id`
   - `Key Secret`

Use them like this in `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

### 4. Put the keys into this project

Open `.env.local` and fill:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

Important:

- `RAZORPAY_KEY_ID` is okay to be used by the frontend checkout flow.
- `RAZORPAY_KEY_SECRET` must stay secret and must never be sent to the browser.

### 5. Install dependencies and run the app

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 6. What this project does with Razorpay

The payment flow in this app is:

1. User fills the registration form.
2. The app creates a draft customer record.
3. The backend calls Razorpay to create an order.
4. Razorpay Checkout opens in the browser.
5. User completes payment.
6. Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
7. The backend verifies the signature.
8. Only after verification, the booking is confirmed and seats are reduced.

This is why the secret key is needed on the server.

### 7. Test the payment flow

After starting the app:

1. Open the homepage.
2. Fill the registration form.
3. Click `Review Details`.
4. Click `Pay Securely`.
5. Razorpay Checkout should open.

If test keys are configured correctly, the app will try to use real Razorpay test checkout.

If keys are missing, this project falls back to a mock payment flow so UI work can continue.

### 8. If Razorpay Checkout does not open

Check these first:

- `RAZORPAY_KEY_ID` is present in `.env.local`
- `RAZORPAY_KEY_SECRET` is present in `.env.local`
- You restarted `npm run dev` after changing env vars
- Your internet connection allows loading `https://checkout.razorpay.com/v1/checkout.js`

### 9. Move from test mode to live mode

Only do this after you finish testing.

1. Complete business verification in Razorpay.
2. Switch Razorpay Dashboard from `Test Mode` to `Live Mode`.
3. Generate live API keys.
4. Update your production environment variables in Vercel:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Set `NEXT_PUBLIC_APP_URL` to your real domain.

Example:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret
```

### 10. Where Razorpay is integrated in this codebase

- Order creation: [app/api/payments/create-order/route.ts](/D:/Software/Vasthu/app/api/payments/create-order/route.ts)
- Signature verification: [app/api/payments/verify/route.ts](/D:/Software/Vasthu/app/api/payments/verify/route.ts)
- Razorpay client loader: [hooks/use-razorpay.ts](/D:/Software/Vasthu/hooks/use-razorpay.ts)
- Checkout trigger from UI: [features/registration/registration-section.tsx](/D:/Software/Vasthu/features/registration/registration-section.tsx)

### 11. Recommended first-time setup order

1. Set up Supabase and run the SQL migration.
2. Add all `.env.local` values.
3. Add Razorpay test keys.
4. Run `npm install`.
5. Run `npm run dev`.
6. Complete one full test registration and payment.
7. Only after that, switch to production deployment settings.

## Deployment

Deploy to Vercel with the environment variables configured.

Recommended production setup:

- Add Supabase Row Level Security policies as needed for your broader platform
- Point `NEXT_PUBLIC_APP_URL` to the deployed domain
- Configure Razorpay allowed origins and webhook settings if you later add webhook reconciliation

## Gallery Management

Drop image files into [public/images/gallery](/D:/Software/Vasthu/public/images/gallery) and redeploy if required by your hosting cache strategy.
