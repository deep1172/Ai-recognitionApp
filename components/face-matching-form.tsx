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

export default function FaceMatchingForm() {
  const { toast } = useToast()
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const maxImages = 2

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload ${maxImages} images for face matching`,
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
    e.preventDefault();
  
    if (images.length < 2) {
      toast({
        title: "Not enough images",
        description: "Please upload two images for comparison",
        variant: "destructive",
      });
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch("/api/compare-faces", {
        method: "POST",
        body: JSON.stringify({ image1: images[0].preview, image2: images[1].preview }),
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await res.json();
      setResult(data);
  
      toast({
        title: "Processing complete",
        description: data.match ? "Faces match!" : "Faces do not match",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: maxImages }).map((_, index) => (
            <div key={index} className="relative">
              {images[index] ? (
                <div className="relative rounded-md overflow-hidden">
                  {/* 4:3 aspect ratio container */}
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={images[index].preview || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-contain bg-gray-100"
                    />
                  </div>
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
                  className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload face {index + 1}</span>
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

        <Button type="submit" className="w-full" disabled={images.length < 2 || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Compare Faces"
          )}
        </Button>

        {result && (
          <Card className="p-4 mt-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">{result.match ? "Faces Match!" : "Faces Don't Match"}</h3>
              <p className="text-sm text-gray-500 mb-2">Confidence: {result.confidence * 100}%</p>
              <p className="text-xs text-gray-400">Processed with {result.model}</p>
            </div>
          </Card>
        )}
      </div>
    </form>
  )
}

