# Environment Setup Guide

## Frontend Configuration (.env.local)

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenRouter AI Settings
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Override default AI models
# CHAT_MODEL=google/gemini-2.0-flash-exp
# IRAC_MODEL=google/gemini-2.0-flash-exp
# QUIZ_MODEL=anthropic/claude-3.5-sonnet
# MOCK_TEST_MODEL=anthropic/claude-3.5-sonnet
# EMBEDDING_MODEL=openai/text-embedding-3-small

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_TESTS=true
NEXT_PUBLIC_ENABLE_FLASHCARDS=true
NEXT_PUBLIC_ENABLE_STUDY_PLANS=true
NEXT_PUBLIC_ENABLE_RAG_SEARCH=true
```

## Backend Configuration (src-tauri/.env)

Create a `.env` file in the `src-tauri/` directory with the following content:

```bash
# OpenRouter AI (Required)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Supabase (Optional - for cloud sync)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key_here

# AI Model Configuration (Optional)
# EMBEDDING_MODEL=openai/text-embedding-3-small
# CHAT_MODEL=google/gemini-2.0-flash-exp
# IRAC_MODEL=google/gemini-2.0-flash-exp
# QUIZ_MODEL=anthropic/claude-3.5-sonnet
# MOCK_TEST_MODEL=anthropic/claude-3.5-sonnet

# Storage Configuration
DATABASE_PATH=firm_ai.db
SYNC_INTERVAL=300
OFFLINE_MODE=false

# Logging (Development)
# RUST_LOG=info
```

## Getting API Keys

### OpenRouter API Key (Required)
1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-`)

### Supabase Credentials (Optional)
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy the Project URL and anon key
5. Copy the service role key (keep this secure!)

## Model Recommendations

### For Best Quality:
```bash
CHAT_MODEL=anthropic/claude-3.5-sonnet
IRAC_MODEL=anthropic/claude-3.5-sonnet
QUIZ_MODEL=anthropic/claude-3.5-sonnet
```

### For Best Speed (Recommended):
```bash
CHAT_MODEL=google/gemini-2.0-flash-exp
IRAC_MODEL=google/gemini-2.0-flash-exp
QUIZ_MODEL=google/gemini-2.0-flash-exp
```

### For Best Cost:
```bash
CHAT_MODEL=meta-llama/llama-3.1-70b-instruct
IRAC_MODEL=google/gemini-2.0-flash-exp
QUIZ_MODEL=meta-llama/llama-3.1-70b-instruct
```

## Important Notes

1. **OPENROUTER_API_KEY** is required for all AI features
2. **Supabase credentials** are optional - the app works offline without them
3. **Never commit** `.env` or `.env.local` files to version control
4. **Service role key** should only be used server-side
5. **Embedding model** should remain consistent - changing it requires re-embedding all documents
6. Default models are optimized for speed + cost balance

