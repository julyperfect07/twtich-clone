"use client";

import { useRef, useState, useEffect } from "react";
import { Participant, Track } from "livekit-client";
import { useTracks } from "@livekit/components-react";

import { VolumeControl } from "./volume-control";
import { FullscreenControl } from "./fullscreen-control";

interface LiveVideoProps {
  participant: Participant;
};

export const LiveVideo = ({
  participant,
}: LiveVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0);

  const onVolumeChange = (value: number) => {
    setVolume(+value);
    if (videoRef?.current) {
      videoRef.current.muted = value === 0;
      videoRef.current.volume = +value * 0.01;
    }
  };

  const toggleMute = () => {
    const isMuted = volume === 0;

    setVolume(isMuted ? 50 : 0);

    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen()
    } else if (wrapperRef?.current) {
      wrapperRef.current.requestFullscreen()
    }
  };

  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const participantTracks = tracks.filter(
      (track) => track.participant.identity === participant.identity,
    );

    participantTracks.forEach((track) => {
      if (videoElement) {
        track.publication.track?.attach(videoElement);
      }
    });

    return () => {
      participantTracks.forEach((track) => {
        if (videoElement) {
          track.publication.track?.detach(videoElement);
        }
      });
    };
  }, [participant.identity, tracks]);

  return (
    <div 
      ref={wrapperRef}
      className="relative h-full flex"
    >
      <video ref={videoRef} width="100%" muted />
      <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 hover:transition-all">
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
          <VolumeControl
            onChange={onVolumeChange}
            value={volume}
            onToggle={toggleMute}
          />
          <FullscreenControl
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
};
