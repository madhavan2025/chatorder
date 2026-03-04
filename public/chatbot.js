(function () {
  function loadChatbot() {
    if (!document.body) {
      setTimeout(loadChatbot, 50);
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.src = "https://sykasysbot.vercel.app/";

    // Floating at bottom-right like WhatsApp/FB chat
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "60px"; // small icon size
    iframe.style.height = "60px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "50%"; // circular icon
    iframe.style.zIndex = "999999";
    iframe.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

    document.body.appendChild(iframe);
  }

  loadChatbot();
})();