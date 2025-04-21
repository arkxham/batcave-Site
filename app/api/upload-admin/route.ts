import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    console.log("Admin upload endpoint called")

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const userId = formData.get("userId") as string
    const email = formData.get("email") as string
    const adminKey = formData.get("adminKey") as string

    console.log("Upload request received:", { bucket, userId, email })

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: "No bucket specified" }, { status: 400 })
    }

    // Check if the bucket exists, if not create it
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: "Failed to list buckets" }, { status: 500 })
    }

    const bucketExists = buckets.some((b) => b.name === bucket)

    if (!bucketExists) {
      console.log(`Creating bucket: ${bucket}`)
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return NextResponse.json({ error: "Failed to create bucket" }, { status: 500 })
      }
    }

    // Make sure the bucket is public
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucket, {
      public: true,
    })

    if (updateError) {
      console.error("Error updating bucket:", updateError)
    }

    // Generate a unique file name based on the file type
    let fileName = file.name
    if (bucket === "profile-pictures") {
      fileName = "profile.jpg"
    } else if (bucket === "backgrounds") {
      fileName = "background.png"
    }

    // Create a folder path based on userId or email
    let folderPath = ""
    if (userId) {
      folderPath = `users/${userId}`
    } else if (email) {
      folderPath = email
    } else {
      folderPath = "uploads"
    }

    const filePath = `${folderPath}/${fileName}`
    console.log(`Uploading to path: ${filePath}`)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload file to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: "0", // No cache
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

    // Add cache busting parameter
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

    console.log("Upload successful, URL:", cacheBustedUrl)

    // If this is a profile picture, update the user's profile
    if (bucket === "profile-pictures" && userId) {
      try {
        // Check if the profile has avatar_url or profile_picture_url
        const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

        if (profile) {
          const updates: any = {}

          // Update the appropriate column based on what exists in the schema
          if ("avatar_url" in profile) {
            updates.avatar_url = cacheBustedUrl
          } else if ("profile_picture_url" in profile) {
            updates.profile_picture_url = cacheBustedUrl
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId)

            if (updateError) {
              console.error("Error updating profile:", updateError)
            } else {
              console.log("Profile updated with new image URL")
            }
          }
        }
      } catch (err) {
        console.error("Error updating profile after upload:", err)
      }
    }

    return NextResponse.json({
      success: true,
      url: cacheBustedUrl,
      path: filePath,
      bucket: bucket,
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
