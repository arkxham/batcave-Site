import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    console.log("Disabling storage RLS...")

    // Execute SQL to disable RLS for storage
    const { error } = await supabaseAdmin.rpc("execute_sql", {
      sql_query: `
        -- Disable RLS for storage.objects
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual insert access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual update access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow individual delete access" ON storage.objects;
        
        -- Create a policy that allows everything (as a fallback)
        CREATE POLICY "Allow everything" 
        ON storage.objects
        USING (true)
        WITH CHECK (true);
      `,
    })

    if (error) {
      console.error("Error disabling RLS:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Make all buckets public
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()

    for (const bucket of buckets || []) {
      await supabaseAdmin.storage.updateBucket(bucket.name, {
        public: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Storage RLS disabled successfully",
      buckets: buckets?.map((b) => b.name),
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
