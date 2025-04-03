"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X, Play, Pause, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

type VideoAnalysisType = "object-detection" | "action-recognition" | "scene-understanding" | "video-summarization"

export default function VideoProcessingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<VideoAnalysisType>("object-detection")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Ensure the hook is always called, even when loading or not authenticated
  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return // Do nothing while loading or not authenticated
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const file = e.target.files[0]
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      })
      return
    }

    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }

  const handleAnalysisTypeChange = (value: string) => {
    setAnalysisType(value as VideoAnalysisType)
  }

  const removeVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoFile(null)
    setVideoUrl(null)
    setResult(null)
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current

    const handleEnded = () => {
      setIsPlaying(false)
    }

    if (videoElement) {
      videoElement.addEventListener("ended", handleEnded)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      toast({
        title: "No video",
        description: "Please upload a video for analysis",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("video", videoFile)
      formData.append("type", analysisType)

      // In a real implementation, this would be your Flask API endpoint
      const endpoint = "/api/analyze-video"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate response based on analysis type
      let simulatedResult

      switch (analysisType) {
        case "object-detection":
          simulatedResult = {
            objects: [
              { label: "Person", confidence: 0.95, count: 2 },
              { label: "Car", confidence: 0.87, count: 1 },
              { label: "Dog", confidence: 0.82, count: 1 },
            ],
            frames: 120,
            duration: "00:04:30",
            model: "DETR Transformer",
          }
          break

        case "action-recognition":
          simulatedResult = {
            actions: [
              { label: "Walking", timeframe: "00:00:10 - 00:00:45", confidence: 0.91 },
              { label: "Running", timeframe: "00:01:20 - 00:01:55", confidence: 0.88 },
              { label: "Sitting", timeframe: "00:02:30 - 00:03:15", confidence: 0.94 },
            ],
            model: "TimeSformer",
          }
          break

        case "scene-understanding":
          simulatedResult = {
            scenes: [
              { label: "Indoor - Living Room", timeframe: "00:00:00 - 00:01:30", confidence: 0.89 },
              { label: "Outdoor - Street", timeframe: "00:01:31 - 00:03:45", confidence: 0.92 },
            ],
            lighting: "Well lit",
            model: "ViViT Transformer",
          }
          break

        case "video-summarization":
          simulatedResult = {
            summary:
              "The video shows two people walking with a dog on a street. They stop by a car, get in, and drive away. The scene changes to an indoor living room where they sit and talk.",
            keyFrames: [10, 45, 90, 150, 210],
            model: "Video-BART Transformer",
          }
          break
      }

      setResult(simulatedResult)

      toast({
        title: "Processing complete",
        description: "Your video has been analyzed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Video Processing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Video Analysis</CardTitle>
          <CardDescription>
            Upload a video for object detection, action recognition, scene understanding, or summarization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select value={analysisType} onValueChange={handleAnalysisTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="object-detection">Object Detection</SelectItem>
                  <SelectItem value="action-recognition">Action Recognition</SelectItem>
                  <SelectItem value="scene-understanding">Scene Understanding</SelectItem>
                  <SelectItem value="video-summarization">Video Summarization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Video Input</Label>

              {videoUrl ? (
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">{videoFile?.name || "Uploaded Video"}</span>
                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={removeVideo}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="aspect-video bg-black rounded-md overflow-hidden mb-4">
                    <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" controls={false} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={togglePlayback}>
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Label
                  htmlFor="video-upload"
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Video className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload video file</span>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!videoFile || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Analyze Video"
              )}
            </Button>

            {result && (
              <Card className="p-4 mt-4">
                <div>
                  {analysisType === "object-detection" && (
                    <>
                      <h3 className="text-lg font-medium mb-2">Object Detection Results</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Detected Objects:</p>
                          <div className="space-y-2">
                            {result.objects.map((obj: any, index: number) => (
                              <div key={index} className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center">
                                  <span className="font-medium">{obj.label}</span>
                                  <span className="ml-2 text-sm text-gray-500">({obj.count})</span>
                                </div>
                                <span className="text-sm">{(obj.confidence * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Frames analyzed: {result.frames}</span>
                          <span>Duration: {result.duration}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {analysisType === "action-recognition" && (
                    <>
                      <h3 className="text-lg font-medium mb-2">Action Recognition Results</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Detected Actions:</p>
                          <div className="space-y-2">
                            {result.actions.map((action: any, index: number) => (
                              <div key={index} className="border rounded-md p-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{action.label}</span>
                                  <span className="text-sm">{(action.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <span className="text-sm text-gray-500">Timeframe: {action.timeframe}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {analysisType === "scene-understanding" && (
                    <>
                      <h3 className="text-lg font-medium mb-2">Scene Understanding Results</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Detected Scenes:</p>
                          <div className="space-y-2">
                            {result.scenes.map((scene: any, index: number) => (
                              <div key={index} className="border rounded-md p-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{scene.label}</span>
                                  <span className="text-sm">{(scene.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <span className="text-sm text-gray-500">Timeframe: {scene.timeframe}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Lighting conditions: {result.lighting}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {analysisType === "video-summarization" && (
                    <>
                      <h3 className="text-lg font-medium mb-2">Video Summarization</h3>
                      <div className="space-y-4">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <p>{result.summary}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Key frames extracted at: {result.keyFrames.join(", ")} seconds</p>
                        </div>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-400 mt-4">Processed with {result.model}</p>
                </div>
              </Card>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

