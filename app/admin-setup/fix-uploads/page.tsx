"use client"

import { useState } from "react"

export default function FixUploadsPage() {
  const [adminKey, setAdminKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDisableRLS = async () => {
    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/disable-storage-rls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable RLS")
      }

      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFixPermissions = async () => {
    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/fix-upload-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix permissions")
      }

      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Fix Upload Permissions</h1>

        <div className="mb-6">
          <label htmlFor="adminKey" className="block text-sm font-medium text-gray-300 mb-2">
            Admin Setup Key
          </label>
          <input
            type="password"
            id="adminKey"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            placeholder="Enter your admin setup key"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-lg font-medium mb-2">Option 1: Disable RLS (Recommended)</h2>
            <p className="mb-4 text-gray-300">
              This will completely disable Row Level Security for storage, allowing all operations without restrictions.
            </p>
            <button
              onClick={handleDisableRLS}
              disabled={loading}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Disable Storage RLS"}
            </button>
          </div>

          <div className="bg-gray-700 p-4 rounded">
            <h2 className="text-lg font-medium mb-2">Option 2: Fix Bucket Permissions</h2>
            <p className="mb-4 text-gray-300">
              This will make all buckets public and grant all permissions to authenticated users.
            </p>
            <button
              onClick={handleFixPermissions}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Fix Bucket Permissions"}
            </button>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">{error}</div>}

        {results && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Results:</h3>
            <div className="bg-gray-900 p-4 rounded overflow-auto max-h-60">
              <pre className="text-sm text-gray-300">{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded">
          <h3 className="text-lg font-medium mb-2">Important Note</h3>
          <p className="text-yellow-200 text-sm">
            These options will remove security restrictions on your storage buckets. This is fine for development and
            testing, but should be properly configured before deploying to production.
          </p>
        </div>
      </div>
    </div>
  )
}
