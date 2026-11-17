# 🎊 MehmanJi (मेहमानजी)
### *Indian Wedding Guest Intelligence & WhatsApp RSVP Platform*

> *"Ab pata chalega kaun aa raha hai paneer khane!"* 🍽️  
> *(Now you'll know who is actually coming to eat the paneer!)*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma 6](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-Serverless_PostgreSQL-00E699?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://mehmanji1.vercel.app)

---

## 🌐 Live Production Demo
👉 **[https://mehmanji1.vercel.app](https://mehmanji1.vercel.app)**

- **Instant Demo Login:** Go to `/login` and click the **"Auto-fill"** demo button to sign in as *Priya Sharma* with 1 click!
- **Sample Guest WhatsApp RSVP Experience:** [Try a Live Guest Invitation](https://mehmanji1.vercel.app/rsvp/cmwkzep7d000munl01w30sxxh)

---

## 💡 The ₹50 Lakh Problem

In India, families spend **₹50 Lakh to ₹2 Crore** on grand weddings. They hire world-class decorators, international photographers, and celebrity DJs. 

Yet, when calculating catering food for 500 people, the entire budget is based on:  
> *"Bro, I think Sharma uncle and his cousins will definitely come."*

### The Reality:
- ✉️ **You invite:** 400 people. Everyone says: *"Arre beta, of course we are coming!"*
- 🍛 **You prepare:** 400 gourmet plates @ ₹1,800/plate (+10% safety buffer).
- 🚗 **Wedding day:** Only 280 show up! (Traffic, exams, late flights, work trips).
- 💸 **The result:** **120 gourmet plates wasted = ₹2.16 Lakhs thrown away!** That money could have paid for your entire European honeymoon.

---

## ✨ The Solution: MehmanJi

**MehmanJi** replaces blind guesswork with real, actionable data delivered directly over **WhatsApp** — the one communication app every Indian uncle, auntie, friend, and colleague already uses daily.

### 🌟 Key Highlights

- **Zero App Download for Guests:** Guests receive a personalized WhatsApp link. They tap it, see their custom invitation, and confirm in 10 seconds. No login, no password, no friction.
- **Dietary Breakdown for Maharaj / Chefs:**
  - 🥗 **Regular Vegetarian**
  - 🪷 **Pure Jain** (Strictly without onion & garlic)
  - 🍗 **Non-Vegetarian** (Chicken / Mutton)
  - 🌱 **Vegan & Special Allergies** (Nut-free, dairy-free)
- **Maharaj 10% Safety Buffer Engine:** Intelligent catering algorithm calculates exact plate preparation recommendations so food never runs out and never goes to waste.
- **Multi-Ceremony Support:** Track individual attendance for **Mehendi, Haldi, Sangeet, Wedding Ceremony (Pheras), and Reception**.
- **Interactive Catering Savings Calculator:** Live slider tool on the homepage showing estimated waste and ROI based on guest count and plate price.
- **Printable Caterer Handover Sheet:** Instant export to **CSV** or print-ready format (`Ctrl+P`) for banquet managers and head chefs.
- **Smart Guest Grouping:** Tag guests as *Ladkiwale, Ladkewale, Family, College Gang, Society Neighbors, or Office Colleagues*.

---

## 🛠️ Architecture & Tech Stack

```
mehmanji/
├── prisma/
│   ├── schema.prisma       # Database schema (PostgreSQL / Neon)
│   └── seed.ts             # Realistic sample wedding & RSVP dataset
├── src/
│   ├── app/
│   │   ├── (auth)/         # NextAuth login & signup pages
│   │   ├── (dashboard)/    # Command center, guests, events, catering reports
│   │   ├── api/            # Serverless REST endpoints (RSVP, auth, weddings, etc.)
│   │   ├── rsvp/[token]/   # Public guest WhatsApp RSVP experience
│   │   └── page.tsx        # Viral landing page & interactive savings calculator
│   ├── components/
│   │   ├── ui/             # Reusable UI component library (Radix primitives)
│   │   └── providers.tsx   # SessionProvider & toast notification context
│   ├── lib/
│   │   ├── prisma.ts       # Singleton Prisma client for connection pooling
│   │   ├── auth.ts         # NextAuth.js JWT credential handler
│   │   ├── rate-limit.ts   # In-memory rate limiting against brute force & spam
│   │   └── utils.ts        # WhatsApp link & invite message generators
│   └── schemas/            # Zod validation schemas for all mutations
```

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | React Server Components, fast Turbopack builds, serverless API routes |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) | Zero `any` types, 100% type-safe schemas |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) | Cloud-native Postgres with connection pooling, autoscaling, zero idle cost |
| **ORM** | [Prisma 6](https://www.prisma.io/) | Type-safe queries, automatic migrations, seed scripts |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) + bcryptjs | Secure JWT session management, salted password hashing (12 rounds) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Theme variables, responsive mobile-first Indian wedding color palette |
| **Validation** | [Zod](https://zod.dev/) | Client and server-side request payload validation |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible icon system |

---

## 📱 User Flows

### 1. The Organizer Flow (Family / Wedding Planner)
```mermaid
flowchart LR
    A[Sign Up / Login] --> B[Create Wedding]
    B --> C[Add Sub-Events\nMehendi, Sangeet, etc.]
    C --> D[Add Guests / Bulk CSV]
    D --> E[Click 'WhatsApp' Button]
    E --> F[Track Real-Time RSVPs]
    F --> G[Export Caterer PDF / CSV]
```

### 2. The Guest Flow (No Login Required)
```mermaid
flowchart LR
    A[Receive WhatsApp Invite] --> B[Tap Unique Link]
    B --> C[View Personal Invitation]
    C --> D[Select Coming / Maybe / Declined]
    D --> E[Enter Party Size & Food Preferences\nVeg / Jain / Non-Veg]
    E --> F[Select Arrival Time & Submit]
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/Yarram-Koushik/mehmanji.git
cd mehmanji
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
# Neon Cloud PostgreSQL (or local SQLite)
DATABASE_URL="postgresql://neondb_owner:***@ep-holy-wind-a1dggiu5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:***@ep-holy-wind-a1dggiu5.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth Secret
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sync Database & Seed Sample Data
```bash
# Push schema to database
npx prisma db push

# Seed sample wedding (Priya Sharma & Rohan Patel)
npx tsx prisma/seed.ts
```

### 5. Run the development server
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📊 Database Data Model

```mermaid
erDiagram
    User ||--o{ Wedding : organizes
    Wedding ||--o{ Event : has
    Wedding ||--o{ GuestGroup : defines
    Wedding ||--o{ Guest : invites
    GuestGroup ||--o{ Guest : groups
    Guest ||--o{ Rsvp : submits
    Event ||--o{ Rsvp : receives

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string phone
    }

    Wedding {
        string id PK
        string familyName
        string brideName
        string groomName
        datetime weddingDate
        string venue
        string city
    }

    Event {
        string id PK
        string name
        string type
        datetime eventDate
        string startTime
        string venue
    }

    Guest {
        string id PK
        string name
        string phone
        string token UK
        string notes
    }

    Rsvp {
        string id PK
        string status
        int partySize
        int vegCount
        int jainCount
        int nonVegCount
        string arrivalTime
        string dietaryNotes
    }
```

---

## 🔒 Security & Privacy

- **No Public Access to Private Data:** Every organizer mutation strictly validates `session.user.id === wedding.userId` to eliminate Insecure Direct Object References (IDOR).
- **Unguessable Guest RSVP Tokens:** Public RSVP links use high-entropy cryptographically unique tokens (`cuid` / `nanoid`).
- **Input Sanitization:** 100% of inputs validated with strict Zod schemas to prevent XSS and SQL injection.
- **Rate Limiting:** Public RSVP submission and authentication endpoints are protected by in-memory rate limiters against brute-force attacks.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Yarram-Koushik/mehmanji/issues).

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Made with ❤️ for Indian Weddings across the globe 🇮🇳
</p>
