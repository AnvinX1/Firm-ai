# FIRM AI - Law Learning Platform

An AI-powered legal education platform that helps law students master cases, generate practice quizzes, and get personalized tutoring using RAG (Retrieval-Augmented Generation).

## Features

- **📚 Case Analysis**: Upload legal cases and get instant IRAC (Issue, Rule, Analysis, Conclusion) summaries with AI-powered analysis
- **🧠 AI Tutor**: 24/7 personalized legal guidance with contextual understanding
- **📝 Smart Quizzes**: Generate adaptive quiz questions based on your case library
- **🎯 Mock Tests**: Create comprehensive exams covering multiple legal topics
- **🔍 RAG System**: Semantic search through your uploaded cases and a pre-built legal knowledge base
- **💾 Vector Storage**: Powered by Supabase PostgreSQL with pgvector for fast semantic search

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- OpenRouter API key

### Installation

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd FIRMai
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Configure environment variables:**

Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_POSTGRES_URL_NON_POOLING=your_postgres_url

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_key

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

4. **Run setup:**

```bash
pnpm setup
```

This will:
- Check environment configuration
- Install pgvector extension
- Create database tables
- Seed the legal knowledge base

5. **Start the development server:**

```bash
pnpm cli start
```

Or use the traditional Next.js command:

```bash
pnpm dev
```

The app will be available at `http://localhost:3001`

## CLI Commands

The FIRM AI CLI provides powerful tools for managing your backend:

```bash
# Check system status
pnpm cli status

# Start development server (custom port)
pnpm cli start -p 3002

# Seed knowledge base
pnpm cli seed

# Test RAG search
pnpm cli test "contract law"

# Run database migrations
pnpm cli migrate

# Clear all cached data
pnpm cli clear --yes
```

For detailed CLI documentation, see [CLI.md](./CLI.md)

## Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI/LLM**: OpenRouter (Google Gemini, OpenAI embeddings)
- **Authentication**: Supabase Auth
- **Payments**: Stripe

### RAG System

The RAG (Retrieval-Augmented Generation) system powers intelligent features:

1. **Vector Storage**: Documents are chunked semantically and embedded using OpenAI's `text-embedding-3-small` (1536 dimensions)
2. **Vector Database**: Supabase with pgvector extension for fast similarity search
3. **Knowledge Base**: Pre-built legal knowledge covering major law topics
4. **User Cases**: Automatically embedded when uploaded via the Cases page

### AI Features

All AI features use RAG context:

- **IRAC Analysis**: Searches knowledge base and your cases for relevant legal principles
- **AI Tutor**: Answers with citations from your library and knowledge base
- **Quiz Generation**: Creates questions using context from related cases
- **Mock Tests**: Generates comprehensive exams using multi-topic RAG context

## Project Structure

```
FIRMai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze-case/  # IRAC analysis endpoint
│   │   ├── tutor/         # AI tutor chat endpoint
│   │   ├── generate-quiz/ # Quiz generation endpoint
│   │   └── rag/           # RAG endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Core libraries
│   ├── llm.ts            # LLM service with RAG
│   ├── rag.ts            # RAG service
│   ├── document-processor.ts  # PDF/text processing
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Utilities
├── scripts/               # Setup and seed scripts
│   ├── 004-rag-schema.sql    # Database schema
│   ├── seed-legal-knowledge.ts  # Knowledge base seed
│   └── setup.ts          # Complete setup script
├── cli.ts                # CLI interface
└── package.json
```

## Development

### Running the Server

```bash
# Development mode
pnpm cli start

# Production mode (requires build first)
pnpm build
pnpm cli start --production
```

### Database Management

```bash
# Run migrations
pnpm cli migrate

# Check database status
pnpm cli status
```

### Testing RAG

```bash
# Test search
pnpm cli test "your query"

# Check RAG stats
pnpm cli status
```

## API Endpoints

### Case Analysis

```bash
POST /api/analyze-case
Body: { caseText, caseTitle }
Response: { issue, rule, analysis, conclusion }
```

### AI Tutor

```bash
POST /api/tutor
Body: { message, context? }
Response: { message }
```

### Quiz Generation

```bash
POST /api/generate-quiz
Body: { caseContent, numQuestions }
Response: { questions: [{ question, options, correctAnswer, explanation }] }
```

### RAG Embed Case

```bash
POST /api/rag/embed-case
Body: { caseId, caseTitle, pdfData, userId }
Response: { caseId, totalChunks, status }
```

### RAG Search

```bash
POST /api/rag/search
Body: { query, limit?, userId?, caseIds?, includeKnowledgeBase? }
Response: { results: [{ chunk, distance }] }
```

## Legal Knowledge Base

The system comes pre-loaded with legal knowledge covering:

- **Contract Law**: Formation, validity, breach
- **Tort Law**: Negligence, intentional torts
- **Constitutional Law**: Due process, First Amendment
- **Criminal Law**: Mens rea, actus reus
- **Property Law**: Adverse possession, real property

Additional knowledge can be added by seeding more documents.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI services | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_POSTGRES_URL_NON_POOLING` | Direct Postgres connection URL | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |

## Troubleshooting

### Common Issues

**"OpenRouter API error"**
- Check your API key is valid
- Verify you have credits/balance
- Ensure the model name is correct

**"Database connection failed"**
- Verify Supabase credentials
- Check network connectivity
- Ensure `SUPABASE_POSTGRES_URL_NON_POOLING` is correct

**"No results found"**
- Run `pnpm cli seed` to populate knowledge base
- Check `pnpm cli status` for database stats
- Verify pgvector extension is installed

**"Unknown font Geist"**
- Fonts are installed via `geist` npm package
- Run `pnpm install` to ensure it's installed

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Run `pnpm cli status` to check system health
2. Review logs for error details
3. Check environment variables
4. Consult CLI.md for troubleshooting

## Acknowledgments

- Built with Next.js and Supabase
- AI powered by OpenRouter
- Vector search by pgvector
- UI components by shadcn/ui




