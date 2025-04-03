"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import FaceMatchingForm from "@/components/face-matching-form"
import FaceRecognitionForm from "@/components/face-recognition-form"
import FaceGallery from "@/components/face-gallery"

export default function FaceRecognitionPage() {
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
      <h1 className="text-3xl font-bold mb-8">Face Recognition</h1>

      <Tabs defaultValue="matching" className="mb-12">
        <TabsList className="grid grid-cols-2 mb-8 w-full md:w-[400px]">
          <TabsTrigger value="matching">Face Matching</TabsTrigger>
          <TabsTrigger value="recognition">Face Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Face Matching</CardTitle>
              <CardDescription>Upload two images to check if they contain the same person</CardDescription>
            </CardHeader>
            <CardContent>
              <FaceMatchingForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition">
          <Card>
            <CardHeader>
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>Upload an image to identify a person from your database</CardDescription>
            </CardHeader>
            <CardContent>
              <FaceRecognitionForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Face Gallery</CardTitle>
            <CardDescription>Manage your face database for recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <FaceGallery />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

