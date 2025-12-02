import { invoke } from '@tauri-apps/api/core';

/**
 * Ingests a document into the local RAG database.
 * @param path Absolute path to the file.
 * @returns Status message.
 */
export async function ingestDocument(path: string): Promise<string> {
  return await invoke('ingest_document', { path });
}

/**
 * Queries the RAG database for relevant context.
 * @param query The search query.
 * @param limit Number of results to return.
 * @returns Array of matching text chunks.
 */
export async function queryContext(query: string, limit: number = 5): Promise<string[]> {
  return await invoke('query_context', { query, limit });
}
