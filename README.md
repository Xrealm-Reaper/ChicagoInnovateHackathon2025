# README

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the environment variables for OPENAI
3. Run `npm install` to install dependencies
4. Run `npm run dev` to run the app locally

## Prerequisites

You will need accounts for the following services.

They all have free plans that you can use to get started.
- Create a [Supabase](https://supabase.com/) account
- Create a [Clerk](https://clerk.com/) account
- Create a [Stripe](https://stripe.com/) account
- Create a [Vercel](https://vercel.com/) account

You will likely not need paid plans unless you are building a business.

## Environment Variables

```bash
# DB
DATABASE_URL=
# Access Supabase Studio here: http://127.0.0.1:54323/project/default

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=

#Open AI
OPENAI_API_KEY=
OPENAI_API_BASE=https://api.openai.com/v1 
OPENAI_MODEL=o1-mini

##Google Maps 
GOOGLE_MAPS_API_KEY=
```

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the environment variables from above
3. Run `npm install` to install dependencies
4. Run `npm run api` to run the apis
5. Change folder directory to ./frontend/
6. Run `npm install` to install dependencies
7. Run 'npm run dev' to run the app locally.
