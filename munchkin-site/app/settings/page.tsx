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
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 gradient-text primary-gradient">Account Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center animate-fadeIn">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center animate-fadeIn">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        )}
        
        {/* Avatar Display */}
        <div className="flex flex-col items-center mb-6">
          {avatarUrl ? (
            <div className="group relative">
              <img 
                src={avatarUrl} 
                alt="Profile avatar" 
                className="w-28 h-28 rounded-full object-cover border-2 border-blue-300 dark:border-blue-600 shadow-md transition-all duration-300 hover:scale-105 avatar-ring"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium text-sm">Change Avatar</span>
              </div>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center shadow-inner border-2 border-blue-300 dark:border-blue-600">
              <span className="text-blue-500 dark:text-blue-300 font-medium">No Avatar</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-all duration-300"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-all duration-300"
          />
        </div>
        {/* Updated Avatar Input */}
        <div className="space-y-1">
          <Label htmlFor="avatar" className="text-gray-700 dark:text-gray-300">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-all duration-300"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : "Update Profile"}
        </Button>
      </form>
    </div>
  )
}
