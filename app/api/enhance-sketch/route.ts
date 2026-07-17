import { NextResponse } from "next/server";

type GeminiPart = { inlineData?: { data?: string; mimeType?: string } };

export async function POST(request: Request) {
  const legacyConfig = process.env.OPENAI_VISION_MODEL?.startsWith("gemini-");
  const apiKey = process.env.GEMINI_API_KEY ?? (legacyConfig ? process.env.OPENAI_API_KEY : undefined);
  const model = process.env.GEMINI_IMAGE_MODEL ?? (legacyConfig ? process.env.OPENAI_VISION_MODEL : undefined) ?? "gemini-3.1-flash-image";
  if (!apiKey) return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local." }, { status: 503 });

  const { image } = await request.json() as { image?: string };
  const match = image?.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Draw something before enhancing it." }, { status: 400 });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: "Turn this rough hand-drawn sketch into a polished finished illustration. Preserve its subject, composition, proportions, recognizable shapes, intent, and existing colors. Clean the linework and add harmonious depth, lighting, texture, and detail. Do not add text, signatures, borders, watermarks, or unrelated objects." },
        { inlineData: { mimeType: match[1], data: match[2] } },
      ] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: result?.error?.message ?? "Gemini could not enhance the sketch." }, { status: response.status });

  const parts = (result?.candidates?.[0]?.content?.parts ?? []) as GeminiPart[];
  const output = parts.findLast((part) => part.inlineData?.data)?.inlineData;
  if (!output?.data) return NextResponse.json({ error: "Gemini returned no enhanced image." }, { status: 502 });
  return NextResponse.json({ image: `data:${output.mimeType ?? "image/png"};base64,${output.data}` });
}
