import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

export default function AudioPlayer({
  url,
  fileName,
  onRemove,
}: {
  url: string;
  fileName?: string;
  onRemove?: () => void;
}) {
  // Simple player for blob url
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(null);
  }, [url]);

  const handlePlay = () => {
    setPlaying(true);
    audioRef.current?.play();
  };
  const handlePause = () => {
    setPlaying(false);
    audioRef.current?.pause();
  };

  if (!url) return null;

  return (
    <div className="flex flex-col items-center w-full mt-4">
      <div className="flex items-center gap-2 w-full">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          type="button"
          onClick={playing ? handlePause : handlePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>
        <audio
          ref={audioRef}
          src={url}
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          className="hidden"
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground truncate">
            {fileName || "recording.webm"}
          </div>
          <div className="text-xs">
            {duration !== null ? (
              <>
                {current.toFixed(1)}s / {duration.toFixed(1)}s
              </>
            ) : (
              "--"
            )}
          </div>
        </div>
        {onRemove && (
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={onRemove}
            aria-label="Remove audio"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
