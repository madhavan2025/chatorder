"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";

import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import type { Attachment, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./elements/prompt-input";
import { ArrowUpIcon, PaperclipIcon, StopIcon ,MicIcon} from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "./ui/button";
import type { VisibilityType } from "./visibility-selector";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  setMessages,
  sendMessage,
  className,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const hasAutoFocused = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleStartRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = handleStopRecording;

    mediaRecorder.start();
    setIsRecording(true);
  } catch (err) {
    toast.error("Microphone access denied");
  }
};

const handleStopRecording = async () => {
  setIsRecording(false);

  const blob = new Blob(audioChunksRef.current, {
    type: "audio/webm",
  });

  const file = new File([blob], `recording-${Date.now()}.webm`, {
    type: "audio/webm",
  });

  const uploaded = await uploadFile(file);

  if (uploaded) {
   const newAttachment: Attachment = {
  url: uploaded.url,
  name: uploaded.name,
  contentType: uploaded.contentType,
  resourceType: uploaded.resourceType,
};

    setAttachments((prev) => [...prev, newAttachment]);
  }
};

  useEffect(() => {
    if (!hasAutoFocused.current && width) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        hasAutoFocused.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [width]);

useEffect(() => {
  if (localStorageInput) {
    setInput(localStorageInput);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

 const submitForm = useCallback(() => {
  window.history.pushState({}, "", `/chat/${chatId}`);

  const currentAttachments = [...attachments]; // ✅ snapshot latest state

  setAttachments([]); // clear immediately

  sendMessage({
    role: "user",
    parts: [
      ...currentAttachments.map((attachment) => ({
        type: "file" as const,
        url: attachment.url,
        name: attachment.name ?? "file",
        mediaType:
          attachment.contentType ?? "application/octet-stream",
      })),
      ...(input.trim()
        ? [{ type: "text" as const, text: input }]
        : []),
    ],
  });

  setLocalStorageInput("");
  setInput("");
  resetHeight();

  if (width && width > 768) {
    textareaRef.current?.focus();
  }
}, [attachments, input, sendMessage, setAttachments, setLocalStorageInput, setInput, width, chatId]);

  const uploadFile = async (
  file: File
): Promise<Attachment | undefined> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          name: data.pathname,
          contentType: data.contentType,
          resourceType: data.resourceType,
        };
      }

      const { error } = await response.json();
      toast.error(error);
    } catch {
      toast.error("Failed to upload file");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadQueue(files.map((file) => file.name));

    try {
      const uploaded = await Promise.all(files.map(uploadFile));
      const valid = uploaded.filter(Boolean) as Attachment[];

      setAttachments((prev) => [...prev, ...valid]);
    } finally {
      setUploadQueue([]);
    }
  };

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      <input
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <PromptInput
        onSubmit={(event) => {
          event.preventDefault();

          if (!input.trim() && attachments.length === 0||uploadQueue.length>0||isDeleting) return;

          if (status !== "ready") {
            toast.error("Wait for response to finish");
          } else {
            submitForm();
          }
        }}
        className="rounded-xl border p-3"
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((attachment) => (
              <PreviewAttachment
                key={attachment.url}
                attachment={attachment}
                 onRemove={async () => {
  try {
    setIsDeleting(true);
    await fetch("/api/files/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId: attachment.name,
        resourceType: attachment.resourceType || "video", // this is your public_id
      }),
    });

    setAttachments((prev) =>
      prev.filter((a) => a.url !== attachment.url)
    );
  } catch {
    toast.error("Failed to delete file");
  }finally{
    setIsDeleting(false);
  }
}}
              />
            ))}

            {uploadQueue.map((name) => (
              <PreviewAttachment
                key={name}
                attachment={{ url: "", name, contentType: "" }}
                isUploading
              />
            ))}
          </div>
        )}

      <PromptInputTextarea
  ref={textareaRef}
  value={input}
  onChange={handleInput}
  placeholder="Send a message..."
  rows={1}
  className="
    bg-transparent 
    text-foreground 
    dark:text-white
    placeholder:text-muted-foreground 
    dark:placeholder:text-gray-400
    focus-visible:outline-none
  "
/>

        <PromptInputToolbar>
          <PromptInputTools>
            <Button
  variant="ghost"
  size="icon-sm"
  onClick={(e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  }}
  disabled={status !== "ready"} 
>
  <PaperclipIcon size={14} />
</Button>
 <Button
    variant="ghost"
    size="icon-sm"
    onClick={(e) => {
      e.preventDefault();
      if (isRecording) {
        mediaRecorderRef.current?.stop();
      } else {
        handleStartRecording();
      }
    }}
    disabled={status !== "ready"}
  >
    {isRecording ? <StopIcon size={14} /> : <MicIcon size={14} />}
  </Button>
          </PromptInputTools>

          {status === "submitted" ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <PromptInputSubmit
  disabled={
  (!input.trim() && attachments.length === 0) ||
  uploadQueue.length > 0
}
  status={status}
className="
 bg-blue-500 
    hover:bg-blue-700 
    text-white 
    transition-colors
    disabled:opacity-50 
    disabled:cursor-not-allowed
    cursor-pointer
"
>
  <ArrowUpIcon size={14} />
</PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prev, next) =>
    prev.input === next.input &&
    prev.status === next.status &&
    equal(prev.attachments, next.attachments)
);

function StopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={(e) => {
        e.preventDefault();
        stop();
        setMessages((m) => m);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}