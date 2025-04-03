"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FaceRecognitionDemo() {
  const [activeTab, setActiveTab] = useState("embedding")

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          Our face recognition system uses state-of-the-art transformer models to achieve high accuracy and performance.
          The system works in several steps:
        </p>
      </div>

      <Tabs defaultValue="embedding" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="embedding">Face Embedding</TabsTrigger>
          <TabsTrigger value="matching">Face Matching</TabsTrigger>
          <TabsTrigger value="recognition">Face Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="embedding" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Face Embedding</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our system uses transformer models to convert facial images into high-dimensional vector embeddings.
                    These embeddings capture the unique features of a face, making them ideal for comparison and
                    recognition.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Face detection using MTCNN</li>
                    <li>Face alignment to normalize pose</li>
                    <li>Feature extraction using transformer architecture</li>
                    <li>512-dimensional embedding vector generation</li>
                  </ul>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Face embedding visualization"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Face Matching</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Face matching compares the embeddings of two faces to determine if they belong to the same person.
                    We use cosine similarity to measure the distance between embedding vectors.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Compute embeddings for both faces</li>
                    <li>Calculate cosine similarity between vectors</li>
                    <li>Apply threshold to determine match/no-match</li>
                    <li>Return confidence score with result</li>
                  </ul>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Face matching visualization"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Face Recognition</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Face recognition identifies a person by comparing their face embedding against a database of known
                    faces. Our system efficiently searches through the database to find the closest match.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Extract embedding from query face</li>
                    <li>Compare against database of known embeddings</li>
                    <li>Find closest match using approximate nearest neighbor search</li>
                    <li>Return identity and confidence score</li>
                  </ul>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=300&width=400"
                    alt="Face recognition visualization"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

