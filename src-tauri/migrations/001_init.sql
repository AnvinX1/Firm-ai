-- SQLite Local Cache Schema
-- Mirrors critical Supabase tables for offline functionality

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    case_name TEXT,
    file_url TEXT,
    issue TEXT,
    rule TEXT,
    analysis TEXT,
    conclusion TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    case_id TEXT,
    document_type TEXT NOT NULL CHECK (document_type IN ('user_case', 'knowledge_base')),
    title TEXT NOT NULL,
    original_text TEXT,
    embedding_status TEXT DEFAULT 'pending',
    total_chunks INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Document chunks table (cached from Supabase)
CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    metadata TEXT, -- JSON string
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Flashcard sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    set_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0,
    FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
);

-- Mock tests table
CREATE TABLE IF NOT EXISTS mock_tests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions TEXT NOT NULL, -- JSON string
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    score REAL,
    total_questions INTEGER,
    answers TEXT, -- JSON string
    completed_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0,
    FOREIGN KEY (test_id) REFERENCES mock_tests(id) ON DELETE CASCADE
);

-- Study plans table
CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    progress REAL DEFAULT 0,
    tasks TEXT, -- JSON string
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    dirty INTEGER DEFAULT 0
);

-- Sync queue table
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('insert', 'update', 'delete')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON string
    created_at TEXT NOT NULL,
    attempts INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_synced ON cases(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_synced ON documents(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_index ON document_chunks(document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user ON flashcard_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_synced ON flashcard_sets(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_flashcards_set ON flashcards(set_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_synced ON flashcards(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_mock_tests_user ON mock_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_synced ON mock_tests(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_synced ON test_results(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_synced ON study_plans(synced, dirty);

CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_attempts ON sync_queue(attempts);

