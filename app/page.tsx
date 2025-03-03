"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import SyllabusRoadmap from "../components/roadmap-flowchart"

export default function SyllabusAnalyzer() {
  const [className, setClassName] = useState("")
  const [syllabus, setSyllabus] = useState("")
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("input")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ className, syllabus }),
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roadmap")
      }

      setTopics(data.topics || [])
      setActiveTab("roadmap")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Syllabus Roadmap Generator</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="input">Input Syllabus</TabsTrigger>
          <TabsTrigger value="roadmap" disabled={topics.length === 0}>
            View Roadmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Enter Course Information</CardTitle>
              <CardDescription>
                Paste your course syllabus text and we'll generate an interactive roadmap visualization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="className" className="text-sm font-medium">
                    Course Name
                  </label>
                  <Input
                    id="className"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Econometrics 101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="syllabus" className="text-sm font-medium">
                    Syllabus Content
                  </label>
                  <Textarea
                    id="syllabus"
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="Paste your syllabus text here..."
                    className="min-h-[300px]"
                    required
                  />
                </div>

                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={loading || !className || !syllabus} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  "Generate Roadmap"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          {topics.length > 0 ? (
            <div className="space-y-6">
              <SyllabusRoadmap topics={topics} className={className} />

              <div className="flex justify-center mt-6">
                <Button onClick={() => setActiveTab("input")} variant="outline" className="mr-4">
                  Edit Syllabus
                </Button>
                <Button onClick={() => window.print()} variant="secondary">
                  Print Roadmap
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No roadmap generated yet. Please input your syllabus first.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

