import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const { bucket, filePath, adminKey } = await request.json()

    // Validate inputs
    if (!bucket || !filePath) {
      return NextResponse.json({ error: "Bucket and file path are required" }, { status: 400 })
    }

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the file
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
