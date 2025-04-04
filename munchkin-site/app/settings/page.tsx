"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { pb } from "@/lib/pocketbase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Define a type that extends the base user type with avatar
interface UserWithAvatar {
  id: string
  email: string
  name: string
  avatar?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      
      // Cast user to UserWithAvatar type and check for avatar
      const userWithAvatar = user as unknown as UserWithAvatar
      if (userWithAvatar.avatar) {
        setAvatarUrl(
          pb.files.getUrl(userWithAvatar, userWithAvatar.avatar, { thumb: '100x100' })
        )
      }
    }
  }, [user])

  // Handle avatar file selection and create preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setAvatar(file)
    
    if (file) {
      // Create a preview URL for the selected file
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)
      
      // Clean up the object URL when component unmounts or when avatar changes
      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      if (!user) throw new Error("User not found")
      // Prepare update payload
      const updateData: { name: string; email: string; avatar?: File } = {
        name,
        email,
      }
      if (avatar) {
        updateData.avatar = avatar
      }
      await pb.collection("users").update(user.id, updateData)
      setMessage("Profile updated successfully.")
    } catch (err: any) {
      setError(err.message || "Update failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="p-2 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        
        {/* Avatar Display */}
        <div className="flex flex-col items-center mb-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Avatar</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* Updated Avatar Input */}
        <div className="space-y-1">
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  )
}
