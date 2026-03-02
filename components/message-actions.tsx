import equal from "fast-deep-equal";
import { memo,useState,useEffect,useRef } from "react";
import { useSWRConfig } from "swr";
import { useCopyToClipboard } from "usehooks-ts";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { Action, Actions } from "./elements/actions";
import { CopyIcon, PencilEditIcon, ThumbDownIcon, ThumbUpIcon} from "./icons";
import { CheckIcon } from "lucide-react";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  setMode,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMode?: (mode: "view" | "edit") => void;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
    // Added state for copied tooltip toggle
  const [copied, setCopied] = useState(false);
  const [localVote, setLocalVote] = useState<"up" | "down" | null>(null);
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ Keep localVote synced with server vote
  useEffect(() => {
    if (!vote) {
      setLocalVote(null);
    } else {
      setLocalVote(vote.isUpvoted ? "up" : "down");
    }
  }, [vote]);

  if (isLoading) return null;

  const textFromParts = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

   const handleCopy = async () => {
    if (!textFromParts) return;

    await copyToClipboard(textFromParts);
    setCopied(true);
     if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  // Show "Copied!" for 3 seconds (3000 ms)
  timeoutRef.current = setTimeout(() => {
    setCopied(false);
    timeoutRef.current = null;
  }, 3000);
};

  const handleVote = async (type: "up" | "down") => {
    const newVote = localVote === type ? null : type; // toggle behavior
    setLocalVote(newVote);

    await fetch("/api/vote", {
      method: "PATCH",
      body: JSON.stringify({
        chatId,
        messageId: message.id,
        type: newVote ?? "none",
      }),
    });

    mutate<Vote[]>(
      `/api/vote?chatId=${chatId}`,
      (currentVotes) => {
        if (!currentVotes) return [];

        const votesWithoutCurrent = currentVotes.filter(
          (v) => v.messageId !== message.id
        );

        if (!newVote) return votesWithoutCurrent;

        return [
          ...votesWithoutCurrent,
          {
            chatId,
            messageId: message.id,
            isUpvoted: newVote === "up",
          },
        ];
      },
      { revalidate: false }
    );
  };
  // User messages get edit (on hover) and copy actions
  if (message.role === "user") {
    return (
      <Actions className="-mr-0.5 justify-end">
        <div className="relative">
          {setMode && (
            <Action
              className="absolute top-0 -left-10 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
              data-testid="message-edit-button"
              onClick={() => setMode("edit")}
              tooltip="Edit"
            >
              <PencilEditIcon />
            </Action>
          )}
        <Action
            onClick={handleCopy}
            tooltip={copied ? "Copied!" : "Copy"}
          >
            <span
    className={`transition-colors ${
      copied ? "text-green-500" : "text-muted-foreground"
    }`}
  >
    {copied ? <CheckIcon /> : <CopyIcon />}
  </span>
          </Action>
        </div>
      </Actions>
    );
  }

  return (
    <Actions className="-ml-0.5">
        <Action
        onClick={handleCopy}
        tooltip={copied ? "Copied!" : "Copy"}
      >
          <span
    className={`transition-colors ${
      copied ? "text-green-500" : "text-muted-foreground"
    }`}
  >
    {copied ? <CheckIcon /> : <CopyIcon />}
  </span>
      </Action>
      <Action onClick={() => handleVote("up")} tooltip="Upvote">
        <span
          className={`transition-colors ${
            localVote === "up" ? "text-green-500" : "text-muted-foreground"
          }`}
        >
          <ThumbUpIcon />
        </span>
      </Action>

      {/* Downvote */}
      <Action onClick={() => handleVote("down")} tooltip="Downvote">
        <span
          className={`transition-colors ${
            localVote === "down" ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <ThumbDownIcon />
        </span>
      </Action>
    </Actions>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }

    return true;
  }
);
