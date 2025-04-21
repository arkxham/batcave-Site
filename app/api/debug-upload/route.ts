import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        {
          error: "Failed to list buckets",
          details: bucketsError.message,
        },
        { status: 500 },
      )
    }

    // Get bucket details and objects
    const bucketsWithObjects = await Promise.all(
      buckets.map(async (bucket) => {
        const { data: objects, error: objectsError } = await supabase.storage.from(bucket.name).list()

        return {
          bucket: bucket.name,
          objects: objectsError ? [] : objects,
          error: objectsError ? objectsError.message : null,
        }
      }),
    )

    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase.from("storage").select("*")

    return NextResponse.json({
      success: true,
      buckets,
      bucketsWithObjects,
      policies: policies || [],
      policiesError: policiesError?.message || null,
    })
  } catch (error) {
    console.error("Debug upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to debug upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
