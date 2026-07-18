import { NextResponse } from "next/server";

type GeminiImage = { type?: string; data?: string; mime_type?: string };
type GeminiStep = { type?: string; content?: GeminiImage[] };

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
  if (!apiKey)
    return NextResponse.json(
      { error: "Add GEMINI_API_KEY to .env.local." },
      { status: 503 }
    );

  const { image } = (await request.json()) as { image?: string };
  const match = image?.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match)
    return NextResponse.json(
      { error: "Draw something before enhancing it." },
      { status: 400 }
    );

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        model,
        input: [
          {
            type: "text",
            text: "Turn this rough hand-drawn sketch into a polished finished illustration. Preserve its subject, composition, proportions, recognizable shapes, intent, and existing colors. Clean the linework and add harmonious depth, lighting, texture, and detail. Do not add text, signatures, borders, watermarks, or unrelated objects.",
          },
          { type: "image", mime_type: match[1], data: match[2] },
        ],
        response_format: { type: "image", mime_type: "image/png" },
      }),
    }
  );
  const result = await response.json().catch(() => null);
  if (!response.ok)
    return NextResponse.json(
      {
        error: result?.error?.message ?? "Gemini could not enhance the sketch.",
      },
      { status: response.status }
    );

  const images = ((result?.steps ?? []) as GeminiStep[])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? [])
    .filter((part) => part.type === "image" && part.data);
  const output = images.at(-1) ?? result?.output_image;
  if (!output?.data)
    return NextResponse.json(
      { error: "Gemini returned no enhanced image." },
      { status: 502 }
    );
  return NextResponse.json({
    image: `data:${output.mime_type ?? "image/png"};base64,${output.data}`,
  });
}
