import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { prompt, notes, model, apiKey } = body

  if (!prompt || !notes || !model || !apiKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const notesText = notes.map((note: string, i: number) => `${i + 1}. ${note}`).join("\n")

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
              "You are an expert prompt engineer. Your task is to evolve the given prompt based on the user's feedback notes. Incorporate the feedback to create an improved version that addresses all the mentioned points.",
          },
          {
            role: "user",
            content: `Original Prompt:\n${prompt}\n\nFeedback Notes:\n${notesText}\n\nPlease evolve this prompt incorporating all the feedback above.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    const data = await response.json()
    const evolvedPrompt = data.choices[0]?.message?.content || ""

    return NextResponse.json({ evolvedPrompt })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to evolve prompt" },
      { status: 500 },
    )
  }
}
