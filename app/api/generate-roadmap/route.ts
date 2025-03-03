import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Add this line for debugging
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY)

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { className, syllabus } = await request.json()

    if (!className || !syllabus) {
      return NextResponse.json({ error: "Class name and syllabus are required" }, { status: 400 })
    }

    // Create a prompt for Gemini
    const prompt = `
      Analyze the following syllabus for a class called "${className}" and extract the main topics, subtopics, and their relationships.
      
      Syllabus:
      ${syllabus}
      
      Return the result as a JSON object with the following structure:
      {
        "topics": [
          {
            "id": "unique_id_for_topic",
            "name": "Chapter 1: Topic Name",
            "children": ["child_topic_id1", "child_topic_id2"],
            "description": "Brief description of the topic",
            "chapter": "1",
            "relatedTopics": [
              {
                "topicId": "another_topic_id",
                "relationship": "builds upon",
                "strength": 0.8
              }
            ]
          },
          {
            "id": "section_1_1",
            "name": "1.1: Section Name",
            "children": [],
            "description": "Brief description of the section",
            "chapter": "1"
          }
        ]
      }
      
      Make sure:
      1. Each topic has a unique ID (lowercase with underscores)
      2. The "children" array contains IDs of subtopics
      3. All topics are included in the array, even if they are subtopics
      4. Chapter names must be formatted as "Chapter X: Title"
      5. Section names must be formatted as "X.Y: Title" where X is the chapter number and Y is the section number
      6. Subsection names must be formatted as "X.Y.Z: Title"
      7. Include a brief description for each topic
      8. The structure represents the hierarchy of the syllabus
      9. For each chapter-level topic, analyze and include relationships with other chapters:
         - Identify dependencies, prerequisites, or related concepts
         - Assign a strength value between 0 (weak) and 1 (strong) for each relationship
         - Describe the type of relationship (e.g., "builds upon", "prerequisite for", "complements")
      10. Only return the JSON object, no additional text
    `

    // Call the Gemini API
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
      error: "Failed to generate roadmap", 
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

