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
      // 1. Make all buckets public
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

      // 2. Create permissive policies for all operations
      // First, delete existing policies
      const { error: deleteError } = await supabaseAdmin.from("storage.policies").delete().neq("id", 0)

      // Create a policy for all operations
      const policyName = "Allow all operations"
      const operations = ["SELECT", "INSERT", "UPDATE", "DELETE"]

      for (const operation of operations) {
        const { error } = await supabaseAdmin.from("storage.policies").insert({
          name: `${policyName} - ${operation}`,
          table: "objects",
          definition: "true",
          check: "true",
          operation: operation,
        })

        results.push({
          action: `Create ${operation} policy`,
          success: !error,
          error: error ? error.message : null,
        })
      }
    } catch (error: any) {
      results.push({
        action: "Error fixing uploads with simple approach",
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
