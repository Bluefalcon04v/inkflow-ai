const REIMAGINE_PROMPT =
  "Transform this rough hand-drawn sketch into a richly detailed, professionally finished illustration. Preserve its core composition, viewpoint, silhouettes, object count, placement, pose, and intentional colors. Infer incomplete shapes, correct geometry and perspective, and add coherent materials, textures, environment, depth, cinematic lighting, shadows, and harmonious color. Do not add text, labels, signatures, borders, watermarks, UI elements, or unrelated subjects.";

type PipelineEvent = {
  type: "progress" | "result" | "error";
  stage?: "local" | "pollinations" | "pixazo" | "complete";
  message: string;
  image?: string;
  provider?: "pollinations" | "pixazo";
  warning?: string;
};

function errorMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") return fallback;
  const result = value as Record<string, unknown>;
  const nested = result.error;
  if (typeof result.message === "string") return result.message;
  if (typeof nested === "string") return nested;
  if (nested && typeof nested === "object") {
    const message = (nested as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("The generated image could not be downloaded.");
  const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  const pollinationsKey = process.env.POLLINATIONS_API_KEY;
  const pixazoKey = process.env.PIXAZO_API_KEY;
  const usePollinations =
    process.env.ENABLE_POLLINATIONS_STAGE === "true" && Boolean(pollinationsKey);
  const pollinationsModel = process.env.POLLINATIONS_IMAGE_MODEL ?? "kontext";
  const pixazoEndpoint =
    process.env.PIXAZO_IMAGE_ENDPOINT ??
    "https://gateway.pixazo.ai/inpainting/v1/getImage";

  const { image, mask, description } = (await request.json()) as {
    image?: string;
    mask?: string;
    description?: string;
  };
  const prompt = description?.trim()
    ? `The artist says this sketch depicts: ${description.trim()}. ${REIMAGINE_PROMPT}`
    : REIMAGINE_PROMPT;
  const match = image?.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match)
    return Response.json(
      { error: "Draw something before enhancing it." },
      { status: 400 }
    );
  if (!pixazoKey)
    return Response.json(
      {
        error: "Add PIXAZO_API_KEY to .env.local for AI enhancement.",
      },
      { status: 503 }
    );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: PipelineEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        send({
          type: "progress",
          stage: "local",
          message: "Local cleanup complete",
        });

        let referenceUrl = image;
        let pollinationsOutput = "";
        let pollinationsWarning = "";

        if (usePollinations && pollinationsKey) {
          send({
            type: "progress",
            stage: "pollinations",
            message: "Pollinations is interpreting your sketch",
          });
          try {
            const upload = await fetch("https://media.pollinations.ai/upload", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${pollinationsKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: image,
                contentType: match[1],
                name: "inkflow-sketch.png",
              }),
            });
            const uploadResult = await upload.json().catch(() => null);
            if (!upload.ok || !uploadResult?.url)
              throw new Error(
                errorMessage(uploadResult, "Pollinations could not upload the sketch.")
              );

            const generated = await fetch(
              "https://gen.pollinations.ai/v1/images/generations",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${pollinationsKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prompt,
                  model: pollinationsModel,
                  image: uploadResult.url,
                  size: "1024x1024",
                  quality: "high",
                  response_format: "url",
                  safe: true,
                }),
              }
            );
            const generatedResult = await generated.json().catch(() => null);
            referenceUrl = generatedResult?.data?.[0]?.url ?? "";
            if (!generated.ok || !referenceUrl)
              throw new Error(
                errorMessage(
                  generatedResult,
                  "Pollinations could not interpret the sketch."
                )
              );
            pollinationsOutput = await imageUrlToDataUrl(referenceUrl);
          } catch (error) {
            pollinationsWarning =
              error instanceof Error ? error.message : "Pollinations was unavailable.";
          }
        }

        if (pixazoKey && referenceUrl) {
          send({
            type: "progress",
            stage: "pixazo",
            message: "Pixazo is creating the final detailed image",
          });
          try {
            const generated = await fetch(pixazoEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key": pixazoKey,
              },
              body: JSON.stringify({
                prompt,
                imageUrl: referenceUrl,
                maskUrl: mask,
                negativePrompt:
                  "text, watermark, signature, border, UI, distorted composition, unrelated objects, low quality, blurry",
                height: 1024,
                width: 1024,
                num_steps: 20,
                guidance: 6,
              }),
            });
            const result = await generated.json().catch(() => null);
            const finalUrl = result?.imageUrl ?? result?.output ?? result?.data?.[0]?.url;
            if (!generated.ok || !finalUrl)
              throw new Error(
                errorMessage(result, "Pixazo could not complete the final image.")
              );
            const finalImage = await imageUrlToDataUrl(finalUrl);
            send({
              type: "result",
              stage: "complete",
              provider: "pixazo",
              message: "Final image ready",
              image: finalImage,
              warning: pollinationsWarning || undefined,
            });
            return;
          } catch (error) {
            const pixazoWarning =
              error instanceof Error ? error.message : "Pixazo was unavailable.";
            if (pollinationsOutput) {
              send({
                type: "result",
                stage: "complete",
                provider: "pollinations",
                message: "Intermediate image ready",
                image: pollinationsOutput,
                warning: `Pixazo finalization was unavailable: ${pixazoWarning}`,
              });
              return;
            }
            throw new Error(pixazoWarning);
          }
        }

        if (pollinationsOutput) {
          send({
            type: "result",
            stage: "complete",
            provider: "pollinations",
            message: "Intermediate image ready",
            image: pollinationsOutput,
            warning: pixazoKey
              ? "Pixazo was skipped because no intermediate image URL was available."
              : "Add PIXAZO_API_KEY for the final refinement pass.",
          });
        } else {
          throw new Error(
            pollinationsWarning ||
              "The AI providers could not enhance this sketch. Try again shortly."
          );
        }
      } catch (error) {
        send({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "The sketch could not be enhanced.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
