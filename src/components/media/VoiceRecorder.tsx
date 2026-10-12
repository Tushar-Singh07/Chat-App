import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Send, Square } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface VoiceRecorderProps {
  onSendVoiceNote: (durationStr: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoiceNote,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  // Timer counter when recording
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Audio preview playback simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingPreview && !isRecording) {
      interval = setInterval(() => {
        setPreviewProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingPreview(false);
            return 0;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlayingPreview, isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formattedDuration = formatTime(seconds);

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSend = () => {
    onSendVoiceNote(formattedDuration);
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-zinc-100 dark:bg-[#202c33] border-t border-zinc-200 dark:border-[#222d34] animate-in slide-in-from-bottom-2 duration-150 select-none">
      {isRecording ? (
        /* LIVE RECORDING STATE */
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2.5 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Cancel Recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span>Recording {formattedDuration}</span>
            </div>
          </div>

          {/* Equalizer Live Waveform Simulation */}
          <div className="flex items-center gap-1 h-6 px-4">
            {[40, 80, 50, 100, 60, 90, 45, 75, 30, 85, 65, 40, 95].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="w-1 bg-rose-500 rounded-full animate-pulse"
              />
            ))}
          </div>

          <button
            onClick={handleStopRecording}
            className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 transition-transform active:scale-95"
            title="Stop Recording"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        </div>
      ) : (
        /* PRE-SEND PREVIEW STATE */
        <div className="flex items-center justify-between w-full gap-4">
          <button
            onClick={onCancel}
            className="p-2.5 rounded-full text-zinc-500 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-[#111b21] transition-colors"
            title="Discard Recording"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 flex-1 bg-white dark:bg-[#111b21] px-4 py-2 rounded-2xl border border-zinc-200 dark:border-[#222d34]">
            <button
              onClick={() => setIsPlayingPreview(!isPlayingPreview)}
              className="p-2 rounded-full bg-emerald-600 dark:bg-[#00a884] text-white"
            >
              {isPlayingPreview ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <AudioWaveform
              progress={previewProgress}
              onSeek={(pct) => setPreviewProgress(pct)}
              className="flex-1"
            />

            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {formattedDuration}
            </span>
          </div>

          <button
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#00a884] dark:hover:bg-[#008f6f] text-white shadow-sm transition-transform active:scale-95"
            title="Send Voice Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
