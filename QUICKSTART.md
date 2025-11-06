# FIRM AI Quick Start Guide

Get your AI-powered law learning platform up and running in minutes!

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
# Copy your Supabase and OpenRouter credentials to .env file

# 3. Run setup
pnpm setup
```

## Daily Use

```bash
# Start development server
pnpm cli start

# Or use traditional Next.js command
pnpm dev
```

## Check System Health

```bash
# View system status
pnpm cli status

# Test RAG search
pnpm cli test "contract formation"
```

## Common Commands

| Task | Command |
|------|---------|
| Start server | `pnpm cli start` |
| Check status | `pnpm cli status` |
| Test RAG | `pnpm cli test "query"` |
| Seed data | `pnpm cli seed` |
| Clear cache | `pnpm cli clear --yes` |
| Build | `pnpm build` |
| Lint | `pnpm lint` |

## First Time Setup Checklist

- [ ] `pnpm install` - Install dependencies
- [ ] Configure `.env` file with credentials
- [ ] `pnpm setup` - Run complete setup
- [ ] `pnpm cli status` - Verify everything works
- [ ] `pnpm cli test "law"` - Test RAG search
- [ ] `pnpm cli start` - Start the app!

## Troubleshooting

**Setup failed?**
```bash
pnpm cli status  # Check what's missing
```

**No search results?**
```bash
pnpm cli seed    # Populate knowledge base
```

**Database errors?**
```bash
pnpm cli status  # Check connection
```

## Architecture Overview

```
User Upload → PDF Processing → Embeddings → Vector Store (pgvector)
                                        ↓
RAG Search → Context Retrieval → LLM (Gemini) → Responses
```

## Features

✅ **IRAC Analysis** - Upload cases, get instant legal analysis  
✅ **AI Tutor** - 24/7 personalized guidance  
✅ **Smart Quizzes** - Auto-generate practice questions  
✅ **Mock Tests** - Comprehensive exam preparation  
✅ **RAG-Powered** - Context-aware responses  
✅ **Semantic Search** - Find relevant legal content  

## Next Steps

1. Upload your first case in the Dashboard
2. Ask the AI Tutor a legal question
3. Generate a quiz from your cases
4. Create a mock test covering multiple topics

For detailed information, see [README.md](./README.md) and [CLI.md](./CLI.md).




