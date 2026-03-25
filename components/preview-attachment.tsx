import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import type { Attachment } from "@/lib/types";
import { Loader } from "./elements/loader";
import { CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
  variant
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
  variant?: "compact" | "chat";

}) => {
  const { name, url, contentType } = attachment;
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [duration, setDuration] = useState(0);

  useEffect(() => {
  if (contentType?.startsWith("audio") && audioRef.current) {
    const audio = audioRef.current;
    const onLoaded = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }

  if (contentType?.startsWith("video") && videoRef.current) {
    const video = videoRef.current;
    const onLoaded = () => setDuration(video.duration);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }
}, [contentType]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };
   return (
    <div
      className={cn(
        "group relative overflow-hidden border bg-muted",
        variant === "compact"
          ? "w-12 h-12 rounded-md bg-muted"
          : "w-fit max-w-xs rounded-2xl px-3 py-2 bg-gray-100 dark:bg-gray-800"
      )}
      data-testid="input-attachment-preview"
    >
      {contentType?.startsWith("image") ? (
        variant === "compact" ? (
          <Image
            alt={name ?? "image"}
            className="size-full object-cover"
            height={64}
            src={url}
            width={64}
          />
        ) : (
          <img src={url} alt={name} className="max-w-xs rounded-lg" />
        )
      ) : contentType?.startsWith("audio") ? (
        <div className="relative">
          
            <audio
              ref={audioRef}
              controls
              className={cn(
                "outline-none",
                variant === "compact" ? "w-full h-6" : "w-[240px] h-10"
              )}
            >
              <source src={url} type={contentType} />
            </audio>
          
        </div>
      ) : contentType?.startsWith("video") ? (
        <div className="relative">
          
            <video
              ref={videoRef}
              controls
              className={cn(
                "rounded",
                variant === "compact" ? "size-full" : "max-w-xs"
              )}
            >
              <source src={url} type={contentType} />
            </video>
         
          
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <a
            href={url}
            target="_blank"
            className={cn(
              "underline break-all",
              variant === "compact"
                ? "text-[10px] text-white"
                : "text-sm text-blue-500"
            )}
          >
            📄 {name || "Open file"}
          </a>
        </div>
      )}

      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50"
          data-testid="input-attachment-loader"
        >
          <Loader size={16} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className={cn(
            "absolute z-10 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
            variant === "compact"
              ? "top-1 right-1 h-5 w-5"
              : "top-2 right-2 h-6 w-6 bg-black/60 hover:bg-black text-white"
          )}
          onClick={onRemove}
          size="icon"
          variant="destructive"
        >
          <CrossSmallIcon size={12} />
        </Button>
      )}

      {variant === "compact" && (
        <div className="absolute inset-x-0 bottom-0 truncate bg-black/80 px-1 py-0.5 text-[10px] text-white">
          {name}
        </div>
      )}
    </div>
  );
};