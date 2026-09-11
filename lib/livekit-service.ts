import { cache } from "react";
import { IngressClient } from "livekit-server-sdk";

import { db } from "@/lib/db";

const INGRESS_PUBLISHING_STATUS = 2;

/**
 * Keep stream status accurate even when LiveKit cannot reach the webhook
 * (for example while the app is running on localhost).
 */
export const syncLiveKitStreamStatus = cache(async () => {
  const apiUrl = process.env.LIVEKIT_API_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiUrl || !apiKey || !apiSecret) return;

  try {
    const ingressClient = new IngressClient(apiUrl, apiKey, apiSecret);
    const ingresses = await ingressClient.listIngress();
    const liveRoomNames = ingresses
      .filter(
        (ingress) =>
          ingress.state?.status === INGRESS_PUBLISHING_STATUS,
      )
      .map((ingress) => ingress.roomName)
      .filter((roomName): roomName is string => Boolean(roomName));

    await db.$transaction([
      db.stream.updateMany({
        where: {
          isLive: true,
          userId: { notIn: liveRoomNames },
        },
        data: { isLive: false },
      }),
      db.stream.updateMany({
        where: { userId: { in: liveRoomNames } },
        data: { isLive: true },
      }),
    ]);
  } catch (error) {
    // A temporary LiveKit API failure should not prevent pages from rendering.
    console.error("Failed to sync LiveKit stream status", error);
  }
});
