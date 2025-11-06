/**
 * FIRM AI Setup Script
 * Complete setup for the RAG backend
 */

import * as dotenv from "dotenv"
import { createAdminClient } from "../lib/supabase/admin"
import { documentProcessor } from "../lib/document-processor"
import { randomUUID } from "crypto"

dotenv.config()

async function setup() {
  console.log("🚀 FIRM AI Backend Setup\n")
  
  // Check environment
  const requiredEnvVars = [
    "OPENROUTER_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_POSTGRES_URL_NON_POOLING",
  ]
  
  let missingVars: string[] = []
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVars.forEach(v => console.error(`   - ${v}`))
    process.exit(1)
  }
  
  console.log("✅ Environment variables configured\n")
  
  // Check database connection
  console.log("📊 Checking database connection...")
  const { Client } = await import("pg")
  const postgresUrl = process.env.SUPABASE_POSTGRES_URL_NON_POOLING!
  
  const url = new URL(postgresUrl)
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false },
  })
  
  try {
    await client.connect()
    console.log("✅ Database connected\n")
    
    // Check for pgvector extension
    const { rows: extRows } = await client.query(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'"
    )
    
    if (extRows.length === 0) {
      console.log("📦 Installing pgvector extension...")
      await client.query("CREATE EXTENSION IF NOT EXISTS vector")
      console.log("✅ pgvector installed\n")
    } else {
      console.log("✅ pgvector already installed\n")
    }
    
    // Check for tables
    const { rows: tableRows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('documents', 'document_chunks')
    `)
    
    if (tableRows.length < 2) {
      console.log("📋 Creating database tables...")
      
      // Read migration file
      const migrationSQL = await import("fs/promises").then(fs => 
        fs.readFile("scripts/004-rag-schema.sql", "utf8")
      )
      
      await client.query(migrationSQL)
      console.log("✅ Tables created\n")
    } else {
      console.log("✅ Tables already exist\n")
    }
    
    await client.end()
  } catch (error: any) {
    console.error(`❌ Database error: ${error.message}`)
    process.exit(1)
  }
  
  // Check if knowledge base needs seeding
  console.log("📚 Checking knowledge base...")
  const supabase = createAdminClient()
  
  const { count: docCount, error: docsError } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("document_type", "knowledge_base")
  
  if (docsError) {
    console.error(`❌ Error checking documents: ${docsError.message}`)
    process.exit(1)
  }
  
  if (docCount >= 6) {
    console.log(`✅ Knowledge base already seeded (${docCount} documents)`)
  } else {
    console.log("🌱 Seeding knowledge base...")
    
    const { legalKnowledgeBase } = await import("./seed-legal-knowledge")
    
    for (const item of legalKnowledgeBase) {
      console.log(`  Processing: ${item.title}`)
      
      const documentId = randomUUID()
      
      const { error: docError } = await supabase
        .from("documents")
        .insert({
          id: documentId,
          document_type: "knowledge_base",
          title: item.title,
          embedding_status: "processing",
        })
      
      if (docError) {
        console.error(`    ❌ Error: ${docError.message}`)
        continue
      }
      
      await documentProcessor.processAndEmbed(
        item.content,
        {
          title: item.title,
          document_type: "knowledge_base",
          document_id: documentId,
        },
        "legal-knowledge"
      )
      
      await supabase
        .from("documents")
        .update({ embedding_status: "completed" })
        .eq("id", documentId)
      
      console.log(`    ✅ Completed`)
    }
    
    console.log("✅ Knowledge base seeded\n")
  }
  
  console.log("🎉 Setup complete!")
  console.log("\nNext steps:")
  console.log("  1. Run: pnpm cli start")
  console.log("  2. Open: http://localhost:3001")
  console.log("  3. Test: pnpm cli test \"contract law\"")
  
  process.exit(0)
}

setup()

