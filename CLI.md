# FIRM AI Backend CLI

Command-line interface for managing the FIRM AI backend and RAG system.

## Installation

The CLI is included with the project. Just install dependencies:

```bash
pnpm install
```

## Usage

Run commands using `npx tsx cli.ts` or `pnpm cli`:

```bash
# Check status
pnpm cli status

# Start development server
pnpm cli start

# Seed knowledge base
pnpm cli seed

# Test RAG search
pnpm cli test "contract formation"

# Run migrations
pnpm cli migrate

# Clear all data
pnpm cli clear --yes
```

## Commands

### `start`
Start the Next.js development server.

```bash
# Default port 3001
pnpm cli start

# Custom port
pnpm cli start -p 8080

# Production mode (requires build first)
pnpm cli start --production
```

### `status`
Check system status and configuration.

```bash
pnpm cli status
```

Shows:
- Environment variables status
- Database connection and stats
- AI service configuration
- System readiness

### `seed`
Seed the legal knowledge base with initial legal content.

```bash
pnpm cli seed
```

Populates the database with legal knowledge documents covering:
- Contract Law
- Tort Law
- Constitutional Law
- Criminal Law
- Property Law

### `test`
Test RAG search functionality.

```bash
# Default query
pnpm cli test

# Custom query
pnpm cli test "negligence elements"
```

Returns similar chunks from the knowledge base.

### `migrate`
Run database migrations to set up schema.

```bash
pnpm cli migrate
```

Applies:
- Vector extension (pgvector)
- Documents and chunks tables
- Search function
- Indexes

### `clear`
Clear all cached documents and chunks.

```bash
# With confirmation prompt
pnpm cli clear

# Skip confirmation
pnpm cli clear --yes
```

## Development Workflow

1. **First time setup:**
   ```bash
   # Check system status
   pnpm cli status
   
   # Run migrations
   pnpm cli migrate
   
   # Seed knowledge base
   pnpm cli seed
   ```

2. **Daily development:**
   ```bash
   # Start dev server
   pnpm cli start
   ```

3. **Testing:**
   ```bash
   # Test RAG search
   pnpm cli test "your query"
   ```

## Troubleshooting

**Issue: "Environment variables missing"**
- Check `.env` file exists and has required variables
- Run `pnpm cli status` to see what's missing

**Issue: "No results found"**
- Run `pnpm cli seed` to populate the knowledge base
- Check `pnpm cli status` for database connection issues

**Issue: "Database connection failed"**
- Verify Supabase credentials in `.env`
- Check network connectivity
- Ensure `SUPABASE_POSTGRES_URL_NON_POOLING` is correct

## Production Deployment

For production:

1. Build the application:
   ```bash
   pnpm build
   ```

2. Run in production mode:
   ```bash
   pnpm cli start --production
   ```

Or use `pnpm start` which runs `next start`.

## Advanced Usage

The CLI uses the same environment variables as the Next.js app. Ensure `.env` contains:

```env
# OpenRouter
OPENROUTER_API_KEY=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_POSTGRES_URL_NON_POOLING=your_postgres_url
```

## Tips

- Use `pnpm cli status` first to diagnose issues
- Check logs for detailed error messages
- Clear cache if you suspect data corruption
- Re-seed after schema changes

## Support

For issues or questions:
1. Run `pnpm cli status` to check system health
2. Check logs for error details
3. Verify all environment variables are configured




