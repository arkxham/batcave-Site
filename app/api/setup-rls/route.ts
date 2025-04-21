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

    // Set up RLS policies
    const results = []

    try {
      // Enable RLS on profiles table
      const { error: rlsError } = await supabaseAdmin.query(`
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      `)

      if (rlsError && !rlsError.message.includes("already enabled")) {
        throw rlsError
      }

      // Create policy for users to read any profile
      const { error: readPolicyError } = await supabaseAdmin.query(`
        DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
        CREATE POLICY "Anyone can read profiles" 
        ON profiles 
        FOR SELECT 
        USING (true);
      `)

      results.push({
        policy: "Anyone can read profiles",
        success: !readPolicyError,
        error: readPolicyError ? readPolicyError.message : null,
      })

      // Create policy for users to update only their own profile
      const { error: updatePolicyError } = await supabaseAdmin.query(`
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
        CREATE POLICY "Users can update their own profile" 
        ON profiles 
        FOR UPDATE 
        USING (auth.uid() = id);
      `)

      results.push({
        policy: "Users can update their own profile",
        success: !updatePolicyError,
        error: updatePolicyError ? updatePolicyError.message : null,
      })

      // Set up storage RLS policies
      // Enable RLS on storage.objects
      const { error: storageRlsError } = await supabaseAdmin.query(`
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `)

      if (storageRlsError && !storageRlsError.message.includes("already enabled")) {
        throw storageRlsError
      }

      // For all buckets - allow public read access and authenticated write access
      const { error: bucketPolicyError } = await supabaseAdmin.query(`
        -- Drop existing policies first to avoid conflicts
        DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Insert Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
        
        -- Create policy for public read access to all buckets
        CREATE POLICY "Public Read Access" 
        ON storage.objects 
        FOR SELECT 
        USING (true);
        
        -- Create policy for authenticated users to insert files
        CREATE POLICY "Auth Insert Access"
        ON storage.objects
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
        
        -- Create policy for authenticated users to update files
        CREATE POLICY "Auth Update Access"
        ON storage.objects
        FOR UPDATE
        USING (auth.role() = 'authenticated');
        
        -- Create policy for authenticated users to delete files
        CREATE POLICY "Auth Delete Access"
        ON storage.objects
        FOR DELETE
        USING (auth.role() = 'authenticated');
      `)

      results.push({
        policy: "Storage bucket policies",
        success: !bucketPolicyError,
        error: bucketPolicyError ? bucketPolicyError.message : null,
      })
    } catch (error: any) {
      results.push({
        policy: "Error setting up RLS policies",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
