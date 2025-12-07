import { useEffect, useRef, useCallback, useState } from 'react';

const MUSIC_URL = 'https://cdn.pixabay.com/audio/2024/11/04/audio_bbd9d1a5c6.mp3';

export const useWrappedAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
      audio.src = '';
    };
  }, []);

  const fadeIn = useCallback((duration: number = 2000) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    audio.volume = 0;
    audio.play().catch(console.log);
    setIsPlaying(true);

    const targetVolume = 0.3;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = Math.min(volumeStep * currentStep, targetVolume);
      audio.volume = isMuted ? 0 : newVolume;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  }, [isMuted]);

  const fadeOut = useCallback((duration: number = 1500) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = audio.volume;
    const steps = 15;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(startVolume - volumeStep * currentStep, 0);
      audio.volume = newVolume;

      if (currentStep >= steps) {
        audio.pause();
        setIsPlaying(false);
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsMuted(prev => {
      const newMuted = !prev;
      audio.volume = newMuted ? 0 : 0.3;
      return newMuted;
    });
  }, []);

  const playTransitionSound = useCallback(() => {
    // Subtle whoosh sound for slide transitions
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_8cb749a495.mp3');
    audio.volume = isMuted ? 0 : 0.15;
    audio.play().catch(() => {});
  }, [isMuted]);

  return {
    isPlaying,
    isMuted,
    fadeIn,
    fadeOut,
    toggleMute,
    playTransitionSound,
  };
};
