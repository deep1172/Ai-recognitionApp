"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Camera, FileText, Mic, Video, User, History, Settings } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || "User"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              History
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Face</CardTitle>
            <CardDescription>Face matching & recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Button asChild>
                <Link href="/face-recognition">
                  <Camera className="h-4 w-4 mr-2" />
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Text</CardTitle>
            <CardDescription>Text analysis & processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Button asChild>
                <Link href="/text-analysis">
                  <FileText className="h-4 w-4 mr-2" />
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Voice</CardTitle>
            <CardDescription>Voice recognition & analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Button asChild>
                <Link href="/voice-recognition">
                  <Mic className="h-4 w-4 mr-2" />
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Video</CardTitle>
            <CardDescription>Video processing & analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <Button asChild>
                <Link href="/video-processing">
                  <Video className="h-4 w-4 mr-2" />
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent processing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Face Recognition</p>
                    <p className="text-sm text-gray-500">2 minutes ago</p>
                  </div>
                  <span className="text-green-600 text-sm">Completed</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Text Analysis</p>
                    <p className="text-sm text-gray-500">1 hour ago</p>
                  </div>
                  <span className="text-green-600 text-sm">Completed</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Video Processing</p>
                    <p className="text-sm text-gray-500">Yesterday</p>
                  </div>
                  <span className="text-green-600 text-sm">Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Processed Images</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Text Analyses</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Voice Recordings</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Videos Processed</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

