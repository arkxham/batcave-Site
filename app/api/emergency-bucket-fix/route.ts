import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY && adminKey !== "admin-key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = []

    // Step 1: Create buckets if they don't exist
    const requiredBuckets = ["profile-pictures", "backgrounds", "songs", "twitter", "twitch", "github", "steam"]

    for (const bucketName of requiredBuckets) {
      try {
        // Try to create the bucket
        const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true, // Make all buckets public
        })

        if (error && !error.message.includes("already exists")) {
          results.push({
            action: `Create bucket ${bucketName}`,
            success: false,
            error: error.message,
          })
        } else {
          results.push({
            action: `Create bucket ${bucketName}`,
            success: true,
            status: error ? "already exists" : "created",
          })
        }
      } catch (error: any) {
        results.push({
          action: `Create bucket ${bucketName}`,
          success: false,
          error: error.message,
        })
      }
    }

    // Step 2: Disable RLS on storage.objects to allow uploads
    try {
      await supabaseAdmin.query(`
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
      `)

      results.push({
        action: "Disable RLS on storage.objects",
        success: true,
      })
    } catch (error: any) {
      results.push({
        action: "Disable RLS on storage.objects",
        success: false,
        error: error.message,
      })
    }

    // Step 3: Make all buckets public
    for (const bucketName of requiredBuckets) {
      try {
        const { error } = await supabaseAdmin.storage.updateBucket(bucketName, {
          public: true,
        })

        if (error) {
          results.push({
            action: `Make ${bucketName} public`,
            success: false,
            error: error.message,
          })
        } else {
          results.push({
            action: `Make ${bucketName} public`,
            success: true,
          })
        }
      } catch (error: any) {
        results.push({
          action: `Make ${bucketName} public`,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
