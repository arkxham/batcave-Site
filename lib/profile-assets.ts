import { supabase } from "@/lib/supabase-client"
import { usernameToId } from "@/lib/user-id-mapping"

// Get profile picture URL for a username
export async function getProfilePictureUrl(username: string): Promise<string | null> {
  try {
    const userId = usernameToId[username.toLowerCase()]
    if (!userId) return null

    const { data } = supabase.storage.from("profile-pictures").getPublicUrl(`users/${userId}/pic.jpg`)

    return data?.publicUrl || null
  } catch (error) {
    console.error(`Error getting profile picture for ${username}:`, error)
    return null
  }
}

// Get background image URL for a username
export async function getBackgroundImageUrl(username: string): Promise<string | null> {
  try {
    const userId = usernameToId[username.toLowerCase()]
    if (!userId) return null

    const { data } = supabase.storage.from("backgrounds").getPublicUrl(`${userId}/background.jpg`)

    return data?.publicUrl || null
  } catch (error) {
    console.error(`Error getting background for ${username}:`, error)
    return null
  }
}

// Get background song URL for a username
export async function getBackgroundSongUrl(username: string): Promise<string | null> {
  try {
    const userId = usernameToId[username.toLowerCase()]
    if (!userId) return null

    const { data } = supabase.storage.from("songs").getPublicUrl(`${userId}/background-song.mp3`)

    return data?.publicUrl || null
  } catch (error) {
    console.error(`Error getting background song for ${username}:`, error)
    return null
  }
}
