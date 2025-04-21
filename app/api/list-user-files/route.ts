import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { userId, bucket, adminKey } = await request.json()

    // Validate inputs
    if (!userId || !bucket) {
      return NextResponse.json({ error: "User ID and bucket are required" }, { status: 400 })
    }

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // List files in the user's folder
    const folderPath = `users/${userId}`
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(folderPath)

    if (error) {
      console.error("Error listing files:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URLs for all files
    const filesWithUrls = data.map((file) => {
      const filePath = `${folderPath}/${file.name}`
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

      return {
        ...file,
        publicUrl,
      }
    })

    return NextResponse.json({
      success: true,
      files: filesWithUrls,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
