import { NextResponse } from "next/server"
import { generateText, Output } from "ai"
import { z } from "zod"
import { generateMockEdgeCases } from "@/lib/sentina-mock-edge-cases"

// Schema for the structured edge case output
const edgeCaseSchema = z.object({
  edgeCases: z.array(
    z.object({
      id: z.string().describe("Unique kebab-case identifier"),
      title: z.string().describe("Short title for the edge case"),
      description: z.string().describe("Brief description of what it tests"),
      mutation: z.object({
        path: z.string().describe("Dot-notation path to the prop being mutated"),
        value: z.unknown().describe("The mutated value"),
      }),
      conflictsWith: z
        .array(z.string())
        .describe("Array of other edge case ids that conflict with this one"),
    })
  ),
})

export async function POST(request: Request) {
  try {
    const { props } = await request.json()

    if (!props || typeof props !== "object") {
      return NextResponse.json(
        { error: "Invalid props provided" },
        { status: 400 }
      )
    }

    try {
      const { output } = await generateText({
        model: "google/gemini-2.0-flash",
        output: Output.object({ schema: edgeCaseSchema }),
        prompt: `You are an expert React developer and QA engineer. Analyze this JSON props object and generate edge case mutations to stress-test a React component's UI integrity.

Props JSON:
${JSON.stringify(props, null, 2)}

Generate 6-10 edge case mutations. Think about:
- Empty strings, extremely long strings (overflow), special characters
- Zero, negative, and extremely large numbers
- Boolean flips
- Empty arrays, null values
- Deeply nested prop mutations using dot-notation paths (e.g. "user.address.city")
- Conflicting mutations that target the same prop path should reference each other in conflictsWith

Each edge case must have a unique kebab-case id, a short title, a description, a mutation with a dot-notation path and value, and a conflictsWith array of ids.`,
      })

      if (output && output.edgeCases && output.edgeCases.length > 0) {
        return NextResponse.json({
          edgeCases: output.edgeCases,
          source: "gemini",
        })
      }

      // If AI returned empty or null, fall back to mock
      const mockCases = generateMockEdgeCases(props)
      return NextResponse.json({
        edgeCases: mockCases,
        source: "mock",
        warning: "AI returned no edge cases. Using mock edge cases.",
      })
    } catch (aiError) {
      console.error("[Sentina] AI SDK error:", aiError)
      const mockCases = generateMockEdgeCases(props)
      return NextResponse.json({
        edgeCases: mockCases,
        source: "mock",
        warning: `AI generation failed: ${aiError instanceof Error ? aiError.message : "Unknown error"}. Using mock edge cases.`,
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
