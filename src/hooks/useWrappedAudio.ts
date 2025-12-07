import { useEffect, useRef, useCallback, useState } from 'react';

const MUSIC_URL = 'https://cdn.pixabay.com/audio/2024/11/04/audio_bbd9d1a5c6.mp3';
const WHOOSH_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_8cb749a495.mp3';
const SUCCESS_URL = 'https://cdn.pixabay.com/audio/2024/03/21/audio_c4f8d1cbda.mp3';
const ACHIEVEMENT_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_8e3a1d7a11.mp3';
const CELEBRATION_URL = 'https://cdn.pixabay.com/audio/2024/02/19/audio_e9e1c65d63.mp3';

export const useWrappedAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
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
      audio.volume = isMutedRef.current ? 0 : newVolume;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  }, []);

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

  const playSound = useCallback((url: string, volume: number = 0.15) => {
    if (isMutedRef.current) return;
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  }, []);

  const playTransitionSound = useCallback(() => {
    playSound(WHOOSH_URL, 0.12);
  }, [playSound]);

  const playAchievementSound = useCallback(() => {
    playSound(ACHIEVEMENT_URL, 0.2);
  }, [playSound]);

  const playSuccessSound = useCallback(() => {
    playSound(SUCCESS_URL, 0.18);
  }, [playSound]);

  const playCelebrationSound = useCallback(() => {
    playSound(CELEBRATION_URL, 0.25);
  }, [playSound]);

  return {
    isPlaying,
    isMuted,
    fadeIn,
    fadeOut,
    toggleMute,
    playTransitionSound,
    playAchievementSound,
    playSuccessSound,
    playCelebrationSound,
  };
};
