"use client";
import { X, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect } from "react";

export function EmbedChatHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
      <span className="font-semibold">Sykalab-AI-ShopAgent</span>

      <div className="flex items-center gap-3">
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <button onClick={closeChat}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}