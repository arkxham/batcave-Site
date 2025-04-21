import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = []

    try {
      // First, disable RLS temporarily to ensure we can reset everything
      await supabaseAdmin.query(`
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
      `)

      // Re-enable RLS
      await supabaseAdmin.query(`
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `)

      // Drop ALL existing policies to avoid conflicts
      await supabaseAdmin.query(`
        DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Insert Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Insert Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Delete Access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow authenticated users to insert backgrounds" ON storage.objects;
        DROP POLICY IF EXISTS "Allow anyone to insert backgrounds" ON storage.objects;
      `)

      // Create a single, very permissive policy for all operations
      const { error: permissivePolicyError } = await supabaseAdmin.query(`
        CREATE POLICY "Allow all operations for authenticated users"
        ON storage.objects
        FOR ALL
        USING (true)
        WITH CHECK (true);
      `)

      results.push({
        policy: "Permissive storage policy",
        success: !permissivePolicyError,
        error: permissivePolicyError ? permissivePolicyError.message : null,
      })
    } catch (error: any) {
      results.push({
        policy: "Error setting up storage RLS policies",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
