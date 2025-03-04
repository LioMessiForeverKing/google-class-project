"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Loader2, X } from "lucide-react"

interface TopicSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  topicName: string
  className: string
  topicId: string
}

interface TopicSummary {
  id: string
  name: string
  summary: string
  keyPoints: string[]
  learningObjectives: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedStudyTime: string
}

export default function TopicSummaryModal({
  isOpen,
  onClose,
  topicName,
  className,
  topicId,
}: TopicSummaryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<TopicSummary | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className,
          syllabus: topicName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch topic summary")
      }

      // Assuming the API returns an array of topics, we'll use the first one
      const topicSummary = data.topics?.[0]
      if (topicSummary) {
        setSummary(topicSummary)
      } else {
        throw new Error("No summary data available")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary when modal opens
  useState(() => {
    if (isOpen) {
      fetchSummary()
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <CardHeader>
          <CardTitle>{topicName}</CardTitle>
          <CardDescription>Detailed topic summary and learning objectives</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSummary}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-slate-600">{summary.summary}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Points</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="text-slate-600">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Learning Objectives</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {summary.learningObjectives.map((objective, index) => (
                    <li key={index} className="text-slate-600">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-sm font-medium">Difficulty: </span>
                  <span className="text-sm text-slate-600 capitalize">
                    {summary.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Estimated Study Time: </span>
                  <span className="text-sm text-slate-600">
                    {summary.estimatedStudyTime}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No summary data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}