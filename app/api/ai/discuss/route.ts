import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { prompt, model, apiKey } = body

  if (!prompt || !model || !apiKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Prompt Studio",
      },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                'You are an expert prompt engineer. Analyze the given prompt and provide: 1) A list of clarifying questions that would help improve the prompt, 2) A list of potential additions or improvements that could enhance the prompt. You MUST respond with a single JSON object. DO NOT include any preamble, explanation, or markdown formatting outside the JSON. Format: {"questions": ["question1", "question2", ...], "additions": ["addition1", "addition2", ...]}',
            },
            {
              role: "user",
              content: `Analyze this prompt and provide questions and additions:\n\n${prompt}`,
            },
          ],
          response_format: { type: "json_object" },
        }),

    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""

    try {
      // Find the first '{' and last '}' to extract JSON even if there's preamble or markdown
      const start = content.indexOf("{")
      const end = content.lastIndexOf("}")
      
      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in response")
      }
      
      const jsonStr = content.substring(start, end + 1)
      const parsed = JSON.parse(jsonStr)

      return NextResponse.json({
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        additions: Array.isArray(parsed.additions) ? parsed.additions : [],
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "AI returned invalid format. Please try again or use a different model." },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate discussion" },
      { status: 500 },
    )
  }
}
