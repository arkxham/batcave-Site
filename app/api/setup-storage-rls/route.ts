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
      // Enable RLS on storage.objects
      const { error: storageRlsError } = await supabaseAdmin.query(`
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `)

      if (storageRlsError && !storageRlsError.message.includes("already enabled")) {
        throw storageRlsError
      }

      // Drop existing policies to avoid conflicts
      await supabaseAdmin.query(`
        DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Insert Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Individual User Delete Access" ON storage.objects;
      `)

      // Create policy for public read access to all buckets
      const { error: readPolicyError } = await supabaseAdmin.query(`
        CREATE POLICY "Public Read Access" 
        ON storage.objects 
        FOR SELECT 
        USING (true);
      `)

      results.push({
        policy: "Public Read Access",
        success: !readPolicyError,
        error: readPolicyError ? readPolicyError.message : null,
      })

      // Create policy for authenticated users to insert files
      const { error: insertPolicyError } = await supabaseAdmin.query(`
        CREATE POLICY "Individual User Insert Access"
        ON storage.objects
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
      `)

      results.push({
        policy: "Individual User Insert Access",
        success: !insertPolicyError,
        error: insertPolicyError ? insertPolicyError.message : null,
      })

      // Create policy for authenticated users to update files
      const { error: updatePolicyError } = await supabaseAdmin.query(`
        CREATE POLICY "Individual User Update Access"
        ON storage.objects
        FOR UPDATE
        USING (auth.role() = 'authenticated');
      `)

      results.push({
        policy: "Individual User Update Access",
        success: !updatePolicyError,
        error: updatePolicyError ? updatePolicyError.message : null,
      })

      // Create policy for authenticated users to delete files
      const { error: deletePolicyError } = await supabaseAdmin.query(`
        CREATE POLICY "Individual User Delete Access"
        ON storage.objects
        FOR DELETE
        USING (auth.role() = 'authenticated');
      `)

      results.push({
        policy: "Individual User Delete Access",
        success: !deletePolicyError,
        error: deletePolicyError ? deletePolicyError.message : null,
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
