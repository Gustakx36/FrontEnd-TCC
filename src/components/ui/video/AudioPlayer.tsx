"use client";
import { useRef, useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";

export default function CustomPlayer({ 
  audioUrl,
  startTime,
  endTime,
  atualClick,
  click,
  pause,
  automaticView,
  setClick,
  setAtualClick,
  setPause,
  setCurrentTimeWord,
  setAtualClickWord,
  setAutomaticView }: { audioUrl: string, startTime: number, endTime: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setCurrentTimeWord(audio.currentTime);
    }
    const setAudioData = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioData);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioData);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if(pause) {
        audio.pause();
        setPause(false);
        setAtualClick(-1);
        setClick(false);
        setIsPlaying(!isPlaying);
        return;
    };
    if (!audio || !click) return;
    setIsPlaying(true);
    audio.currentTime = startTime;
    audio.play();

    const handleTimeUpdate = () => {
      if (audio.currentTime >= endTime) {
        audio.pause();
        audio.currentTime = endTime;
        console.log(1)
        setIsPlaying(false);
        setAtualClick(-1);
        setClick(false); 
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [startTime, endTime, click, pause]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      setPause(false);
      setAtualClick(-1);
      setAtualClickWord(-1);
      setClick(false);
      audioRef.current.pause();
    } else {
      setPause(false);
      setAtualClick(-1);
      setAtualClickWord(-1);
      setClick(false);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setCurrentTimeWord(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="
      sticky top-0 left-0 
      bg-white dark:bg-gray-900 
      border-b border-gray-300 dark:border-gray-700 
      p-3 flex flex-col gap-2 z-10
    ">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-white text-2xl z-50 font-sans not-italic flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause size={20} strokeWidth={3} />
          ) : (
            <Play size={20} strokeWidth={3} />
          )}
        </button>
        <button
            onClick={() => setAutomaticView(prev => !prev)}
            className={`px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-sm
                ${automaticView ? "text-yellow-500" : "text-white"}
              `}
        >
            A
        </button>

        <span className="dark:text-gray-300 text-xs w-10 text-center">
            {formatTime(currentTime)}
        </span>

        <div className="relative w-full">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <span className="dark:text-gray-400 text-xs w-10 text-center">
            {formatTime(duration)}
        </span>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata"/>
    </div>
  );
}
