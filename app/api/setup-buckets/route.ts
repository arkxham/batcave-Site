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

    // Create storage buckets
    const buckets = [
      { name: "profile-pictures", public: true },
      { name: "backgrounds", public: true },
      { name: "songs", public: true },
    ]

    const results = []

    // Create buckets
    for (const bucket of buckets) {
      try {
        // Create bucket if it doesn't exist
        const { data, error } = await supabaseAdmin.storage.createBucket(bucket.name, {
          public: bucket.public,
        })

        // If bucket already exists, update its public/private status
        if (error && error.message.includes("already exists")) {
          const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucket.name, {
            public: bucket.public,
          })

          results.push({
            bucket: bucket.name,
            success: !updateError,
            status: "updated",
            error: updateError ? updateError.message : null,
          })
        } else {
          results.push({
            bucket: bucket.name,
            success: !error,
            status: "created",
            error: error ? error.message : null,
          })
        }
      } catch (error: any) {
        results.push({
          bucket: bucket.name,
          success: false,
          error: error.message,
        })
      }
    }

    // Set up RLS policies for storage
    try {
      // Enable RLS on storage.objects
      await supabaseAdmin.query(`
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `)

      // Drop existing policies to avoid conflicts
      await supabaseAdmin.query(`
        DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Insert Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
      `)

      // Create policy for public read access to all buckets
      await supabaseAdmin.query(`
        CREATE POLICY "Public Read Access" 
        ON storage.objects 
        FOR SELECT 
        USING (true);
      `)

      // Create policy for authenticated users to insert files
      await supabaseAdmin.query(`
        CREATE POLICY "Auth Insert Access"
        ON storage.objects
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
      `)

      // Create policy for authenticated users to update files
      await supabaseAdmin.query(`
        CREATE POLICY "Auth Update Access"
        ON storage.objects
        FOR UPDATE
        USING (auth.role() = 'authenticated');
      `)

      // Create policy for authenticated users to delete files
      await supabaseAdmin.query(`
        CREATE POLICY "Auth Delete Access"
        ON storage.objects
        FOR DELETE
        USING (auth.role() = 'authenticated');
      `)

      results.push({
        policy: "Storage RLS policies",
        success: true,
        status: "created",
      })
    } catch (error: any) {
      results.push({
        policy: "Storage RLS policies",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
