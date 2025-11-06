#!/usr/bin/env node

/**
 * FIRM AI Backend CLI
 * Command-line interface for managing the AI RAG backend
 */

import * as dotenv from "dotenv"
import { Command } from "commander"
import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// Load environment variables
dotenv.config()

const program = new Command()

program
  .name("firmai-cli")
  .description("FIRM AI Backend CLI - Manage your AI-powered law learning platform")
  .version("1.0.0")

// Start the development server
program
  .command("start")
  .description("Start the Next.js development server")
  .option("-p, --port <port>", "Port to run on", "3001")
  .option("--production", "Run in production mode")
  .action(async (options) => {
    if (options.production) {
      console.log("🚀 Starting FIRM AI backend in production mode...\n")
      try {
        execSync("next start", { 
          stdio: "inherit",
          cwd: process.cwd() 
        })
      } catch (error) {
        process.exit(0)
      }
    } else {
      console.log(`🚀 Starting FIRM AI backend on port ${options.port}...\n`)
      try {
        execSync(`next dev -p ${options.port}`, { 
          stdio: "inherit",
          cwd: process.cwd() 
        })
      } catch (error) {
        process.exit(0) // Exit gracefully on Ctrl+C
      }
    }
  })

// Seed the knowledge base
program
  .command("seed")
  .description("Seed the legal knowledge base with initial data")
  .action(async () => {
    console.log("🌱 Seeding legal knowledge base...\n")
    try {
      execSync("pnpm setup", { 
        stdio: "inherit",
        cwd: process.cwd() 
      })
      console.log("\n✅ Knowledge base seeded successfully!")
    } catch (error) {
      console.error("❌ Failed to seed knowledge base")
      process.exit(1)
    }
  })

// Run database migrations
program
  .command("migrate")
  .description("Run database migrations")
  .action(async () => {
    console.log("🗄️  Running database migrations...\n")
    try {
      // Check if we have a migration runner script
      const migrationScripts = [
        "scripts/004-rag-schema.sql",
      ]
      
      for (const script of migrationScripts) {
        if (fs.existsSync(script)) {
          console.log(`Executing: ${script}`)
          execSync(`npx tsx -e "const { Client } = require('pg'); const url = new URL(process.env.SUPABASE_POSTGRES_URL_NON_POOLING); const client = new Client({ host: url.hostname, port: parseInt(url.port) || 5432, database: url.pathname.slice(1), user: url.username, password: url.password, ssl: { rejectUnauthorized: false } }); client.connect().then(() => client.query(fs.readFileSync('${script}', 'utf8'))).then(() => { console.log('✓ Migration complete'); client.end(); process.exit(0); }).catch(err => { console.error(err.message); client.end(); process.exit(1); });"`, { 
            stdio: "inherit",
            cwd: process.cwd() 
          })
        }
      }
      console.log("\n✅ All migrations completed!")
    } catch (error) {
      console.error("❌ Failed to run migrations")
      process.exit(1)
    }
  })

// Check system status
program
  .command("status")
  .description("Check system status and configuration")
  .action(async () => {
    console.log("📊 FIRM AI System Status\n")
    
    // Check environment variables
    const requiredEnvVars = {
      "OPENROUTER_API_KEY": process.env.OPENROUTER_API_KEY,
      "NEXT_PUBLIC_SUPABASE_URL": process.env.NEXT_PUBLIC_SUPABASE_URL,
      "SUPABASE_SERVICE_ROLE_KEY": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_POSTGRES_URL_NON_POOLING": process.env.SUPABASE_POSTGRES_URL_NON_POOLING,
    }
    
    console.log("Environment Variables:")
    let allConfigured = true
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (value) {
        console.log(`  ✅ ${key}: Configured`)
      } else {
        console.log(`  ❌ ${key}: Missing`)
        allConfigured = false
      }
    }
    
    console.log("\nDatabase:")
    if (allConfigured) {
      try {
        const { Client } = await import("pg")
        const url = new URL(process.env.SUPABASE_POSTGRES_URL_NON_POOLING!)
        const client = new Client({
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1),
          user: url.username,
          password: url.password,
          ssl: { rejectUnauthorized: false },
        })
        
        await client.connect()
        const { rows: extRows } = await client.query(
          "SELECT extname FROM pg_extension WHERE extname = 'vector'"
        )
        console.log(`  ✅ pgvector extension: ${extRows.length > 0 ? "Installed" : "Not installed"}`)
        
        const { rows: docRows } = await client.query("SELECT COUNT(*) as count FROM documents")
        const { rows: chunkRows } = await client.query("SELECT COUNT(*) as count FROM document_chunks")
        
        console.log(`  ✅ Documents: ${docRows[0].count}`)
        console.log(`  ✅ Document chunks: ${chunkRows[0].count}`)
        
        await client.end()
      } catch (error: any) {
        console.log(`  ❌ Connection failed: ${error.message}`)
      }
    } else {
      console.log("  ⚠️  Skipping database check (missing configuration)")
    }
    
    console.log("\nAI Services:")
    console.log(`  ✅ LLM Service: OpenRouter`)
    console.log(`  ✅ Embedding Model: OpenAI text-embedding-3-small`)
    console.log(`  ✅ Chat Model: Google Gemini 2.0 Flash`)
    
    if (allConfigured) {
      console.log("\n🎯 System ready!")
    } else {
      console.log("\n⚠️  Please configure missing environment variables")
    }
  })

// Test RAG functionality
program
  .command("test")
  .description("Test RAG search functionality")
  .argument("[query]", "Search query to test", "contract formation")
  .action(async (query) => {
    console.log(`🔍 Testing RAG search: "${query}"\n`)
    
    try {
      const { ragService } = await import("./lib/rag")
      
      const results = await ragService.search(query, {
        limit: 3,
        includeKnowledgeBase: true,
      })
      
      if (results.length === 0) {
        console.log("❌ No results found. Is the knowledge base seeded?")
        console.log("   Run: npm run cli seed")
        process.exit(1)
      }
      
      console.log(`✅ Found ${results.length} results:\n`)
      results.forEach((result, idx) => {
        console.log(`${idx + 1}. [Distance: ${result.distance.toFixed(4)}]`)
        console.log(`   Source: ${result.chunk.metadata.source_title || "Unknown"}`)
        console.log(`   Preview: ${result.chunk.text.substring(0, 100)}...\n`)
      })
    } catch (error: any) {
      console.error(`❌ Test failed: ${error.message}`)
      process.exit(1)
    }
  })

// Clear cache/reset
program
  .command("clear")
  .description("Clear all cached data (requires confirmation)")
  .option("-y, --yes", "Skip confirmation")
  .action(async (options) => {
    if (!options.yes) {
      console.log("⚠️  This will delete all embedded documents and chunks!")
      console.log("   To proceed, run: firmai-cli clear --yes")
      return
    }
    
    console.log("🧹 Clearing all cached data...")
    
    try {
      const { Client } = await import("pg")
      const url = new URL(process.env.SUPABASE_POSTGRES_URL_NON_POOLING!)
      const client = new Client({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        ssl: { rejectUnauthorized: false },
      })
      
      await client.connect()
      
      await client.query("DELETE FROM document_chunks")
      console.log("  ✓ Cleared document chunks")
      
      await client.query("DELETE FROM documents")
      console.log("  ✓ Cleared documents")
      
      await client.end()
      
      console.log("\n✅ Cache cleared successfully!")
    } catch (error: any) {
      console.error(`❌ Failed to clear cache: ${error.message}`)
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()

