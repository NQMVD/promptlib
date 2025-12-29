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
              'You are an expert prompt engineer. Analyze the given prompt and provide: 1) A list of clarifying questions that would help improve the prompt, 2) A list of potential additions or improvements that could enhance the prompt. Respond ONLY with valid JSON in this exact format: {"questions": ["question1", "question2", ...], "additions": ["addition1", "addition2", ...]}',
          },
          {
            role: "user",
            content: `Analyze this prompt and provide questions and additions:\n\n${prompt}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""

    // Parse the JSON response
    const parsed = JSON.parse(content)

    return NextResponse.json({
      questions: parsed.questions || [],
      additions: parsed.additions || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate discussion" },
      { status: 500 },
    )
  }
}
