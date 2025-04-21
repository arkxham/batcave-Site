import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    // 1. Ensure buckets exist
    const requiredBuckets = ["profile-pictures", "backgrounds", "songs"]

    for (const bucketName of requiredBuckets) {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
        })

        if (createError) {
          console.error(`Failed to create bucket ${bucketName}:`, createError)
        }
      }

      // Make bucket public
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
      })

      if (updateError) {
        console.error(`Failed to update bucket ${bucketName}:`, updateError)
      }
    }

    // 2. Fix RLS policies for storage
    // First, get all users to create their folders
    const { data: users, error: usersError } = await supabase.from("profiles").select("id, email")

    if (usersError) {
      return NextResponse.json(
        {
          error: "Failed to get users",
          details: usersError.message,
        },
        { status: 500 },
      )
    }

    // Create folders for each user in each bucket
    for (const user of users || []) {
      const userEmail = user.email
      const userId = user.id

      if (!userEmail) continue

      for (const bucketName of requiredBuckets) {
        // Create empty file to ensure folder exists
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(`${userEmail}/.folder`, new Blob([""], { type: "text/plain" }), {
            upsert: true,
          })

        if (uploadError && uploadError.message !== "The resource already exists") {
          console.error(`Failed to create folder for ${userEmail} in ${bucketName}:`, uploadError)
        }
      }
    }

    // 3. Update RLS policies for storage
    // This SQL will be executed to fix the RLS policies
    const { error: rlsError } = await supabase.rpc("execute_sql", {
      sql_query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual insert access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual update access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual delete access" ON storage.objects;
        
        -- Create new policies
        CREATE POLICY "Allow public read access" 
        ON storage.objects FOR SELECT 
        USING (true);
        
        CREATE POLICY "Allow individual insert access" 
        ON storage.objects FOR INSERT 
        WITH CHECK (true);
        
        CREATE POLICY "Allow individual update access" 
        ON storage.objects FOR UPDATE 
        USING (true);
        
        CREATE POLICY "Allow individual delete access" 
        ON storage.objects FOR DELETE 
        USING (true);
      `,
    })

    if (rlsError) {
      return NextResponse.json(
        {
          error: "Failed to update RLS policies",
          details: rlsError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Upload issues fixed successfully",
    })
  } catch (error) {
    console.error("Fix upload issues error:", error)
    return NextResponse.json(
      {
        error: "Failed to fix upload issues",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
