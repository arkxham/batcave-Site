import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// This is a one-time setup route to create the predefined users
export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    // This is a simple protection to prevent unauthorized access
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = [
      { email: "rtmonly@example.com", username: "rtmonly" },
      { email: "lydell@example.com", username: "lydell" },
      { email: "arkham@example.com", username: "Arkham" },
      { email: "akaoutlaw@example.com", username: "akaoutlaw" },
      { email: "junz@example.com", username: "junz" },
      { email: "jack@example.com", username: "jack" },
      { email: "clipzy@example.com", username: "clipzy" },
      { email: "mocha@example.com", username: "mocha" },
      { email: "nemo@example.com", username: "nemo" },
      { email: "said@example.com", username: "said" },
      { email: "slos@example.com", username: "slos" },
    ]

    const results = []

    for (const user of users) {
      try {
        // Generate a random password
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

        // Create user in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true,
        })

        if (error) {
          results.push({ username: user.username, success: false, error: error.message })
          continue
        }

        // Update the username in the profiles table
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ username: user.username })
          .eq("id", data.user.id)

        results.push({
          username: user.username,
          success: !profileError,
          error: profileError ? profileError.message : null,
        })
      } catch (error: any) {
        results.push({ username: user.username, success: false, error: error.message })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
