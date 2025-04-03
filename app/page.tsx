import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Camera, FileText, Mic, Video } from "lucide-react"
import TransformerInfo from "@/components/transformer-info"

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <section className="mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-4">AI Recognition System</h1>
            <p className="text-xl text-gray-600 mb-6">
              Process images, text, voice, and video with advanced transformer models
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative h-[300px] w-full rounded-xl overflow-hidden shadow-xl">
              <Image src="/frame.jpg" alt="AI Recognition" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>Match and identify faces with high accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Our face recognition system uses Vision Transformers to provide state-of-the-art accuracy.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/face-recognition">
                  Try Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Text Analysis</CardTitle>
              <CardDescription>Analyze sentiment, entities, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Process text with BERT and other transformer models for deep language understanding.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/text-analysis">
                  Try Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Voice Recognition</CardTitle>
              <CardDescription>Convert speech to text and identify speakers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Our voice recognition uses Whisper and Wav2Vec2 models for accurate transcription.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/voice-recognition">
                  Try Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                <Video className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Video Processing</CardTitle>
              <CardDescription>Analyze video content with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Process videos to detect objects, recognize actions, and extract insights.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/video-processing">
                  Try Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Transformer Models</CardTitle>
            <CardDescription>Learn about the transformer models powering our system</CardDescription>
          </CardHeader>
          <CardContent>
            <TransformerInfo />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

