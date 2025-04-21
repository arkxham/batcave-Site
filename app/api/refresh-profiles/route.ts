import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, avatar_url, background_url")

    if (profilesError) {
      return NextResponse.json(
        {
          error: "Failed to get profiles",
          details: profilesError.message,
        },
        { status: 500 },
      )
    }

    const updates = []

    // For each profile, check if their files exist and update URLs with cache busting
    for (const profile of profiles || []) {
      if (!profile.email) continue

      // Check profile picture
      if (profile.avatar_url) {
        const { data: avatarExists } = await supabase.storage.from("profile-pictures").list(profile.email)

        if (avatarExists && avatarExists.length > 0) {
          // Get the file name from the URL
          const urlParts = profile.avatar_url.split("/")
          const fileName = urlParts[urlParts.length - 1].split("?")[0]

          // Get a fresh public URL with cache busting
          const {
            data: { publicUrl },
          } = supabase.storage.from("profile-pictures").getPublicUrl(`${profile.email}/${fileName}`)

          const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

          // Update the profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: cacheBustedUrl })
            .eq("id", profile.id)

          if (updateError) {
            console.error(`Failed to update avatar_url for ${profile.email}:`, updateError)
          } else {
            updates.push(`Updated avatar_url for ${profile.email}`)
          }
        }
      }

      // Check background
      if (profile.background_url) {
        const { data: backgroundExists } = await supabase.storage.from("backgrounds").list(profile.email)

        if (backgroundExists && backgroundExists.length > 0) {
          // Get the file name from the URL
          const urlParts = profile.background_url.split("/")
          const fileName = urlParts[urlParts.length - 1].split("?")[0]

          // Get a fresh public URL with cache busting
          const {
            data: { publicUrl },
          } = supabase.storage.from("backgrounds").getPublicUrl(`${profile.email}/${fileName}`)

          const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

          // Update the profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ background_url: cacheBustedUrl })
            .eq("id", profile.id)

          if (updateError) {
            console.error(`Failed to update background_url for ${profile.email}:`, updateError)
          } else {
            updates.push(`Updated background_url for ${profile.email}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile data refreshed successfully",
      updates,
    })
  } catch (error) {
    console.error("Refresh profiles error:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh profiles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
