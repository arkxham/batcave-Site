import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, adminKey } = await request.json()

    // Validate inputs
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // List of buckets where we need to create user folders
    const buckets = ["profile-pictures", "backgrounds", "songs", "twitter", "twitch", "github", "steam"]
    const results = []

    // Create a placeholder file in each user folder to ensure the folder exists
    for (const bucket of buckets) {
      try {
        const folderPath = `users/${userId}`
        const placeholderPath = `${folderPath}/.placeholder`

        // Create an empty file to ensure the folder exists
        const { error } = await supabaseAdmin.storage.from(bucket).upload(placeholderPath, new Uint8Array(0), {
          contentType: "text/plain",
          upsert: true,
        })

        results.push({
          bucket,
          success: !error,
          error: error ? error.message : null,
        })
      } catch (error: any) {
        results.push({
          bucket,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
