"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import VoiceRecognitionForm from "@/components/voice-recognition-form"

export default function VoiceRecognitionPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Voice Recognition</h1>

      <Card>
        <CardHeader>
          <CardTitle>Voice Recognition</CardTitle>
          <CardDescription>Record or upload voice for speech-to-text and speaker identification</CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceRecognitionForm />
        </CardContent>
      </Card>
    </div>
  )
}

