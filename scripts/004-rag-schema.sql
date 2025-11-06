-- RAG System Schema
-- Enable vector extension for similarity search using pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table: Track document metadata and embedding status
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('user_case', 'knowledge_base')),
  title TEXT NOT NULL,
  original_text TEXT, -- Store original document text for reference
  embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
  total_chunks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document chunks table: Store chunks with vector embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL, -- Order of chunk in document
  chunk_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  metadata JSONB, -- Additional metadata like section, page, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(embedding_status);
CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_chunks_document_index ON document_chunks(document_id, chunk_index);

-- Vector similarity index using HNSW for fast approximate nearest neighbor search
CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Function to search similar vectors
CREATE OR REPLACE FUNCTION search_similar_vectors(
  query_embedding vector(1536),
  match_type TEXT DEFAULT 'all',
  match_user_id UUID DEFAULT NULL,
  match_case_ids UUID[] DEFAULT NULL,
  result_limit INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.chunk_text,
    dc.chunk_index,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE
    (match_type = 'all' OR dc.metadata->>'document_type' = match_type)
    AND (match_user_id IS NULL OR dc.metadata->>'user_id' = match_user_id::TEXT)
    AND (match_case_ids IS NULL OR dc.metadata->>'case_id' = ANY(SELECT unnest(match_case_ids)::TEXT))
    AND 1 - (dc.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT result_limit;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

