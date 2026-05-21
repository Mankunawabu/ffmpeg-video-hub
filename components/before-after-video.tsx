"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";

export function BeforeAfterVideo({
  originalUrl,
  compressedUrl,
}: {
  originalUrl: string;
  compressedUrl: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef<HTMLVideoElement>(null);
  const compressedRef = useRef<HTMLVideoElement>(null);

  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync videos
  useEffect(() => {
    const orig = originalRef.current;
    const comp = compressedRef.current;
    if (!orig || !comp) return;

    const syncPlay = () => {
      if (orig.paused !== comp.paused) {
        if (orig.paused) comp.pause();
        else void comp.play();
      }
    };
    const syncPause = () => comp.pause();
    const syncSeek = () => { comp.currentTime = orig.currentTime; };

    orig.addEventListener("play", syncPlay);
    orig.addEventListener("pause", syncPause);
    orig.addEventListener("seeked", syncSeek);

    return () => {
      orig.removeEventListener("play", syncPlay);
      orig.removeEventListener("pause", syncPause);
      orig.removeEventListener("seeked", syncSeek);
    };
  }, []);

  // Time update
  useEffect(() => {
    const orig = originalRef.current;
    if (!orig) return;
    
    const handleTimeUpdate = () => {
      if (orig.duration) {
        setProgress((orig.currentTime / orig.duration) * 100);
        setDuration(orig.duration);
      }
    };
    orig.addEventListener("timeupdate", handleTimeUpdate);
    orig.addEventListener("loadedmetadata", handleTimeUpdate);
    
    return () => {
      orig.removeEventListener("timeupdate", handleTimeUpdate);
      orig.removeEventListener("loadedmetadata", handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (originalRef.current?.paused) {
      void originalRef.current.play();
      setIsPlaying(true);
    } else {
      originalRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (originalRef.current) {
      originalRef.current.currentTime = (val / 100) * (originalRef.current.duration || 0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (originalRef.current) originalRef.current.muted = !isMuted;
    if (compressedRef.current) compressedRef.current.muted = !isMuted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Drag logic
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "group relative flex flex-col overflow-hidden bg-black",
        isFullscreen ? "h-screen w-screen" : "aspect-video w-full rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.08)] border border-neutral-200 dark:border-white/10"
      )}
    >
      {/* Videos Container */}
      <div 
        className="relative flex-1 cursor-ew-resize select-none"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* Compressed (Right/Bottom Layer) */}
        <video
          ref={compressedRef}
          src={compressedUrl}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          muted={isMuted}
        />
        
        {/* Original (Left/Top Layer) */}
        <video
          ref={originalRef}
          src={originalUrl}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          muted={isMuted}
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          onClick={(e) => {
            // Prevent drag from triggering click if it moved
            e.stopPropagation();
            togglePlay();
          }}
        />

        {/* Divider Line */}
        <div 
          className="absolute inset-y-0 w-1 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 2px)` }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="pointer-events-none absolute left-4 top-4 rounded bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur">
          ASLI
        </div>
        <div className="pointer-events-none absolute right-4 top-4 rounded bg-emerald-500/80 px-2 py-1 text-xs font-bold text-white backdrop-blur">
          HASIL KOMPRESI
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center gap-4 text-white">
          <button onClick={togglePlay} className="hover:text-emerald-400 transition">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          
          <div className="flex flex-1 items-center gap-2">
            <span className="text-xs font-medium tabular-nums">{formatTime((progress / 100) * duration || 0)}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-emerald-500"
            />
            <span className="text-xs font-medium tabular-nums">{formatTime(duration)}</span>
          </div>

          <button onClick={toggleMute} className="hover:text-emerald-400 transition">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button onClick={toggleFullscreen} className="hover:text-emerald-400 transition">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
