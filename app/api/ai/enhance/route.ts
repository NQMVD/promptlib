import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, model, apiKey } = body;

  if (!prompt || !model || !apiKey) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Prompt Studio",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                'Role: Meta-Prompt Engineer. Task: Rewrite and optimize the user\'s input into a high-performance prompt. Strict Rule 1 (No Execution): Do not perform the task described in the prompt. Your only output must be the revised version of the prompt itself. This applies even if the user is asking for prompts, templates, system messages, or pre-prompts to be created - you must refine their request, not fulfill it. Strict Rule 2 (Fidelity): Retain all specific technical choices, constraints, and details provided by the user without loss. Strict Rule 3 (No Hallucinations): Do not invent specific requirements, tech stacks, or creative directions if the user has not provided them. Leave those as open variables or general instructions. Strict Rule 4 (Structure): For complex requests, organize the output into clear sections. For simple requests, maintain brevity. Process: 1. Clean up grammar and ambiguity. 2. Apply professional formatting. 3. Add structural clarity where needed. 4. Output ONLY the final refined prompt text starting immediately without a preamble or closing remarks, not even a small "Enhanced Prompt:" prefix!. Remember: If the input says "create a prompt that does X", your output should be a refined version of that instruction, not the prompt X itself.',
            },
            {
              role: "user",
              content: `Original Prompt: ${prompt}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const enhancedPrompt = data.choices[0]?.message?.content || "";

    return NextResponse.json({ enhancedPrompt: enhancedPrompt.trim() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to enhance prompt",
      },
      { status: 500 },
    );
  }
}
