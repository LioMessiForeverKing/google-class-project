"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizModalProps {
  topicName: string
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const mockQuestions = [
  {
    id: 1,
    question: "What is the main concept covered in this topic?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "Which statement best describes this topic's importance?",
    options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
    correctAnswer: 1,
  },
]

export default function QuizModal({ topicName, isOpen, onClose, onComplete }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])

  if (!isOpen) return null

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev]
      newAnswers[currentQuestion] = answerIndex
      return newAnswers
    })
  }

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Calculate score and complete
      const score = selectedAnswers.reduce((acc, answer, index) => {
        return acc + (answer === mockQuestions[index].correctAnswer ? 1 : 0)
      }, 0)
      onComplete()
      onClose()
    }
  }

  const question = mockQuestions[currentQuestion]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Quiz: {topicName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-500 mb-2">
            Question {currentQuestion + 1} of {mockQuestions.length}
          </div>
          <div className="font-medium text-lg mb-4">{question.question}</div>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                  ${selectedAnswers[currentQuestion] === index
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:border-slate-300"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
          >
            {currentQuestion < mockQuestions.length - 1 ? "Next" : "Complete"}
          </Button>
        </CardFooter>
    </Card>
  </div>
)}