import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";

import { db } from "@/lib/db";

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return new Response("LiveKit is not configured", { status: 500 });
  }

  const receiver = new WebhookReceiver(apiKey, apiSecret);
  const body = await req.text();
  const headerPayload = await headers();
  const authorization = headerPayload.get("Authorization");

  if (!authorization) {
    return new Response("No authorization header", { status: 400 });
  }

  const event = await receiver.receive(body, authorization);

  if (event.event === "ingress_started") {
    await db.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: true,
      },
    });
  }

  if (event.event === "ingress_ended") {
    await db.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: false,
      },
    });
  }
}
