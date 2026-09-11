"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { LiveKitRoom, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

import { useViewerToken } from "@/hooks/use-viewer-token";

interface LivePreviewProps {
  hostIdentity: string;
  fallbackUrl: string;
  thumbnailUrl: string | null;
}

const PreviewVideo = ({ hostIdentity }: { hostIdentity: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const track = useTracks([Track.Source.Camera]).find(
    (item) => item.participant.identity === hostIdentity,
  );

  useEffect(() => {
    const mediaTrack = track?.publication.track;
    const video = videoRef.current;

    if (!mediaTrack || !video) return;

    mediaTrack.attach(video);
    return () => {
      mediaTrack.detach(video);
    };
  }, [track?.publication.track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
};

export const LivePreview = ({
  hostIdentity,
  fallbackUrl,
  thumbnailUrl,
}: LivePreviewProps) => {
  const { token, error } = useViewerToken(hostIdentity);
  const placeholderUrl = thumbnailUrl || fallbackUrl;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md bg-background">
      <Image src={placeholderUrl} fill alt="Stream preview" className="object-cover" />
      {token && !error && (
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          connect
          audio={false}
          video={false}
          options={{ adaptiveStream: true }}
          className="absolute inset-0"
        >
          <PreviewVideo hostIdentity={hostIdentity} />
        </LiveKitRoom>
      )}
    </div>
  );
};
