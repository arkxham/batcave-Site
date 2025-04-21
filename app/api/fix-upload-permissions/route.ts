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

      if (buckets) {
        for (const bucket of buckets) {
          const { error } = await supabaseAdmin.storage.updateBucket(bucket.name, {
            public: true,
          })

          results.push({
            bucket: bucket.name,
            action: "Make bucket public",
            success: !error,
            error: error ? error.message : null,
          })
        }
      }

      // Create a function to grant permissions
      const { data: grantData, error: grantError } = await supabaseAdmin.rpc("grant_storage_permissions")

      results.push({
        action: "Grant permissions to authenticated users",
        success: !grantError,
        error: grantError ? grantError.message : null,
      })
    } catch (error: any) {
      results.push({
        action: "Error fixing upload permissions",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
