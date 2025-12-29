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
                'Role: Prompt Analysis Specialist. Task: Analyze the given prompt and generate structured feedback consisting of clarifying questions and potential improvements. Strict Rule 1 (No Execution): Do not perform the task described in the prompt. Your only output must be the analysis of the prompt itself, not the result of executing it. Strict Rule 2 (Actionable Questions): Generate clarifying questions that target genuine ambiguities, missing context, or underspecified requirements that would materially improve the prompt if answered. Strict Rule 3 (Practical Additions): Suggest improvements that are concrete, implementable, and directly enhance the prompt\'s effectiveness - such as missing constraints, structural improvements, edge case handling, or clarity enhancements. Strict Rule 4 (No Fluff): Avoid generic, obvious, or filler suggestions. Every question and addition must add real value. Strict Rule 5 (Appropriate Scope): Scale the number of suggestions to the prompt\'s complexity. Simple prompts need few refinements; complex prompts may warrant more. Process: 1. Identify ambiguities, gaps, or unclear requirements in the prompt. 2. Generate targeted clarifying questions for each issue found. 3. Identify opportunities to strengthen structure, clarity, or completeness. 4. Generate specific, actionable improvement suggestions. 5. Output ONLY a single JSON object with no preamble, explanation, or markdown formatting. Format: {"questions": ["question1", "question2", ...], "additions": ["addition1", "addition2", ...]}',
            },
            {
              role: "user",
              content: `Analyze this prompt and provide questions and additions:\n\n${prompt}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(content);

      return NextResponse.json({
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        additions: Array.isArray(parsed.additions) ? parsed.additions : [],
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        {
          error:
            "AI returned invalid format. Please try again or use a different model.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate discussion",
      },
      { status: 500 },
    );
  }
}
