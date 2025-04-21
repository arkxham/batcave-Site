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

    // List of buckets to check
    const buckets = ["profile-pictures", "backgrounds", "songs", "twitter", "twitch", "github", "steam"]
    const userFiles: Record<string, any> = {}

    // Get files from each bucket
    for (const bucket of buckets) {
      try {
        const folderPath = `users/${userId}`
        const { data, error } = await supabaseAdmin.storage.from(bucket).list(folderPath)

        if (error) {
          console.error(`Error listing files in ${bucket}:`, error)
          continue
        }

        // Filter out placeholder files and get public URLs
        const files = data
          .filter((file) => !file.name.startsWith(".placeholder"))
          .map((file) => {
            const filePath = `${folderPath}/${file.name}`
            const {
              data: { publicUrl },
            } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

            return {
              ...file,
              publicUrl,
              path: filePath,
              bucket,
            }
          })

        userFiles[bucket] = files
      } catch (error: any) {
        console.error(`Error getting files from ${bucket}:`, error.message)
      }
    }

    return NextResponse.json({
      success: true,
      files: userFiles,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
