import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, notes, model, apiKey } = body;

  if (!prompt || !notes || !model || !apiKey) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const notesText = notes
      .map((note: string, i: number) => `${i + 1}. ${note}`)
      .join("\n");

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
                "Role: Prompt Evolution Specialist. Task: Evolve the base prompt by integrating the user's feedback, corrections, and additional thoughts into an improved version. Strict Rule 1 (No Execution): Do not perform the task described in the prompt. Your only output must be the evolved version of the prompt itself, not the result of executing it. Strict Rule 2 (Preserve Intent): Maintain the core purpose and structure of the base prompt while seamlessly incorporating all user feedback. Strict Rule 3 (Complete Integration): Address every piece of feedback provided - whether corrections, additions, clarifications, or modifications. Do not ignore or dismiss any user input. Strict Rule 4 (Fidelity): When feedback specifies technical details, constraints, or requirements, integrate them exactly as stated without substitution or interpretation. Strict Rule 5 (No Hallucinations): Do not add features, requirements, or details beyond what's in the base prompt or user feedback. Process: 1. Identify what works in the base prompt. 2. Apply all corrections and modifications from the feedback. 3. Integrate new requirements or clarifications. 4. Ensure coherent structure and clear language. 5. Output ONLY the final evolved prompt text starting immediately without a preamble or closing remarks, not even a small \"Evolved Prompt:\" prefix!",
            },
            {
              role: "user",
              content: `Original Prompt:\n${prompt}\n\nFeedback Notes:\n${notesText}\n\nPlease evolve this prompt incorporating all the feedback above.`,
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
    const evolvedPrompt = data.choices[0]?.message?.content || "";

    return NextResponse.json({ evolvedPrompt: evolvedPrompt.trim() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to evolve prompt",
      },
      { status: 500 },
    );
  }
}
