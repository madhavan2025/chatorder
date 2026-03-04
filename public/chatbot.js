
(function () {
  let isOpen = false;

  // Button
  const button = document.createElement("button");
button.innerHTML = `
    <img
      src="https://chatbot-woad-six.vercel.app/images/chat.png"
      alt="Chat"
      style="width:60px;height:60px;object-fit:contain;"
    />
  `;
  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "transparent",
    border: "none",
     padding: "0",
    cursor: "pointer",
    zIndex: "9999",
    boxShadow: "0 5px 15px rgba(0,0,0,.2)"
  });
  document.body.appendChild(button);

  // Iframe (lazy src)
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "380px",
    height: "600px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
    display: "none",
    zIndex: "9999",
    background: "#fff"
  });
  iframe.allow = "clipboard-write; microphone";
  document.body.appendChild(iframe);

  const openChat = () => {
    if (!iframe.src) {
      iframe.src = "https://chatbot-woad-six.vercel.app/?embed=true";
    }
    iframe.style.display = "block";
    isOpen = true;
  };

  const closeChat = () => {
    iframe.style.display = "none";
    isOpen = false;
  };

 window.addEventListener("message", (event) => {
  if (event.data === "closeChat") {
    closeChat();
  }

  if (event.data?.type === "toggleExpand") {
    if (event.data.value) {
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.style.bottom = "0";
      iframe.style.right = "0";
      iframe.style.borderRadius = "0";
    } else {
      iframe.style.width = "380px";
      iframe.style.height = "600px";
      iframe.style.bottom = "90px";
      iframe.style.right = "20px";
      iframe.style.borderRadius = "12px";
    }
  }
});

  button.onclick = () => {
    isOpen ? closeChat() : openChat();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeChat();
    }
  });

  const resizeIframe = () => {
    if (window.innerWidth < 400) {
      iframe.style.width = "90vw";
      iframe.style.height = "70vh";
    } else {
      iframe.style.height = "600px";
    }
  };
  window.addEventListener("resize", resizeIframe);
  resizeIframe();
})();
