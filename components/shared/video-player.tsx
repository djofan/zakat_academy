"use client";

import * as React from "react";

interface VideoPlayerProps {
  provider: "YOUTUBE" | "VIMEO" | "BUNNY";
  url: string;
  className?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

export function VideoPlayer({ provider, url, className }: VideoPlayerProps) {
  if (!url) return null;

  let src = "";
  if (provider === "YOUTUBE") {
    const id = getYouTubeId(url);
    src = id ? `https://www.youtube.com/embed/${id}` : "";
  } else if (provider === "VIMEO") {
    const id = getVimeoId(url);
    src = id ? `https://player.vimeo.com/video/${id}` : "";
  } else if (provider === "BUNNY") {
    src = url;
  }

  if (!src) return null;

  return (
    <div className={`aspect-video w-full ${className ?? ""}`}>
      <iframe
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className="h-full w-full rounded-lg border"
        loading="lazy"
      />
    </div>
  );
}
