(function () {
  let isOpen = false;
  let isExpanded = false;

    const iframe = document.createElement("iframe");

  iframe.setAttribute(
    "allow",
    "clipboard-write; microphone; camera; fullscreen"
  );  
  
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "380px",
    height: "600px",
    maxWidth: "92vw",
    maxHeight: "80vh",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
    display: "none",
    zIndex: "9999",
    background: "#fff",
    transition: "all .25s ease",
    pointerEvents: "auto"
  });

    document.body.appendChild(iframe);

  // CHAT BUTTON
  const button = document.createElement("button");
  button.innerHTML = `
    <img
      src="https://chatbot-woad-six.vercel.app/images/chat.png"
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
    outline: "none",
    boxShadow: "none"
   
  });

  document.body.appendChild(button);

  button.onfocus = () => {
  button.style.outline = "none";
  button.style.boxShadow = "none";
};


  function applyWidgetSize() {

  iframe.style.transform = "none";

  iframe.style.width = "380px";
  iframe.style.height = "600px";
  iframe.style.bottom = "90px";
  iframe.style.right = "20px";
  iframe.style.borderRadius = "12px";

}

 function applyFullScreen() {

  const w = window.innerWidth;

  // MOBILE
  if (w <= 640) {
    iframe.style.width = "100vw";
iframe.style.height = "100vh";
iframe.style.bottom = "0";
iframe.style.right = "0";
iframe.style.left = "0";
iframe.style.top = "0";
  }

  // DESKTOP / TABLET
  else {
    iframe.style.width = "min(1200px,95vw)";
    iframe.style.height = "97vh";
    iframe.style.bottom = "50%";
    iframe.style.right = "50%";
    iframe.style.transform = "translate(50%,50%)";
    iframe.style.borderRadius = "12px";
  }

}

  const openChat = () => {
    if (!iframe.src) {
      iframe.src = "https://chatbot-woad-six.vercel.app/?embed=true";
    }

    iframe.style.display = "block";
    isOpen = true;

    // MOBILE DEFAULT FULLSCREEN
   const w = window.innerWidth;

if (w <= 640) {
  isExpanded = true;
  applyFullScreen();
} else {
  if (isExpanded) {
    applyFullScreen();
  } else {
    applyWidgetSize();
  }
}
  };

  const closeChat = () => {
  iframe.style.display = "none";
  button.style.display = "block";
  isOpen = false;
  isExpanded = false;
};
  // MESSAGE LISTENER
  window.addEventListener("message", (event) => {

    if (event.data === "closeChat") {
      closeChat();
    }

    if (event.data?.type === "toggleExpand") {
  isExpanded = event.data.value;

  if (isExpanded) {
    applyFullScreen();
    button.style.display = "none";   // hide icon
  } else {
    applyWidgetSize();
    button.style.display = "block";  // show icon
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

  // RESPONSIVE
 window.addEventListener("resize", () => {

  if (!isOpen) return;

  if (isExpanded) {
    applyFullScreen();
  } else {
    applyWidgetSize();
  }

});

})();