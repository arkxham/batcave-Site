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
      // Make all buckets public
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()

      if (buckets && buckets.length > 0) {
        for (const bucket of buckets) {
          // Update bucket to be public
          const { error } = await supabaseAdmin.storage.updateBucket(bucket.name, {
            public: true,
            allowedMimeTypes: null,
            fileSizeLimit: null,
          })

          results.push({
            bucket: bucket.name,
            action: "Make bucket public",
            success: !error,
            error: error ? error.message : null,
          })
        }
      } else {
        results.push({
          action: "List buckets",
          success: false,
          error: "No buckets found",
        })
      }
    } catch (error: any) {
      results.push({
        action: "Error making buckets public",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
