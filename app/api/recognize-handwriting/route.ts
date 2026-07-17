import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Handwriting recognition is not configured." },
      { status: 503 }
    );

  const { image } = (await request.json()) as { image?: string };
  if (!image?.startsWith("data:image/"))
    return NextResponse.json(
      { error: "A canvas image is required." },
      { status: 400 }
    );

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Transcribe all handwriting, including long paragraphs. Use the surrounding sentence, grammar, topic, and visible letter shapes to reconstruct the writer's intended words. When a word has a reasonable interpretation, output the most likely correctly spelled word directly in the text; do not mark it unclear merely because one letter is messy. Put such lower-confidence but reasonable guesses in hints with the line number, chosen word or letter, and a short explanation. Use [unclear: unreadable word] in the text and add an unclear entry only when no reasonable word or letter can be inferred at all. Keep every readable part, correct spelling, spacing, grammar, and capitalization, and preserve intentional line breaks. A single handwritten letter is valid.",
            },
            { type: "input_image", image_url: image },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "handwriting_transcription",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              text: { type: "string" },
              hints: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    line: { type: "integer" },
                    characters: { type: "string" },
                    guidance: { type: "string" },
                  },
                  required: ["line", "characters", "guidance"],
                },
              },
              unclear: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    line: { type: "integer" },
                    characters: { type: "string" },
                    guidance: { type: "string" },
                  },
                  required: ["line", "characters", "guidance"],
                },
              },
            },
            required: ["text", "hints", "unclear"],
          },
        },
      },
    }),
  });
  if (!response.ok) {
    const upstream = await response.json().catch(() => null);
    const code = upstream?.error?.code;
    const message =
      code === "insufficient_quota"
        ? "OpenAI API quota is unavailable. Add billing or credits to this API project."
        : response.status === 401
        ? "The OpenAI API key is invalid or inactive."
        : code === "model_not_found"
        ? "The configured recognition model is unavailable to this API project."
        : "The handwriting recognition service could not process this request.";
    return NextResponse.json(
      { error: message, code },
      { status: response.status }
    );
  }

  const result = await response.json();
  const outputText = result.output
    ?.flatMap(
      (item: { content?: Array<{ type?: string; text?: string }> }) =>
        item.content ?? []
    )
    .find((item: { type?: string }) => item.type === "output_text")
    ?.text?.trim();
  if (!outputText)
    return NextResponse.json(
      { error: "No handwriting was detected." },
      { status: 422 }
    );
  const transcription = JSON.parse(outputText) as {
    text?: string;
    hints?: Array<{ line: number; characters: string; guidance: string }>;
    unclear?: Array<{ line: number; characters: string; guidance: string }>;
  };
  if (!transcription.text)
    return NextResponse.json(
      { error: "No handwriting was detected." },
      { status: 422 }
    );
  return NextResponse.json({
    text: transcription.text,
    hints: transcription.hints ?? [],
    unclear: transcription.unclear ?? [],
  });
}
