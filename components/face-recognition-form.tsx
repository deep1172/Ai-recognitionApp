"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function FaceRecognitionForm() {
  const { toast } = useToast()
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage({
        file,
        preview: reader.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image for recognition",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", image.file)

      // In a real implementation, this would be your Flask API endpoint
      const endpoint = "/api/recognize-face"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate response
      const recognized = Math.random() > 0.3
      setResult({
        recognized,
        person: recognized ? "John Doe" : null,
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
        model: "Swin Transformer",
      })

      toast({
        title: "Processing complete",
        description: "Your image has been analyzed",
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="relative">
          {image ? (
            <div className="relative rounded-md overflow-hidden">
              {/* 4:3 aspect ratio container */}
              <div className="aspect-[4/3] relative">
                <Image
                  src={image.preview || "/placeholder.svg"}
                  alt="Uploaded image"
                  fill
                  className="object-contain bg-gray-100"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload face to recognize</span>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </Label>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!image || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Recognize Face"
          )}
        </Button>

        {result && (
          <Card className="p-4 mt-4">
            <div className="text-center">
              {result.recognized ? (
                <>
                  <h3 className="text-lg font-medium">Recognized as: {result.person}</h3>
                  <p className="text-sm text-gray-500 mb-2">Confidence: {result.confidence * 100}%</p>
                </>
              ) : (
                <h3 className="text-lg font-medium mb-2">No match found in database</h3>
              )}
              <p className="text-xs text-gray-400">Processed with {result.model}</p>
            </div>
          </Card>
        )}
      </div>
    </form>
  )
}

