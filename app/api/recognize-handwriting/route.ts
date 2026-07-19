import { NextResponse } from "next/server";

type OcrSpaceParsedResult = {
  ParsedText?: string;
  ErrorMessage?: string;
  ErrorDetails?: string;
};

type OcrSpaceResponse = {
  ParsedResults?: OcrSpaceParsedResult[];
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string | string[];
};

const MAX_FREE_TIER_BYTES = 1024 * 1024;

function firstMessage(...values: Array<string | string[] | undefined>) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const message = value.find(Boolean);
      if (message) return message;
    } else if (value) {
      return value;
    }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OCR_SPACE_API_KEY;
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

  const base64 = image.slice(image.indexOf(",") + 1);
  const imageBytes = Math.ceil((base64.length * 3) / 4);
  if (imageBytes > MAX_FREE_TIER_BYTES)
    return NextResponse.json(
      { error: "The canvas image exceeds OCR.space's 1 MB free-plan limit." },
      { status: 413 }
    );

  const form = new FormData();
  form.set("base64Image", image);
  form.set("language", "auto");
  form.set("OCREngine", "3");
  form.set("isOverlayRequired", "false");
  form.set("scale", "true");

  let response: Response;
  try {
    response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json(
      { error: "OCR.space could not be reached. Please try again." },
      { status: 502 }
    );
  }

  const result = (await response.json().catch(() => null)) as
    | OcrSpaceResponse
    | null;
  const parsed = result?.ParsedResults?.[0];

  if (!response.ok || !result || result.IsErroredOnProcessing || !parsed) {
    const upstreamMessage = firstMessage(
      result?.ErrorMessage,
      result?.ErrorDetails,
      parsed?.ErrorMessage,
      parsed?.ErrorDetails
    );
    const invalidKey =
      response.status === 401 || /api.?key/i.test(upstreamMessage ?? "");
    const rateLimited =
      response.status === 429 ||
      /limit|quota|conversions/i.test(upstreamMessage ?? "");
    const message = invalidKey
      ? "The OCR.space API key is invalid or inactive."
      : rateLimited
        ? "The OCR.space free-tier request limit has been reached."
        : upstreamMessage || "OCR.space could not process this image.";

    return NextResponse.json(
      { error: message, code: result?.OCRExitCode },
      { status: response.ok ? 422 : response.status }
    );
  }

  const text = parsed.ParsedText?.trim();
  if (!text)
    return NextResponse.json(
      { error: "No handwriting was detected." },
      { status: 422 }
    );

  return NextResponse.json({ text, hints: [], unclear: [] });
}
