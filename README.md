# Automated Student Planner (ASP)

> **Module 1: Project Foundation**  
> **Module 2: Authentication (Supabase Auth) - COMPLETE**

ASP is an AI-powered student workspace for notes, document chat, study planning, flashcards, quizzes, and active recall — all in one intelligent platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+ or pnpm / yarn

### Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_APP_NAME="Automated Student Planner"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_ENV="development"

   # Supabase Authentication Credentials
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Lint Codebase**:
   ```bash
   npm run lint
   ```

---

## 🔐 Module 2: Authentication Setup & Flow

### Features Implemented
- **Email Registration**: Registration with full name, email, password validation, and password strength meter.
- **Email Login**: Secure authentication with error alerts and "Remember me" session persistence.
- **Google & GitHub OAuth**: One-click social authentication via Supabase OAuth providers.
- **Email Verification**: Unverified account protection with email confirmation banner and `/verify-email` screen.
- **Forgot & Reset Password**: Complete password reset request and update flow (`/forgot-password`, `/reset-password`).
- **Logout**: Safe session clearance, local state wipe, and redirection to `/login`.
- **Edge Route Protection**: Next.js Edge Middleware managing session token refreshes and public vs protected route redirection.

### Supabase Configuration Guide
1. Create a project on [Supabase Dashboard](https://supabase.com/).
2. Under **Project Settings > API**, copy the `Project URL` and `anon public key`.
3. Paste them into your `.env.local` file as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Under **Authentication > URL Configuration**, add `http://localhost:3000/callback` as an Allowed Redirect URL.
5. (Optional) Under **Authentication > Providers**, enable Google and GitHub OAuth providers with your Client ID and Secret.

---

## 📚 Project Documentation

Detailed architectural and developer guides:

- [Architecture Overview](file:///d:/ASP/docs/architecture.md)
- [Folder Structure Explanation](file:///d:/ASP/docs/folder-structure.md)
- [Development Guide](file:///d:/ASP/docs/development-guide.md)
- [Coding & Naming Standards](file:///d:/ASP/docs/coding-standards.md)
- [Future Module Integration Guide](file:///d:/ASP/docs/future-integration-guide.md)
- [Module 2 Completion Summary](file:///d:/ASP/MODULE_COMPLETION.md)
