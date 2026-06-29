// ============================================================
// components/invitation/MusicPlayer.tsx
// Pemutar musik background untuk halaman undangan.
// Auto-play setelah interaksi pertama user (browser policy).
// Support: Spotify embed, YouTube embed, direct audio URL.
// ============================================================

"use client";

import { useState, useEffect, useRef } from "react";

interface MusicPlayerProps {
  musicUrl: string;
}

export default function MusicPlayer({ musicUrl }: MusicPlayerProps) {
  const [playing,  setPlaying]  = useState(false);
  const [visible,  setVisible]  = useState(true);
  const [started,  setStarted]  = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deteksi tipe URL
  const isSpotify  = musicUrl.includes("spotify.com");
  const isYouTube  = musicUrl.includes("youtube.com") || musicUrl.includes("youtu.be");
  const isDirectAudio = !isSpotify && !isYouTube;

  // Mulai setelah interaksi pertama user (scroll / click)
  useEffect(() => {
    function handleInteraction() {
      if (!started && isDirectAudio && audioRef.current) {
        audioRef.current.play().then(() => {
          setPlaying(true);
          setStarted(true);
        }).catch(() => {});
      }
    }
    window.addEventListener("scroll",    handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("click",     handleInteraction, { once: true });
    return () => {
      window.removeEventListener("scroll",    handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click",     handleInteraction);
    };
  }, [started, isDirectAudio]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
      setStarted(true);
    }
  }

  // Untuk Spotify / YouTube: tampilkan embed tersembunyi
  // + floating button untuk UX
  const getSpotifyEmbedUrl = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (match) return `https://open.spotify.com/embed/track/${match[1]}?autoplay=1`;
    return null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match =
      url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ??
      url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&loop=1&playlist=${match[1]}`;
    return null;
  };

  if (!visible) return null;

  return (
    <>
      {/* Hidden iframes untuk Spotify/YouTube */}
      {isSpotify && getSpotifyEmbedUrl(musicUrl) && (
        <iframe
          src={getSpotifyEmbedUrl(musicUrl)!}
          className="hidden"
          allow="autoplay; clipboard-write; encrypted-media"
          title="Spotify Player"
        />
      )}
      {isYouTube && getYouTubeEmbedUrl(musicUrl) && (
        <iframe
          src={getYouTubeEmbedUrl(musicUrl)!}
          className="hidden"
          allow="autoplay"
          title="YouTube Player"
        />
      )}

      {/* Audio element untuk direct URL */}
      {isDirectAudio && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Floating music button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Tutup button */}
        <button
          onClick={() => setVisible(false)}
          className="w-7 h-7 rounded-full bg-white/80 text-gray-500 text-xs shadow
                     flex items-center justify-center hover:bg-white transition"
          aria-label="Tutup pemutar musik"
        >
          ×
        </button>

        {/* Play/pause button */}
        {isDirectAudio && (
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg
                       flex items-center justify-center text-xl
                       hover:scale-105 transition-transform"
            aria-label={playing ? "Pause musik" : "Play musik"}
          >
            {playing ? "⏸" : "🎵"}
          </button>
        )}

        {/* Label */}
        <span className="text-[10px] text-white/70 bg-black/30 backdrop-blur
                         px-2 py-0.5 rounded-full">
          {isSpotify ? "Spotify" : isYouTube ? "YouTube" : playing ? "♪ Memutar" : "♪ Musik"}
        </span>
      </div>
    </>
  );
}
