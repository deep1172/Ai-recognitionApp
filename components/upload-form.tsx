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

interface UploadFormProps {
  mode: "matching" | "recognition"
}

export default function UploadForm({ mode }: UploadFormProps) {
  const { toast } = useToast()
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const maxImages = mode === "matching" ? 2 : 1

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload ${maxImages} image${maxImages > 1 ? "s" : ""} for ${mode}`,
        variant: "destructive",
      })
      return
    }

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
      setImages([
        ...images,
        {
          file,
          preview: reader.result as string,
        },
      ])
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length < (mode === "matching" ? 2 : 1)) {
      toast({
        title: "Not enough images",
        description: `Please upload ${mode === "matching" ? "two" : "an"} image${mode === "matching" ? "s" : ""}`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      images.forEach((img, index) => {
        formData.append(`image${index + 1}`, img.file)
      })

      // In a real implementation, this would be your Flask API endpoint
      const endpoint = mode === "matching" ? "/api/match-faces" : "/api/recognize-face"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate response
      if (mode === "matching") {
        setResult({
          match: Math.random() > 0.5,
          confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
        })
      } else {
        setResult({
          recognized: Math.random() > 0.3,
          person: Math.random() > 0.3 ? "John Doe" : null,
          confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
        })
      }

      toast({
        title: "Processing complete",
        description: "Your images have been analyzed",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: maxImages }).map((_, index) => (
            <div key={index} className="relative">
              {images[index] ? (
                <div className="relative h-48 w-full rounded-md overflow-hidden">
                  <Image
                    src={images[index].preview || "/placeholder.svg"}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Label
                  htmlFor={`image-upload-${index}`}
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {mode === "matching" ? `Upload face ${index + 1}` : "Upload face to recognize"}
                  </span>
                  <Input
                    id={`image-upload-${index}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
              )}
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={images.length < (mode === "matching" ? 2 : 1) || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === "matching" ? (
            "Compare Faces"
          ) : (
            "Recognize Face"
          )}
        </Button>

        {result && (
          <Card className="p-4 mt-4">
            {mode === "matching" ? (
              <div className="text-center">
                <h3 className="text-lg font-medium">{result.match ? "Faces Match!" : "Faces Don't Match"}</h3>
                <p className="text-sm text-gray-500">Confidence: {result.confidence * 100}%</p>
              </div>
            ) : (
              <div className="text-center">
                {result.recognized ? (
                  <>
                    <h3 className="text-lg font-medium">Recognized as: {result.person}</h3>
                    <p className="text-sm text-gray-500">Confidence: {result.confidence * 100}%</p>
                  </>
                ) : (
                  <h3 className="text-lg font-medium">No match found in database</h3>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </form>
  )
}

