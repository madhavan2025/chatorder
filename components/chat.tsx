"use client";

import { useState,useEffect } from "react";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";
import { ChatStatus } from "ai";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Artifact } from "./artifact";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";


async function getForm(id: string) {
  const res = await fetch(`/api/forms/${id}`);
  if (!res.ok) throw new Error("Failed to fetch form");
  return res.json();
}

async function getContents() {
  const res = await fetch("/api/contents");
  if (!res.ok) throw new Error("Failed to fetch contents");
  return res.json();
}
export function Chat({
  id,
  initialMessages,
  initialVisibilityType,
  isReadonly,
  isExpanded: initialExpanded = false,


}: {
  id: string;
  initialMessages: ChatMessage[];
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume?: boolean; //
  isExpanded?: boolean;
  
}) {
  /* ---------------- UI STATE ONLY ---------------- */
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
   const [formConfig, setFormConfig] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
   const [parentWidth, setParentWidth] = useState<number | null>(null);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
   const status: ChatStatus = "ready"; 
   const addToolApprovalResponse = async () => {};
  const regenerate = async () => {};
const stop = async () => {};
const votes: { chatId: string; messageId: string; isUpvoted: boolean }[] = [];
const selectedVisibilityType = initialVisibilityType; // UI stub
const [isExpanded, setIsExpanded] = useState(initialExpanded);
useEffect(() => {
  setIsExpanded(initialExpanded);
}, [initialExpanded]);
const [listingType, setListingType] = useState<"type1" | "type2" | null>(null);

  /* ---------------- NO-OP UI HANDLERS ---------------- */

useEffect(() => {
  function handleMessage(event: MessageEvent) {
    if (event.data?.type === "parentExpandState") {
      setIsExpanded(event.data.value);

      if (event.data.screenWidth) {
        setParentWidth(event.data.screenWidth);
      }
    }
  }

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);

useEffect(() => {
    async function fetchData() {
      try {

        const fetchedForm = await getForm("contactForm");
        setFormConfig(fetchedForm);

        const fetchedContents = await getContents();   // ✅ ADD THIS
      setContents(fetchedContents); 
      } catch (error) {
        console.error("Failed to fetch products or form:", error);
      }
    }

    fetchData();
  }, []);

     const addAssistantMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text }],
      },
    ]);
  };

  
 const sendMessage = async (
  message?: {
    role?: "user" | "assistant" | "system";
    parts?: ChatMessage["parts"];
    text?: string;
  }
) => {
  if (!message) return;

  const text =
    message.text ??
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ??
    "";

  const lower = text.toLowerCase();

  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: message.role ?? "user",
      parts:
        message.parts ??
        (message.text
          ? [{ type: "text", text: message.text }]
          : []),
    },
  ]);
   

 if (lower.includes("show products type1")) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        { type: "text", text: "Here is a product you might like 👇" },
        {
          type: "data-listing",
          data: {
            style: "type1"
          }
        }
      ]
    }
  ]);
  return;
}

if (lower.includes("show products type2")) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        { type: "text", text: "Here are some products you might like 👇" },
        {
          type: "data-listing",
          data: {
            style: "type2"
          }
        }
      ]
    }
  ]);
  return;
}


if (lower.includes("show contents")) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        { type: "text", text: "Here are some contents 👇" },
        {
          type: "data-contents",
          data: {
            items: contents.map((item: any, i: number) => ({
              id: item.id ?? `content-${i}`,
              title: item.title,
              description: item.description ?? ""
            }))
          }
        }
      ]
    }
  ]);

  return;
}
  
  if (lower.includes("show") && (lower.includes("form") || lower.includes("forms"))) {
 setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        { type: "text", text: "Here is the form 👇" },
        {
          type: "data-form",
          data: {
            id: "contactForm"
          }
        }
      ]
    }
  ]);
  return;
}

  
  
  addAssistantMessage("Hi 😊 What can I help you with today?");
};
  return (
    <>
<div
  className="relative flex h-full min-h-0 flex-col items-center bg-white text-black dark:bg-gray-900 dark:text-white"
>
<div className="flex-1 items-center w-full overflow-y-auto min-h-0 bg-transparent">
  <div className="mx-auto  flex flex-col">
  <Messages
    chatId={id}
    isArtifactVisible={false}
    isReadonly={isReadonly}
    messages={messages}
    setMessages={setMessages}
    status={status}
    addToolApprovalResponse={addToolApprovalResponse}
    votes={votes}
   sendMessage={sendMessage}
    regenerate={regenerate}
    isExpanded={isExpanded}
     formConfig={formConfig}   // ✅ ADD THIS
  contents={contents} 
   
  />

     </div>
</div>
    
  {/* Sticky input */}
  {!isReadonly && (
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 mx-auto w-full max-w-4xl px-2 pb-4">
      <MultimodalInput
        chatId={id}
        input={input}
        messages={messages}
        attachments={attachments}
        setInput={setInput}
        setMessages={setMessages}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        status={status}
        stop={stop}
        selectedVisibilityType={selectedVisibilityType}
      />
    </div>
  )}
</div>


     <Artifact
  chatId={id}
  input={input}
  messages={messages}
  attachments={attachments}
  isReadonly={isReadonly}
  selectedVisibilityType={initialVisibilityType}
  sendMessage={sendMessage}
  setInput={setInput}
  setMessages={setMessages}
  setAttachments={setAttachments}
  status={status}
  addToolApprovalResponse={addToolApprovalResponse}
  regenerate={regenerate}
  stop={stop}
  votes={votes}
/>
      <AlertDialog
        open={showCreditCardAlert}
        onOpenChange={setShowCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              Please activate Vercel AI Gateway to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Activate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
