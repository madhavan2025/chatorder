(function () {
  function loadChatbot() {
    if (!document.body) {
      setTimeout(loadChatbot, 50);
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.src = "https://sykasysbot.vercel.app/";
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "380px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";

    document.body.appendChild(iframe);
  }

  loadChatbot();
})();