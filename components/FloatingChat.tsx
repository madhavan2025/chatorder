"use client";

import React, { useState,useEffect } from "react";
import { Chat } from "./chat";
import { Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";
import { isEmbedMode } from "@/lib/isEmbed";
import Image from "next/image";
import { useTheme } from "next-themes";

interface FloatingChatProps {
  chatId: string;
  initialMessages?: ChatMessage[];
  initialChatModel?: string;
  initialVisibilityType?: VisibilityType;
  isReadonly?: boolean;
  autoResume?: boolean;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  chatId,
  initialMessages = [],
  initialVisibilityType = "public",
  isReadonly = false,
  autoResume = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
   const [isEmbed, setIsEmbed] = useState(false);
const [loadingTheme, setLoadingTheme] = useState(true);
const [isFullScreen, setIsFullScreen] = useState(false);
const { setTheme, resolvedTheme } = useTheme();
const [chatTheme, setChatTheme] = useState<any>(null);
const isDarkMode = resolvedTheme === "dark";
   useEffect(() => {
    setIsEmbed(isEmbedMode());
  }, []);


useEffect(() => {
  if (!resolvedTheme) return;

  const loadTheme = async () => {
    const userId = "150001";
    try {
      const themeName = resolvedTheme === "dark" ? "darkTheme" : "default";
      const res = await fetch(`/api/chat-theme?theme=${themeName}&userId=${userId}`);
      const data = await res.json();
      setChatTheme(data);
    } catch (err) {
      console.error("Theme load failed", err);
    } finally {
      setLoadingTheme(false);
    }
  };

  loadTheme();
}, [resolvedTheme]);


if (loadingTheme) return null;
  // 🚫 DO NOT render floating launcher inside iframe
if (isEmbed) return null;

  return (
    <div
  className="fixed bottom-4 right-4 z-[9999]"
>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center cursor-pointer"
        >
  {chatTheme?.agentIcon && (
  <Image
      src={chatTheme.agentIcon}
    alt="sykalabagentbot"
    width={56}
    height={56}
    unoptimized
    style={{
      borderRadius: chatTheme.borderRadius,
      objectFit: "contain",
      
    }}
  />
)}
        </button>
      )}

      {/* Floating Chat */}
      {isOpen && (
  <div
    className={`fixed z-[9999]  transition-all duration-300 ease-in-out
      ${
        isFullScreen
          ? "inset-0 flex items-center justify-center bg-black/40 sm:p-4"
          : "bottom-4 right-4"
      }
    `}
  >
  <div
  className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out
    ${
      isFullScreen
        ? `
          w-full h-screen rounded-none
          sm:h-[97vh] sm:max-w-6xl sm:rounded-xl
        `
        : "w-[92vw] h-[70vh] sm:w-[420px] sm:h-[580px] rounded-xl"
    }
  `}
  style={{
    backgroundColor: chatTheme.windowBg,
    border: `${chatTheme.borderColor}`,
    boxShadow: chatTheme.shadow,
  }}
>
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-100"
        style={{
          backgroundColor: chatTheme?.headerBg,
        }}
      >
        <span className="font-semibold text-white">
  {chatTheme?.agentName}
</span>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
<button
  onClick={() => setTheme(isDarkMode ? "light" : "dark")}
  className={`hover:opacity-80 cursor-pointer flex items-center justify-center ${
    !isDarkMode ? "text-white" : ""
  }`}
>
  {isDarkMode ? (
    <Sun size={18} />
  ) : (
    <Moon size={18} />
  )}
</button>
          {/* Expand / Minimize */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
           className={`hover:opacity-80 cursor-pointer ${
  !isDarkMode ? "text-white" : ""
}`}
          >
            {isFullScreen ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
          </button>

          {/* Close */}
          <button
            className={`hover:opacity-80 cursor-pointer ${
  !isDarkMode ? "text-white" : ""
}`}
            onClick={() => {
              setIsOpen(false);
              setIsFullScreen(false);
              
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-hidden">
        <Chat
          id={chatId}
          initialMessages={initialMessages}
          initialVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          autoResume={autoResume}
          isExpanded={isFullScreen}
        />
        
      </div>
    </div>
  </div>
)}
    </div>
  );
};