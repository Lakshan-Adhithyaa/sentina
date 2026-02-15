import { NextResponse } from "next/server"
import { generateMockEdgeCases } from "@/lib/sentina-mock-edge-cases"

export async function POST(request: Request) {
  try {
    const { props } = await request.json()

    if (!props || typeof props !== "object") {
      return NextResponse.json(
        { error: "Invalid props provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key, return mock edge cases
    if (!apiKey) {
      const mockCases = generateMockEdgeCases(props)
      return NextResponse.json({
        edgeCases: mockCases,
        source: "mock",
        warning: "No GEMINI_API_KEY found. Using mock edge cases.",
      })
    }

    // Call Gemini API
    try {
      const prompt = `You are an expert React developer. Analyze this JSON props object and generate edge case mutations to stress-test a React component's UI integrity.

Props JSON:
${JSON.stringify(props, null, 2)}

Generate 6-10 edge case mutations. For each, provide:
- A unique id (kebab-case)
- A short title
- A brief description of what it tests
- A mutation with a dot-notation path and the mutated value
- conflictsWith: an array of other edge case ids that would conflict with this one

Respond ONLY with a valid JSON array. No markdown, no explanation. The shape must be:
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "mutation": {
      "path": "dot.notation.path",
      "value": "any"
    },
    "conflictsWith": ["id1", "id2"]
  }
]`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API returned ${response.status}`)
      }

      const data = await response.json()
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

      // Parse response
      let edgeCases
      try {
        edgeCases = JSON.parse(text)
      } catch {
        // Attempt repair: strip code fences
        const cleaned = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()
        try {
          edgeCases = JSON.parse(cleaned)
        } catch {
          // Fallback to mock
          const mockCases = generateMockEdgeCases(props)
          return NextResponse.json({
            edgeCases: mockCases,
            source: "mock",
            warning: "Failed to parse Gemini response. Using mock edge cases.",
          })
        }
      }

      // Validate shape
      if (!Array.isArray(edgeCases)) {
        const mockCases = generateMockEdgeCases(props)
        return NextResponse.json({
          edgeCases: mockCases,
          source: "mock",
          warning: "Gemini returned invalid format. Using mock edge cases.",
        })
      }

      // Ensure each edge case has required fields
      const validated = edgeCases
        .filter(
          (ec: Record<string, unknown>) =>
            ec &&
            typeof ec.id === "string" &&
            typeof ec.title === "string" &&
            ec.mutation &&
            typeof (ec.mutation as Record<string, unknown>).path === "string"
        )
        .map((ec: Record<string, unknown>) => ({
          id: ec.id,
          title: ec.title,
          description: ec.description || "",
          mutation: ec.mutation,
          conflictsWith: Array.isArray(ec.conflictsWith)
            ? ec.conflictsWith
            : [],
        }))

      if (validated.length === 0) {
        const mockCases = generateMockEdgeCases(props)
        return NextResponse.json({
          edgeCases: mockCases,
          source: "mock",
          warning: "No valid edge cases from Gemini. Using mock edge cases.",
        })
      }

      return NextResponse.json({
        edgeCases: validated,
        source: "gemini",
      })
    } catch (apiError) {
      console.error("[Sentina] Gemini API error:", apiError)
      const mockCases = generateMockEdgeCases(props)
      return NextResponse.json({
        edgeCases: mockCases,
        source: "mock",
        warning: `Gemini API failed: ${apiError instanceof Error ? apiError.message : "Unknown error"}. Using mock edge cases.`,
      })
    }
  } catch (error) {
    console.error("[Sentina] Route error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
