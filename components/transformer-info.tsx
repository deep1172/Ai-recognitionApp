"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function TransformerInfo() {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p>
          Our system uses state-of-the-art transformer models to process different types of inputs: images, text, and
          voice. These models provide high accuracy and performance across various tasks.
        </p>
      </div>

      <Tabs defaultValue="face">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="face">Face Models</TabsTrigger>
          <TabsTrigger value="text">Text Models</TabsTrigger>
          <TabsTrigger value="voice">Voice Models</TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Face Transformer Models</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use Vision Transformer (ViT) and Swin Transformer models for face recognition tasks. These models
                    outperform traditional CNN-based approaches by capturing global dependencies.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>ViT-Face:</strong> Specialized Vision Transformer for facial recognition
                    </li>
                    <li>
                      <strong>Swin Transformer:</strong> Hierarchical vision transformer with shifted windows
                    </li>
                    <li>
                      <strong>DeiT:</strong> Data-efficient image transformer with distillation
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-4">
                    These models generate high-quality face embeddings that capture subtle facial features, enabling
                    accurate face matching and recognition even under challenging conditions.
                  </p>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image 
                    src="/face-scan.jpg?height=300&width=400" 
                    alt="Face transformer architecture"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Text Transformer Models</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our text analysis capabilities are powered by state-of-the-art language models that understand
                    context, semantics, and linguistic nuances.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>BERT:</strong> Bidirectional Encoder Representations from Transformers for sentiment
                      analysis
                    </li>
                    <li>
                      <strong>RoBERTa:</strong> Robustly optimized BERT for text classification
                    </li>
                    <li>
                      <strong>DeBERTa:</strong> Decoding-enhanced BERT for entity recognition
                    </li>
                    <li>
                      <strong>T5:</strong> Text-to-Text Transfer Transformer for summarization
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-4">
                    These models use self-attention mechanisms to understand relationships between words, enabling
                    sophisticated text analysis for various applications.
                  </p>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image
                    src="glass-scan.jpg/?height=300&width=400"
                    alt="Text transformer architecture"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Voice Transformer Models</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our voice processing capabilities leverage transformer architectures adapted for audio signals,
                    enabling accurate speech recognition and speaker identification.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>Whisper:</strong> Robust speech recognition transformer from OpenAI
                    </li>
                    <li>
                      <strong>Wav2Vec2:</strong> Self-supervised transformer for speech processing and emotion detection
                    </li>
                    <li>
                      <strong>WavLM:</strong> Transformer model for speaker identification and verification
                    </li>
                    <li>
                      <strong>HuBERT:</strong> Hidden-unit BERT for speech representation learning
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-4">
                    These models convert audio waveforms into meaningful representations, enabling tasks like
                    speech-to-text, speaker identification, and emotion detection.
                  </p>
                </div>
                <div className="relative h-64 rounded-md overflow-hidden border">
                  <Image
                    src="/speaks.jpg?height=300&width=400"
                    alt="Voice transformer architecture"
                    fill
                    className="object-cover"
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

