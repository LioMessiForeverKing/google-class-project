import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { className, syllabus } = await request.json()

    if (!className || !syllabus) {
      return NextResponse.json({ error: "Class name and syllabus are required" }, { status: 400 })
    }

    // Create a prompt for Gemini to generate summaries
    const prompt = `
      Analyze the following syllabus for a class called "${className}" and generate detailed summaries for each topic.
      
      Syllabus:
      ${syllabus}
      
      Return the result as a JSON object with the following structure:
      {
        "topics": [
          {
            "id": "unique_id_for_topic",
            "name": "Topic Name",
            "summary": "Detailed explanation of the topic's key concepts and main ideas",
            "keyPoints": [
              "Important point 1",
              "Important point 2"
            ],
            "learningObjectives": [
              "After studying this topic, students will be able to..."
            ],
            "difficulty": "beginner|intermediate|advanced",
            "estimatedStudyTime": "2 hours"
          }
        ]
      }
      
      Make sure:
      1. Each topic has a clear, concise summary that explains the core concepts
      2. Include 3-5 key points that highlight the most important aspects
      3. Add specific learning objectives for each topic
      4. Assess the difficulty level of each topic
      5. Provide an estimated study time
      6. Use clear, student-friendly language
      7. Focus on practical understanding and applications
      8. Only return the JSON object, no additional text
    `

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("Gemini API response:", text.substring(0, 200) + "...") // Log a preview of the response

      // Extract the JSON from the response
      let jsonStr = text
      if (text.includes("```json")) {
        jsonStr = text.split("```json")[1].split("```")[0].trim()
      } else if (text.includes("```")) {
        jsonStr = text.split("```")[1].split("```")[0].trim()
      }

      try {
        // Parse the JSON
        const data = JSON.parse(jsonStr)
        return NextResponse.json(data)
      } catch (parseError) {
        console.error("JSON parsing error:", parseError)
        console.error("Attempted to parse:", jsonStr)
        return NextResponse.json(
          {
            error: "Failed to parse the AI response as JSON",
            rawResponse: text.substring(0, 500), // Include part of the raw response for debugging
          },
          { status: 500 },
        )
      }
    } catch (apiError) {
      console.error("Gemini API error:", apiError)
      return NextResponse.json(
        {
          error: "Error calling the Gemini API",
          details: apiError instanceof Error ? apiError.message : 'Unknown error occurred',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("General error:", error)
    return NextResponse.json({ 
      error: "Failed to generate topic summaries", 
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}