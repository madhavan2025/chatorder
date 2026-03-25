"use client";

import { useState,useEffect,useRef } from "react";
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
   const [status, setStatus] = useState<ChatStatus>("ready");
   const addToolApprovalResponse = async () => {};
  const regenerate = async () => {};
const stop = async () => {
  controllerRef.current?.abort(); // ✅ cancel request
  setStatus("ready"); // ✅ reset UI
};
const votes: { chatId: string; messageId: string; isUpvoted: boolean }[] = [];
const selectedVisibilityType = initialVisibilityType; // UI stub
const [isLoading, setIsLoading] = useState(false);
const controllerRef = useRef<AbortController | null>(null);
const [isExpanded, setIsExpanded] = useState(initialExpanded);
useEffect(() => {
  setIsExpanded(initialExpanded);
}, [initialExpanded]);


const customerId = "client-d";

function getOrCreateUserId() {
  if (typeof window === "undefined") return null;

  let userId = localStorage.getItem("chat_user_id");

  if (!userId) {
    userId = "client-d-" + crypto.randomUUID();
    localStorage.setItem("chat_user_id", userId);
  }

  return userId;
}

async function saveToDB(chatId: string, messages: ChatMessage[]) {
  const userId = getOrCreateUserId();

  // Group messages into Q/A pairs
  const qaPairs: { question: ChatMessage; answer?: ChatMessage }[] = [];
  let lastUserMessage: ChatMessage | null = null;

  for (const msg of messages) {
    if (msg.role === "user") {
      lastUserMessage = msg;
      qaPairs.push({ question: msg });
    } else if (msg.role === "assistant" && lastUserMessage) {
      // attach assistant response to last user question
      qaPairs[qaPairs.length - 1].answer = msg;
      lastUserMessage = null; // reset
    }
  }

  await fetch("/api/save-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      customerId,
      chatId,
      qaPairs, // save structured Q/A
    }),
  });
}

useEffect(() => {
  if (!messages.length) return;

  const timeout = setTimeout(() => {
    saveToDB(id, messages);
  }, 500); // debounce

  return () => clearTimeout(timeout);
}, [messages, id]);

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

     

  async function fetchAnswerFromAPI(question: string): Promise<string> {
  try {
    controllerRef.current = new AbortController();
    const res = await fetch("/api/proxy-ask", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    clientId: "client-d",
    question,
    topK: 1,
  }),
  signal: controllerRef.current.signal, 
});

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    return data?.answer ?? "Sorry, I couldn’t find an answer.";
  } catch (error:any) {
    if (error.name === "AbortError") {
      return "⏸️ Response stopped by user.";
    }
    console.error("API fetch error:", error);
    return "⚠️ Failed to fetch response from server.";
  }
}
  
 const sendMessage = async (
  message?: {
    role?: "user" | "assistant" | "system";
    parts?: ChatMessage["parts"];
    text?: string;
  }
) => {
  if (!message) return;

const textParts =
  message.parts?.filter((p) => p.type === "text") || [];


const text = textParts.map((p: any) => p.text).join(" ");
const fileParts =
  message.parts?.filter((p) => p.type === "file") || [];

 let finalText = text;


    
const lower = finalText.toLowerCase();

   setMessages((prev) => [
  ...prev,
  {
    id: crypto.randomUUID(),
    role: "user",
    parts: [
      // keep file/audio parts FIRST
      ...(fileParts.length > 0
        ? fileParts.map((file) => ({
            type: "file" as const,
            url: file.url,
           name: (file as any).name,
            mediaType: file.mediaType,
            publicId: (file as any).publicId 
          }))
        : []),

      // then text (ONLY if exists)
      ...(finalText
        ? [{ type: "text" as const, text: finalText }]
        : []),
    ],
  },
]);
       setStatus("submitted"); 
    setIsLoading(true);
      try {

 if (lower.includes("show products")) {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        { type: "text", text: "Here is a product you might like 👇" },
        {
          type: "data-listing",
          data: {}
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
              description: item.description ?? "",
              link:item.link
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
const answer = await fetchAnswerFromAPI(finalText);

 setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: answer }],
      },
    ]);
  } catch (error) {
    console.error("Send message error:", error);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [
          { type: "text", text: "⚠️ Something went wrong. Try again." },
        ],
      },
    ]);
  } finally {
    // ✅ ALWAYS stop loading
    setIsLoading(false);
     setStatus("ready");
  }
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
