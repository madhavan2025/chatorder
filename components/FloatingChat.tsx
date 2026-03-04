"use client";

import React, { useState,useEffect } from "react";
import { Chat } from "./chat";
import { Maximize2, Minimize2, Sun, Moon } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";
import { isEmbedMode } from "@/lib/isEmbed";
import Image from "next/image";

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
  const [theme, setTheme] = useState<any>(null);
const [loadingTheme, setLoadingTheme] = useState(true);
const [isFullScreen, setIsFullScreen] = useState(false);
const [isDarkMode, setIsDarkMode] = useState(false);
   useEffect(() => {
    setIsEmbed(isEmbedMode());
  }, []);


useEffect(() => {
  const loadTheme = async () => {
    try {
      const themeName = isDarkMode ? "darkTheme" : "default";

      const res = await fetch(`/api/chat-theme?theme=${themeName}`);
      const data = await res.json();

      setTheme(data);
    } catch (err) {
      console.error("Theme load failed", err);
    } finally {
      setLoadingTheme(false);
    }
  };

  loadTheme();
}, [isDarkMode]);


if (loadingTheme) return null;
  // 🚫 DO NOT render floating launcher inside iframe
  if (isEmbed) return null;

  return (
    <div
  className={`fixed bottom-4 right-4 z-[9999] ${
    isDarkMode ? "dark" : ""
  }`}
>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center cursor-pointer"
        >
  {theme?.chatIcon && (
  <Image
    src={theme.chatIcon}
    alt="Chat"
    width={theme.chatIconSize}
    height={theme.chatIconSize}
    unoptimized
    style={{
      backgroundColor: theme.chatIconBg,
      borderRadius: theme.borderRadius,
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
    backgroundColor: theme.windowBg,
    border: theme.borderColor,
    boxShadow: theme.shadow,
  }}
>
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-100"
        style={{
          backgroundColor: theme?.headerBg,
          color: isDarkMode ? theme?.headerTextColor : "#ffffff",
        }}
      >
        <span className="font-semibold">Sykalab-AI-ShopAgent</span>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
<button
  onClick={() => setIsDarkMode(!isDarkMode)}
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