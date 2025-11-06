<div align="center">

<img src="src-tauri/icons/icon.png" alt="FIRM AI Logo" width="120" height="120">

# FIRM AI

### AI-Powered Legal Education Platform

*Master legal concepts through intelligent case analysis, adaptive quizzes, and personalized AI tutoring*

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-orange)](https://openrouter.ai/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-screenshots)

</div>

---

## 🎯 Overview

**FIRM AI** is a cutting-edge legal education platform that leverages **Retrieval-Augmented Generation (RAG)** and advanced AI models to transform how law students learn. Upload your cases, get instant IRAC analysis, generate practice questions, and chat with an AI tutor that knows your entire case library.

### Why FIRM AI?

- 🚀 **10x Faster Case Analysis** - Get comprehensive IRAC breakdowns in seconds
- 🧠 **Contextual AI Tutor** - Answers based on your uploaded cases and legal knowledge base
- 📊 **Adaptive Learning** - Quizzes and mock tests tailored to your weak areas
- 🔍 **Semantic Search** - Find relevant cases instantly using natural language
- 💾 **Your Data, Your Control** - Everything stored securely in your Supabase instance

---

## ✨ Features

### 📚 **Intelligent Case Analysis**
Upload PDF or text cases and get instant IRAC (Issue, Rule, Analysis, Conclusion) breakdowns powered by AI. Each case is automatically embedded and searchable.

### 🤖 **AI Legal Tutor**
24/7 personalized tutoring with contextual understanding. The tutor searches your case library and knowledge base to provide accurate, cited responses.

### 📝 **Smart Quiz Generator**
Generate adaptive quiz questions from your cases. Questions automatically adjust difficulty and focus on concepts you need to practice.

### 🎯 **Comprehensive Mock Tests**
Create full-length practice exams covering multiple topics. Track your progress with detailed analytics.

### 💾 **RAG-Powered Knowledge Base**
- **Vector Database**: Supabase PostgreSQL with pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **Semantic Search**: Natural language queries across all your materials
- **Pre-loaded Knowledge**: Contract Law, Torts, Constitutional Law, Criminal Law, Property Law

### 📊 **Study Planner**
Organize your study schedule, track progress, and set goals with an intelligent planner.

### 🎨 **Beautiful, Modern UI**
- Red, black, and white professional color scheme
- Smooth animations and transitions
- Responsive design for all devices
- Dark mode optimized

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and **pnpm** installed
- **Supabase** account ([Sign up free](https://supabase.com))
- **OpenRouter** API key ([Get one here](https://openrouter.ai/keys))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/firmai.git
cd firmai

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see below)

# 5. Run complete setup (installs pgvector, creates tables, seeds knowledge base)
pnpm setup

# 6. Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_POSTGRES_URL_NON_POOLING=your_postgres_direct_connection_url

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: Stripe for subscriptions
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Quick Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm cli start              # Start with custom port
pnpm cli status             # Check system health

# Database
pnpm cli migrate            # Run database migrations
pnpm cli seed               # Seed legal knowledge base

# Testing
pnpm cli test "query"       # Test RAG search
pnpm lint                   # Run linter
pnpm build                  # Build for production

# Desktop App (Tauri)
pnpm tauri dev              # Run desktop app in dev mode
pnpm tauri build            # Build desktop installer
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Backend** | Next.js API Routes, Supabase Edge Functions |
| **Database** | Supabase PostgreSQL with pgvector extension |
| **AI/LLM** | OpenRouter (Gemini, Claude, GPT-4) |
| **Embeddings** | OpenAI text-embedding-3-small |
| **Auth** | Supabase Auth (Email/Password, OAuth) |
| **Payments** | Stripe (Subscriptions) |
| **Desktop** | Tauri (Rust + Next.js) |
| **Deployment** | Vercel (Web), NSIS Installer (Desktop) |

### RAG Pipeline

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   User      │─────▶│  PDF Upload  │─────▶│  Chunking   │
│  Uploads    │      │   (Cases)    │      │  (Semantic) │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  AI Tutor   │◀─────│   Vector DB  │◀─────│  Embedding  │
│   Query     │      │  (pgvector)  │      │  (OpenAI)   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     ▲
       │                     │
       ▼                     │
┌─────────────┐      ┌──────────────┐
│ Similarity  │─────▶│ Context +    │
│   Search    │      │ LLM Response │
└─────────────┘      └──────────────┘
```

### Project Structure

```
FIRMai/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages (login, register)
│   ├── api/                     # API Routes
│   │   ├── analyze-case/       # IRAC analysis endpoint
│   │   ├── tutor/              # AI tutor chat
│   │   ├── flashcards/         # Flashcard generation
│   │   ├── mock-tests/         # Mock test generation
│   │   ├── quizzes/            # Quiz generation
│   │   └── rag/                # RAG endpoints (embed, search)
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── cases/              # Case management
│   │   ├── quizzes/            # Quiz interface
│   │   ├── mock-tests/         # Mock tests
│   │   ├── tutor/              # AI tutor chat
│   │   ├── planner/            # Study planner
│   │   ├── profile/            # User settings
│   │   └── pricing/            # Subscription plans
│   └── page.tsx                # Landing page
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard-header.tsx    # Dashboard navigation
│   ├── dashboard-sidebar.tsx   # Sidebar navigation
│   └── page-transition.tsx     # Smooth page transitions
├── lib/                        # Core libraries
│   ├── llm.ts                  # LLM service with RAG integration
│   ├── rag.ts                  # RAG service (embedding, search)
│   ├── document-processor.ts   # PDF parsing and chunking
│   ├── unified-llm.ts          # Unified LLM interface
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   ├── middleware.ts       # Auth middleware
│   │   └── client-actions.ts   # Database helpers
│   └── utils.ts                # Utility functions
├── scripts/                    # Setup and maintenance scripts
│   ├── setup.ts                # Complete setup script
│   ├── seed-legal-knowledge.ts # Seed knowledge base
│   └── 004-rag-schema.sql      # Database schema
├── src-tauri/                  # Tauri desktop app
│   ├── src/                    # Rust backend
│   ├── icons/                  # App icons
│   └── tauri.conf.json         # Tauri configuration
└── public/                     # Static assets
```

---

## 📖 Documentation

### API Endpoints

#### **POST** `/api/analyze-case`
Generate IRAC analysis from case text.

```typescript
// Request
{
  caseText: string;
  caseTitle: string;
}

// Response
{
  issue: string;
  rule: string;
  analysis: string;
  conclusion: string;
}
```

#### **POST** `/api/tutor`
Chat with AI tutor using RAG context.

```typescript
// Request
{
  message: string;
  context?: {
    caseIds?: string[];
    includeKnowledgeBase?: boolean;
  };
}

// Response
{
  message: string;
  sources?: string[];
}
```

#### **POST** `/api/rag/embed-case`
Embed and store case for RAG search.

```typescript
// Request
{
  caseId: string;
  caseTitle: string;
  pdfData: string; // Base64 encoded PDF
  userId: string;
}

// Response
{
  caseId: string;
  totalChunks: number;
  status: "success" | "failed";
}
```

#### **POST** `/api/rag/search`
Semantic search across cases and knowledge base.

```typescript
// Request
{
  query: string;
  limit?: number;
  userId?: string;
  caseIds?: string[];
  includeKnowledgeBase?: boolean;
}

// Response
{
  results: Array<{
    chunk: string;
    distance: number;
    source: string;
  }>;
}
```

### CLI Commands

FIRM AI includes a powerful CLI for managing the backend:

```bash
# System Management
pnpm cli status              # Check system health and database stats
pnpm cli start               # Start dev server (custom port with -p)
pnpm cli migrate             # Run database migrations
pnpm cli clear --yes         # Clear all cached data

# Knowledge Base
pnpm cli seed                # Seed legal knowledge base
pnpm cli test "query"        # Test RAG search functionality

# Development
pnpm dev                     # Standard Next.js dev server
pnpm build                   # Build for production
pnpm lint                    # Run linter
```

For detailed CLI documentation, see [CLI.md](./CLI.md)

---

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Case Analysis
![Case Analysis](docs/screenshots/cases.png)

### AI Tutor
![AI Tutor](docs/screenshots/tutor.png)

### Mock Tests
![Mock Tests](docs/screenshots/mock-tests.png)

---

## 🗄️ Database Schema

### Core Tables

- **`users`** - User accounts and profiles
- **`cases`** - Uploaded legal cases with IRAC analysis
- **`case_embeddings`** - Vector embeddings for cases (1536 dimensions)
- **`legal_knowledge_base`** - Pre-loaded legal knowledge embeddings
- **`flashcard_sets`** - Flashcard collections
- **`flashcards`** - Individual flashcards
- **`quizzes`** - Quiz collections
- **`quiz_questions`** - Quiz questions with answers
- **`mock_tests`** - Mock test collections
- **`test_questions`** - Mock test questions
- **`test_results`** - User test scores and analytics
- **`study_plans`** - User study schedules

### RAG Tables

- **`case_embeddings`** - User-uploaded case chunks (pgvector)
- **`legal_knowledge_base`** - Pre-loaded legal knowledge (pgvector)

Both use `vector(1536)` for OpenAI embeddings with cosine similarity search.

---

## 🎓 Legal Knowledge Base

FIRM AI comes pre-loaded with comprehensive legal knowledge:

| Topic | Coverage | Chunks |
|-------|----------|--------|
| **Contract Law** | Formation, Consideration, Breach, Remedies | 50+ |
| **Tort Law** | Negligence, Intentional Torts, Strict Liability | 50+ |
| **Constitutional Law** | Due Process, Equal Protection, First Amendment | 50+ |
| **Criminal Law** | Elements, Defenses, Accomplice Liability | 50+ |
| **Property Law** | Adverse Possession, Easements, Real Property | 50+ |

**Total**: 250+ pre-embedded legal concepts

---

## 🖥️ Desktop App

FIRM AI is available as a **cross-platform desktop application** built with Tauri!

### Features

- ✅ Native Windows/macOS/Linux support
- ✅ Offline-capable with local SQLite cache
- ✅ Cloud sync with Supabase
- ✅ Professional NSIS installer (Windows)
- ✅ ~5 MB installer size

### Building Desktop App

```bash
# Development
pnpm tauri dev

# Production build
pnpm tauri build

# Output: src-tauri/target/release/bundle/nsis/FIRM AI_0.1.0_x64-setup.exe
```

### Installer Features

- ✅ Professional branding with custom icon
- ✅ Desktop and Start Menu shortcuts
- ✅ Per-user installation (no admin required)
- ✅ Clean uninstaller
- ✅ Windows Registry integration

For code signing and distribution, see [src-tauri/INSTALLER_SETUP.md](src-tauri/INSTALLER_SETUP.md)

---

## 🔒 Security

- ✅ **Row Level Security (RLS)** on all Supabase tables
- ✅ **JWT Authentication** with Supabase Auth
- ✅ **Secure API Routes** with server-side validation
- ✅ **Environment Variables** for secrets
- ✅ **HTTPS Only** in production
- ✅ **Input Sanitization** for user-generated content
- ✅ **XSS Protection** via React's built-in escaping

---

## 🚢 Deployment

### Web App (Vercel)

```bash
# 1. Connect your GitHub repo to Vercel
# 2. Add environment variables in Vercel dashboard
# 3. Deploy!

# Or use Vercel CLI:
pnpm install -g vercel
vercel
```

### Desktop App

```bash
# Build installer
pnpm tauri build

# Distribute:
# - Windows: FIRM AI_0.1.0_x64-setup.exe
# - macOS: FIRM AI.app.tar.gz
# - Linux: FIRM AI_0.1.0_amd64.deb
```

For code signing certificates and professional distribution, see [src-tauri/INSTALLER_SETUP.md](src-tauri/INSTALLER_SETUP.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- ✅ Follow TypeScript strict mode
- ✅ Use Tailwind CSS for styling
- ✅ Write clean, documented code
- ✅ Test RAG features thoroughly
- ✅ Run `pnpm lint` before committing

---

## 📊 Roadmap

### 🚀 Coming Soon

- [ ] **Auto-Update System** for desktop app
- [ ] **Collaborative Study** - Share cases and quizzes
- [ ] **Audio Transcription** - Upload lecture recordings
- [ ] **Mobile Apps** (iOS/Android)
- [ ] **Advanced Analytics** - Study insights dashboard
- [ ] **Multi-Language Support**
- [ ] **Citation Generator** - Bluebook format
- [ ] **Outline Builder** - Generate course outlines

### 🎯 In Progress

- [x] Desktop app with Tauri
- [x] RAG-powered AI tutor
- [x] Flashcard generation
- [x] Mock test analytics
- [x] Study planner

---

## 🐛 Troubleshooting

### Common Issues

**"OpenRouter API Error"**
```bash
# Check your API key
pnpm cli status

# Verify in .env.local
OPENROUTER_API_KEY=sk-or-...
```

**"Database Connection Failed"**
```bash
# Check Supabase credentials
pnpm cli status

# Verify PostgreSQL URL format
SUPABASE_POSTGRES_URL_NON_POOLING=postgresql://...
```

**"No Search Results"**
```bash
# Seed the knowledge base
pnpm cli seed

# Check database stats
pnpm cli status
```

**"pgvector Extension Missing"**
```bash
# Run setup script
pnpm setup

# Or manually in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;
```

For more help, see [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) or open an issue.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework
- **[Supabase](https://supabase.com/)** - Backend and database
- **[OpenRouter](https://openrouter.ai/)** - AI model access
- **[pgvector](https://github.com/pgvector/pgvector)** - Vector similarity search
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components
- **[Tauri](https://tauri.app/)** - Desktop app framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/firmai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/firmai/discussions)
- **Email**: support@firmai.com
- **Documentation**: [docs.firmai.com](https://docs.firmai.com)

---

<div align="center">

**Built with ❤️ for law students everywhere**

[⭐ Star us on GitHub](https://github.com/yourusername/firmai) • [📖 Read the Docs](https://docs.firmai.com) • [🐦 Follow on Twitter](https://twitter.com/firmai)

*Empowering legal education through artificial intelligence*

</div>
