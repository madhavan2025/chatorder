(function () {
  function loadChatbot() {
    if (!document.body) {
      setTimeout(loadChatbot, 50);
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.src = "https://sykasysbot.vercel.app/widget"; // IMPORTANT: widget route

    iframe.id = "syka-chatbot";
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "60px";
    iframe.style.height = "60px";
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";

    document.body.appendChild(iframe);

    // Listen for open/close messages from iframe
    window.addEventListener("message", function (event) {
      if (event.data === "CHAT_OPEN") {
        iframe.style.width = "350px";
        iframe.style.height = "500px";
        iframe.style.borderRadius = "10px";
      }

      if (event.data === "CHAT_CLOSE") {
        iframe.style.width = "60px";
        iframe.style.height = "60px";
        iframe.style.borderRadius = "50%";
      }
    });
  }

  loadChatbot();
})();