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

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
