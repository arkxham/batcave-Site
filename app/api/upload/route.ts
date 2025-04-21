import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const email = formData.get("email") as string
    const fileName = (formData.get("fileName") as string) || file.name

    console.log("Upload request received:", { bucket, email, fileName })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: "No bucket specified" }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: "No email specified" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: "Failed to list buckets", details: bucketsError.message }, { status: 500 })
    }

    const bucketExists = buckets.some((b) => b.name === bucket)

    if (!bucketExists) {
      console.log(`Bucket ${bucket} does not exist, creating it...`)
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
      })

      if (createError) {
        console.error(`Failed to create bucket ${bucket}:`, createError)
        return NextResponse.json({ error: "Failed to create bucket", details: createError.message }, { status: 500 })
      }
    }

    // Ensure the bucket is public
    const { error: updateError } = await supabase.storage.updateBucket(bucket, {
      public: true,
    })

    if (updateError) {
      console.error(`Failed to update bucket ${bucket}:`, updateError)
    }

    // Create path for the file
    const filePath = `${email}/${fileName}`
    console.log(`Uploading to path: ${filePath} in bucket: ${bucket}`)

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: true,
      cacheControl: "0",
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    console.log("Upload successful, public URL:", publicUrl)

    // If this is a profile picture or background, update the user's profile
    if (bucket === "profile-pictures" || bucket === "backgrounds") {
      const fieldToUpdate = bucket === "profile-pictures" ? "avatar_url" : "background_url"

      // Add cache-busting parameter to URL
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ [fieldToUpdate]: cacheBustedUrl })
        .eq("email", email)

      if (updateError) {
        console.error("Failed to update profile:", updateError)
        return NextResponse.json({
          success: true,
          url: publicUrl,
          warning: "File uploaded but failed to update profile",
          details: updateError.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data?.path || filePath,
    })
  } catch (error) {
    console.error("Upload handler error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
