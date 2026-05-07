import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: transcriptionId } = await params;

  // Validate transcription ID
  if (!transcriptionId || typeof transcriptionId !== "string") {
    return new Response("Invalid transcription ID", { status: 400 });
  }

  // Set up Server-Sent Events headers
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          subscriber.unsubscribe();
          subscriber.quit();
          controller.close();
        } catch (e) {
          // Ignore errors during close/cleanup
        }
      };

      // Send initial status if available
      try {
        if (!request.signal.aborted) {
          const initialStatus = await redis.get(
            `transcription:progress:${transcriptionId}:last`
          );
          if (initialStatus && !isClosed && !request.signal.aborted) {
            controller.enqueue(encoder.encode(`data: ${initialStatus}\n\n`));
          }
        }
      } catch (err) {
        console.error("Error getting initial status:", err);
      }

      // Set up Redis subscription
      const subscriber = redis.duplicate();

      try {
        await subscriber.subscribe(`transcription:progress:${transcriptionId}`);

        subscriber.on("message", (_channel, message) => {
          if (isClosed || request.signal.aborted) return;

          try {
            // Send SSE message
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));

            // Check if this is a completion message
            const data = JSON.parse(message);
            if (data.status === "completed" || data.status === "error") {
              cleanup();
            }
          } catch (err) {
            console.error("Error processing SSE message:", err);
          }
        });
      } catch (err) {
        console.error("Error setting up Redis subscriber:", err);
        cleanup();
      }

      // Handle client disconnect or stream closure
      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      // Called if the stream is cancelled by the client
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
