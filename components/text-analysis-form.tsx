"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AnalysisType = "sentiment" | "classification" | "entity" | "summarization"

export default function TextAnalysisForm() {
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [analysisType, setAnalysisType] = useState<AnalysisType>("sentiment")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleAnalysisTypeChange = (value: string) => {
    setAnalysisType(value as AnalysisType)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      toast({
        title: "No text",
        description: "Please enter text for analysis",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("text", text)
      formData.append("type", analysisType)

      // In a real implementation, this would be your Flask API endpoint
      const endpoint = "/api/analyze-text"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate response based on analysis type
      let simulatedResult

      switch (analysisType) {
        case "sentiment":
          const sentiment = Math.random() > 0.5 ? "positive" : Math.random() > 0.5 ? "negative" : "neutral"
          simulatedResult = {
            sentiment,
            score: {
              positive: sentiment === "positive" ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
              negative: sentiment === "negative" ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
              neutral: sentiment === "neutral" ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
            },
            model: "BERT Transformer",
          }
          break

        case "classification":
          const categories = ["Technology", "Business", "Sports", "Entertainment", "Politics"]
          const topCategory = categories[Math.floor(Math.random() * categories.length)]
          simulatedResult = {
            category: topCategory,
            scores: categories.reduce(
              (acc, cat) => {
                acc[cat] = cat === topCategory ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3
                return acc
              },
              {} as Record<string, number>,
            ),
            model: "RoBERTa Transformer",
          }
          break

        case "entity":
          simulatedResult = {
            entities: [
              {
                text: text.split(" ")[Math.floor(Math.random() * text.split(" ").length)],
                type: "PERSON",
                score: Math.random() * 0.3 + 0.7,
              },
              {
                text: text.split(" ")[Math.floor(Math.random() * text.split(" ").length)],
                type: "LOCATION",
                score: Math.random() * 0.3 + 0.7,
              },
              {
                text: text.split(" ")[Math.floor(Math.random() * text.split(" ").length)],
                type: "ORGANIZATION",
                score: Math.random() * 0.3 + 0.7,
              },
            ],
            model: "DeBERTa Transformer",
          }
          break

        case "summarization":
          simulatedResult = {
            summary: text.split(". ")[0] + ".",
            model: "T5 Transformer",
          }
          break
      }

      setResult(simulatedResult)

      toast({
        title: "Processing complete",
        description: "Your text has been analyzed",
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
        <div>
          <Label htmlFor="analysis-type">Analysis Type</Label>
          <Select value={analysisType} onValueChange={handleAnalysisTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
              <SelectItem value="classification">Text Classification</SelectItem>
              <SelectItem value="entity">Entity Recognition</SelectItem>
              <SelectItem value="summarization">Text Summarization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="text-input">Text Input</Label>
          <Textarea
            id="text-input"
            placeholder="Enter text for analysis..."
            value={text}
            onChange={handleTextChange}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button type="submit" className="w-full" disabled={!text.trim() || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Analyze Text"
          )}
        </Button>

        {result && (
          <Card className="p-4 mt-4">
            <div>
              {analysisType === "sentiment" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Sentiment Analysis</h3>
                  <p className="mb-2">
                    <span className="font-medium">Overall Sentiment:</span>{" "}
                    <span
                      className={
                        result.sentiment === "positive"
                          ? "text-green-600"
                          : result.sentiment === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    >
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Positive</span>
                        <span>{(result.score.positive * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${result.score.positive * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Negative</span>
                        <span>{(result.score.negative * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${result.score.negative * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Neutral</span>
                        <span>{(result.score.neutral * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full"
                          style={{ width: `${result.score.neutral * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {analysisType === "classification" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Text Classification</h3>
                  <p className="mb-2">
                    <span className="font-medium">Top Category:</span> {result.category}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(result.scores).map(([category, score]: [string, number]) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category}</span>
                          <span>{(score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${score * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {analysisType === "entity" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Entity Recognition</h3>
                  <div className="space-y-2">
                    {result.entities.map((entity: any, index: number) => (
                      <div key={index} className="border rounded-md p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{entity.text}</span>
                          <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            {entity.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">Confidence: {(entity.score * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {analysisType === "summarization" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Text Summarization</h3>
                  <div className="border rounded-md p-3 bg-gray-50">
                    <p>{result.summary}</p>
                  </div>
                </>
              )}

              <p className="text-xs text-gray-400 mt-4">Processed with {result.model}</p>
            </div>
          </Card>
        )}
      </div>
    </form>
  )
}

