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
              "You are an expert prompt engineer. Your task is to enhance and optimize the given prompt to make it clearer, more effective, and better structured. Maintain the original intent but improve clarity, specificity, and effectiveness.",
          },
          {
            role: "user",
            content: `Please enhance and optimize this prompt:\n\n${prompt}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    const enhancedPrompt = data.choices[0]?.message?.content || ""

    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enhance prompt" },
      { status: 500 },
    )
  }
}
