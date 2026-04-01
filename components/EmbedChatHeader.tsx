"use client";
import { X, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect } from "react";

export function EmbedChatHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatTheme, setChatTheme] = useState<any>(null);
  const [loadingTheme, setLoadingTheme] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

 useEffect(() => {
    const loadTheme = async () => {
      const userId = "150001";
      try {
        const themeName = isDarkMode ? "darkTheme" : "default";

        const res = await fetch(
          `/api/chat-theme?theme=${themeName}&userId=${userId}`
        );
        const data = await res.json();
        setChatTheme(data);
      } catch (err) {
        console.error("Theme load failed", err);
      } finally {
        setLoadingTheme(false);
      }
    };

    loadTheme();
  }, [isDarkMode]);

  const closeChat = () => {
    window.parent.postMessage("closeChat", "*");
  };

  const toggleFullScreen = () => {
    const next = !isFullScreen;
    setIsFullScreen(next);

    window.parent.postMessage(
      { type: "toggleExpand", value: next },
      "*"
    );
  };

  return (
    <div className="h-14 bg-[#1d4ed8] dark:bg-[#111827] text-white flex items-center justify-between px-4 shrink-0">
       <span className="font-semibold">
        {loadingTheme ? "Loading..." : chatTheme?.agentName || "Assistant"}
      </span>

      <div className="flex items-center gap-3">
        <button 
         className="cursor-pointer"
        onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
         className="cursor-pointer"
        onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <button 
         className="cursor-pointer"
        onClick={closeChat}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}