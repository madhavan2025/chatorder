"use client";

import { useState,useEffect } from "react";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";
import { ChatStatus } from "ai";
import CartComponent from "./Cart";
import { ListingsCarousel } from "@/components/listings-carousel";
import { ContentListing } from "../components/ContentListing";
import { MiniForm } from "./MiniForm";
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
import CheckoutComponent from "./Checkout";
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
  isExpanded = false,

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
  const [showListings, setShowListings] = useState(false);
  const [showContentList, setShowContentList] = useState(false);
  const [showForm, setShowForm] = useState(false);
     const [showCart, setShowCart] = useState(false);
const [showCheckout, setShowCheckout] = useState(false);
      const [formConfig, setFormConfig] = useState<any>(null);
      const [contents, setContents] = useState<any[]>([]);
   
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
   const status: ChatStatus = "ready"; 
   const addToolApprovalResponse = async () => {};
  const regenerate = async () => {};
const stop = async () => {};
const votes: { chatId: string; messageId: string; isUpvoted: boolean }[] = [];
const selectedVisibilityType = initialVisibilityType; // UI stub

const [listingType, setListingType] = useState<"type1" | "type2" | null>(null);

  /* ---------------- NO-OP UI HANDLERS ---------------- */

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
  setListingType("type1");
  setShowListings(true);
  setShowContentList(false);
  setShowForm(false);
  addAssistantMessage("Here is a product you might like 👇");
  return;
}

if (lower.includes("show products type2")) {
  setListingType("type2");
  setShowListings(true);
  setShowContentList(false);
  setShowForm(false);
  addAssistantMessage("Here are some products you might like 👇");
  return;
}

if (lower.includes("show contents")) {
  setShowListings(false);
  setShowContentList(true);
  setShowForm(false);
  addAssistantMessage("Here are some contents 👇");
  return;
}
  
   if (
  lower.includes("show") &&
  (lower.includes("form") || lower.includes("forms"))
) {
  setShowListings(false);
  setShowContentList(false);
  setShowForm(true);

  addAssistantMessage("Here is the form 👇");
  return;
}


    if (lower.includes("recommend")) setShowContentList(true);

  if (lower.includes("hide") || lower.includes("close")) {
    setShowListings(false);
    addAssistantMessage("I’ve hidden the listings. What would you like to do next?");
    return;
  }

  addAssistantMessage("Hi 😊 What can I help you with today?");
};


function getMessageText(message?: ChatMessage): string {
  if (!message) return "";

  // Runtime check for ai-sdk injected content
  if (
    typeof (message as unknown as { content?: unknown }).content === "string"
  ) {
    return (message as unknown as { content: string }).content;
  }

  // Fallback to typed parts
  return (
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? ""
  );
}

const lastUserMessage = [...messages]
  .reverse()
  .find((m) => m.role === "user");

const lastUserText = getMessageText(lastUserMessage).toLowerCase();


useEffect(() => {
  if (!lastUserText) return;

  if (
    lastUserText.includes("show") &&
    (lastUserText.includes("product") ||
      lastUserText.includes("products") ||
      lastUserText.includes("listing"))
  ) {
    setShowListings(true);
  }
  if (lastUserText.includes("show") && (lastUserText.includes("form") || lastUserText.includes("forms"))) {
    setShowForm(true);
  }

  if (
    lastUserText.includes("hide") ||
    lastUserText.includes("close")
  ) {
    setShowListings(false);
    setShowForm(false);
     setShowContentList(false);
  }
}, [lastUserText]);


  return (
    <>
<div
  className="relative flex h-full min-h-0 flex-col items-center"
> 
<div className="flex-1 items-center w-full overflow-y-auto min-h-0 ">
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
    regenerate={regenerate}
   
  />


{showListings && listingType && !showCart && !showCheckout && (
  
   <ListingsCarousel
      style={listingType}
       isExpanded={isExpanded}
      onViewCart={() => {
        setShowListings(false);
        setShowCart(true);
      }}
    />
   
)}

{showCart && (
  
    <CartComponent
      goBack={() => {
        setShowCart(false);
        setShowListings(true);
      }}
      goCheckout={() => {
        setShowCart(false);
        setShowCheckout(true);
      }}
    />
  
)}

{showCheckout && (
  
    <CheckoutComponent
      goBack={() => {
        setShowCheckout(false);
        setShowCart(true);
      }}
      goHome={() => {
        setShowCheckout(false);
        setShowCart(false);
        setShowListings(true);
        
      }}
    />
  
)}

{showContentList && (
   
  <ContentListing
    items={contents}
    count={contents.length}
  />
  
)}


            {showForm && formConfig &&( 
            
            <MiniForm config={formConfig} />
            )}
     </div>
</div>
    

  {/* Sticky input */}
  {!isReadonly && (
    <div className="sticky bottom-0 bg-inherit mx-auto w-full max-w-4xl  px-2 pb-4 "
    >
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
