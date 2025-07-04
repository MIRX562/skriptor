import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const transcriptionId = params.id;

  // Validate transcription ID
  if (!transcriptionId || typeof transcriptionId !== "string") {
    return new Response("Invalid transcription ID", { status: 400 });
  }

  // Set up Server-Sent Events headers
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial status if available
      try {
        const initialStatus = await redis.get(
          `transcription:status:${transcriptionId}`
        );
        if (initialStatus) {
          controller.enqueue(encoder.encode(`data: ${initialStatus}\n\n`));
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                id: transcriptionId,
                status: "pending",
                message: "Waiting for worker to process",
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        }
      } catch (err) {
        console.error("Error getting initial status:", err);
      }

      // Set up Redis subscription
      const subscriber = redis.duplicate();
      await subscriber.connect();

      await subscriber.subscribe(`transcription:progress:${transcriptionId}`);

      subscriber.on("message", (_channel, message) => {
        try {
          // Send SSE message
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));

          // Check if this is a completion message
          const data = JSON.parse(message);
          if (data.status === "completed" || data.status === "error") {
            // Close the stream on completion or error
            setTimeout(() => {
              subscriber.unsubscribe();
              subscriber.quit();
              controller.close();
            }, 1000); // Small delay to ensure message is sent
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      });

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        subscriber.unsubscribe();
        subscriber.quit();
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
