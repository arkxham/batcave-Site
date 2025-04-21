"use client"

import { useState } from "react"

export default function AdminSetupPage() {
  const [adminKey, setAdminKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"users" | "storage">("users")

  const handleCreateUsers = async () => {
    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create users")
      }

      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupStorage = async () => {
    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/setup-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up storage buckets")
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
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>

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

        <div className="flex mb-6 border-b border-gray-700">
          <button
            className={`py-2 px-4 ${
              activeTab === "users" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Create Users
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === "storage" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("storage")}
          >
            Setup Storage
          </button>
        </div>

        {activeTab === "users" && (
          <div>
            <p className="mb-4 text-gray-300">
              This will create the predefined users in Supabase with their respective credentials.
            </p>
            <button
              onClick={handleCreateUsers}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Creating Users..." : "Create Users"}
            </button>
          </div>
        )}

        {activeTab === "storage" && (
          <div>
            <p className="mb-4 text-gray-300">
              This will create the necessary storage buckets for profile pictures, backgrounds, and songs.
            </p>
            <button
              onClick={handleSetupStorage}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Setting Up Storage..." : "Setup Storage Buckets"}
            </button>
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">{error}</div>}

        {results && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Results:</h3>
            <div className="bg-gray-900 p-4 rounded overflow-auto max-h-60">
              <pre className="text-sm text-gray-300">{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
