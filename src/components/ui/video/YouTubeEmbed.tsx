"use client";
import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

type AspectRatio = "16:9" | "4:3" | "21:9" | "1:1";

interface YouTubeEmbedProps {
  aspectRatio?: AspectRatio;
  title?: string;
  className?: string;
  idSolicitation: string;
  arquivo: string;
}

async function measureSpeed() {
  const t0 = performance.now();
  try {
    const resp = await fetch(
      "https://cutwise.site/backend/ping?_=" + Date.now(),
      { cache: "no-store" }
    );
    const blob = await resp.blob();
    const t1 = performance.now();

    const seconds = (t1 - t0) / 1000;
    const bits = blob.size * 8;
    const mbps = bits / seconds / 1_000_000;

    return mbps.toFixed(2);
  } catch (err) {
    console.error("Erro no teste:", err);
    return null;
  }
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  aspectRatio = "16:9",
  title = "YouTube video",
  className = "",
  idSolicitation = "",
  arquivo = "",
}) => {
  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-4/3",
    "21:9": "aspect-21/9",
    "1:1": "aspect-square",
    auto: "aspect-auto",
  }[aspectRatio];

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [velocidade, setVelocidade] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    measureSpeed().then((mbps) => {
      if (mbps) {
        setVelocidade((prev) => Math.max(parseFloat(mbps), prev));
      }
    });
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    setLoading(true);
  }, [arquivo]);

  const handleToggle = (videoElement: HTMLVideoElement) => {
    if (!videoElement) return;

    if (videoElement.paused) {
      const allVideos = document.querySelectorAll("video");
      allVideos.forEach((vid) => {
        if (vid !== videoElement) {
          vid.pause();
          vid.currentTime = 0;
        }
      });

      videoElement
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Erro ao dar play:", err);
        });
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch (err) {
          console.warn("Não foi possível travar a orientação:", err);
        }
      }
    } else {
      await document.exitFullscreen();
      if (screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (err) {
          console.warn("Não foi possível desbloquear a orientação:", err);
        }
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const handleEnded = () => {
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      setShowControls(true);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        if (!isSeeking) {
          setShowControls(false);
        }
      }, 1000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleInteraction);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleInteraction);
      }
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isSeeking]);

  return (
    <div ref={containerRef} className={`relative flex ${!showControls ? "cursor-none" : "cursor-auto"}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <video
        ref={videoRef}
        src={`https://cutwise.site/backend/video_low/${idSolicitation}/${arquivo}`}
        className="block w-full h-auto"
        controls={false}
        onClick={() => {
          if (!videoRef.current) return;

          if (isSeeking) return;

          if (!showControls) {
            setShowControls(true);
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            inactivityTimer.current = setTimeout(() => {
              if (!isSeeking) setShowControls(false);
            }, 1000);
            return;
        }

        handleToggle(videoRef.current!);
      }}
        onLoadedData={() => setLoading(false)}
      />


      {!loading && showControls && (
        <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white p-3 flex flex-col gap-2 transition-opacity duration-500">
          <input
            type="range"
            min={0}
            max={duration}
            step="0.1"
            value={currentTime}
            onMouseDown={() => {
              setIsSeeking(true);
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            onTouchStart={() => {
              setIsSeeking(true);
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            onChange={(e) => {
              if (!videoRef.current) return;
              const newTime = parseFloat(e.target.value);
              setCurrentTime(newTime); // só move a bolinha enquanto arrasta
            }}
            onMouseUp={(e) => {
              setIsSeeking(false);
              if (!videoRef.current) return;
              const newTime = parseFloat(e.currentTarget.value);
              videoRef.current.currentTime = newTime;
              // 👉 se quiser voltar automático:
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }}
            onTouchEnd={(e) => {
              setIsSeeking(false);
              if (!videoRef.current) return;
              const newTime = parseFloat(e.currentTarget.value);
              videoRef.current.currentTime = newTime;
              // 👉 se quiser voltar automático:
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (!videoRef.current) return;
                if (videoRef.current.paused) {
                  videoRef.current.play();
                  setIsPlaying(true);
                } else {
                  videoRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              className="px-3 py-1 bg-gray-800 rounded text-white text-2xl z-50 font-sans not-italic flex items-center justify-center"
            >
              {isPlaying ? <Pause size={20} strokeWidth={3} /> : <Play size={20} strokeWidth={3} />}
            </button>

            <span className="text-sm">
              <div
                style={{
                  ["--p" as any]: parseInt(
                    arquivo.match(/_prob\(([\d.]+)\)/)?.[1] * 100
                  ),
                  background: "hsl(calc(var(--p) * 1.2), 95%, 35%)",
                }}
              >
                <p className="p-1 text-black font-bold">
                  {parseInt(
                    arquivo.match(/_prob\(([\d.]+)\)/)?.[1] * 100
                  )}
                </p>
              </div>
            </span>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-gray-800 rounded"
            >
              {isFullscreen ? (
                <Minimize size={20} strokeWidth={3} />
              ) : (
                <Maximize size={20} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeEmbed;
