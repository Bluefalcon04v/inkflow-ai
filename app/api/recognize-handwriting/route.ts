import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Handwriting recognition is not configured." }, { status: 503 });

  const { image } = await request.json() as { image?: string };
  if (!image?.startsWith("data:image/")) return NextResponse.json({ error: "A canvas image is required." }, { status: 400 });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
      input: [{ role: "user", content: [
        { type: "input_text", text: "Read every handwritten character in this tightly cropped image and return only clean, properly typeset plain text. A single handwritten letter is valid and must be returned. Correct obvious spelling, spacing, and conventional capitalization (for example, handwritten 'hello' should become 'Hello'). Preserve intentional line breaks. Do not describe the image or add commentary." },
        { type: "input_image", image_url: image },
      ] }],
    }),
  });
  if (!response.ok) {
    const upstream = await response.json().catch(() => null);
    const code = upstream?.error?.code;
    const message = code === "insufficient_quota"
      ? "OpenAI API quota is unavailable. Add billing or credits to this API project."
      : response.status === 401
        ? "The OpenAI API key is invalid or inactive."
        : code === "model_not_found"
          ? "The configured recognition model is unavailable to this API project."
          : "The handwriting recognition service could not process this request.";
    return NextResponse.json({ error: message, code }, { status: response.status });
  }

  const result = await response.json();
  const text = result.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
    .find((item: { type?: string }) => item.type === "output_text")?.text?.trim();
  if (!text) return NextResponse.json({ error: "No handwriting was detected." }, { status: 422 });
  return NextResponse.json({ text });
}
