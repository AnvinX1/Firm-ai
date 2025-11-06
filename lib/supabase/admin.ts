import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Create a Supabase admin client for use in scripts and background jobs
 * This uses the service role key for full access
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}




