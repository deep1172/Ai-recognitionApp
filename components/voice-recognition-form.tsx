"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mic, MicOff, Upload, X, Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type VoiceAnalysisType = "speech-to-text" | "speaker-identification" | "emotion-detection"

export default function VoiceRecognitionForm() {
  const { toast } = useToast()
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [analysisType, setAnalysisType] = useState<VoiceAnalysisType>("speech-to-text")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const file = e.target.files[0]
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      })
      return
    }

    setAudioFile(file)
    setAudioUrl(URL.createObjectURL(file))
    setRecordedChunks([])
  }

  const handleAnalysisTypeChange = (value: string) => {
    setAnalysisType(value as VoiceAnalysisType)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data])
        }
      })

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)

        // Create a File from the Blob
        const file = new File([audioBlob], "recorded-audio.webm", { type: "audio/webm" })
        setAudioFile(file)
      })

      setRecordedChunks([])
      mediaRecorderRef.current.start()
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Speak now...",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Recording stopped",
        description: "Your audio has been captured",
      })
    }
  }

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioFile(null)
    setAudioUrl(null)
    setRecordedChunks([])
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const audioElement = audioRef.current

    const handleEnded = () => {
      setIsPlaying(false)
    }

    if (audioElement) {
      audioElement.addEventListener("ended", handleEnded)
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile) {
      toast({
        title: "No audio",
        description: "Please upload or record audio for analysis",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("type", analysisType)

      // In a real implementation, this would be your Flask API endpoint
      const endpoint = "/api/analyze-voice"

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate response based on analysis type
      let simulatedResult

      switch (analysisType) {
        case "speech-to-text":
          simulatedResult = {
            text: "This is a simulated transcription of the audio recording using Whisper transformer model.",
            confidence: 0.92,
            model: "Whisper Transformer",
          }
          break

        case "speaker-identification":
          simulatedResult = {
            speaker: Math.random() > 0.5 ? "John Doe" : "Unknown",
            confidence: Math.random() * 0.3 + 0.7,
            model: "WavLM Transformer",
          }
          break

        case "emotion-detection":
          const emotions = ["happy", "sad", "angry", "neutral", "surprised"]
          const topEmotion = emotions[Math.floor(Math.random() * emotions.length)]
          simulatedResult = {
            emotion: topEmotion,
            scores: emotions.reduce(
              (acc, emotion) => {
                acc[emotion] = emotion === topEmotion ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3
                return acc
              },
              {} as Record<string, number>,
            ),
            model: "Wav2Vec2 Transformer",
          }
          break
      }

      setResult(simulatedResult)

      toast({
        title: "Processing complete",
        description: "Your audio has been analyzed",
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
              <SelectItem value="speech-to-text">Speech to Text</SelectItem>
              <SelectItem value="speaker-identification">Speaker Identification</SelectItem>
              <SelectItem value="emotion-detection">Emotion Detection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Audio Input</Label>

          {audioUrl ? (
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{audioFile?.name || "Recorded Audio"}</span>
                <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={removeAudio}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <audio ref={audioRef} src={audioUrl} className="hidden" />

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="audio-upload"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload audio file</span>
                  <Input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>

              <div>
                <div
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-8 w-8 text-red-500 mb-2 animate-pulse" />
                      <span className="text-sm text-red-500">Stop recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Record audio</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!audioFile || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Analyze Audio"
          )}
        </Button>

        {result && (
          <Card className="p-4 mt-4">
            <div>
              {analysisType === "speech-to-text" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Speech to Text</h3>
                  <div className="border rounded-md p-3 bg-gray-50 mb-2">
                    <p>{result.text}</p>
                  </div>
                  <p className="text-sm text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </>
              )}

              {analysisType === "speaker-identification" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Speaker Identification</h3>
                  <p className="mb-2">
                    <span className="font-medium">Identified Speaker:</span> {result.speaker}
                  </p>
                  <p className="text-sm text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </>
              )}

              {analysisType === "emotion-detection" && (
                <>
                  <h3 className="text-lg font-medium mb-2">Emotion Detection</h3>
                  <p className="mb-2">
                    <span className="font-medium">Detected Emotion:</span>{" "}
                    <span className="capitalize">{result.emotion}</span>
                  </p>
                  <div className="space-y-2">
                    {Object.entries(result.scores).map(([emotion, score]: [string, number]) => (
                      <div key={emotion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{emotion}</span>
                          <span>{(score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${score * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
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

