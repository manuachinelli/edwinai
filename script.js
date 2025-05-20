<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Edwin AI</title>
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      background: #f4faff;
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
    }

    #sidebar {
      width: 240px;
      background: #e0f0ff;
      padding: 10px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    #main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #chatContainer {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 10px;
      max-width: 90%;
      padding: 10px;
      border-radius: 10px;
    }

    .user {
      background-color: #d0f0ff;
      align-self: flex-end;
      text-align: right;
    }

    .bot {
      background-color: #ffffff;
      align-self: flex-start;
    }

    #chatForm {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ccc;
      background: white;
    }

    #chatInput {
      flex: 1;
      padding: 10px;
      font-size: 16px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }

    #chatInput:disabled {
      background: #eee;
    }

    button {
      margin-left: 10px;
      padding: 10px 15px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }

      #sidebar {
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: row;
        overflow-x: auto;
      }

      #chatList button {
        flex-shrink: 0;
      }
    }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>Edwin AI</h3>
    <button id="newChatBtn">+ Nuevo Chat</button>
    <div id="chatList"></div>
  </div>

  <div id="main">
    <div id="chatContainer"></div>
    <form id="chatForm">
      <input type="text" id="chatInput" placeholder="Escribí tu mensaje..." autocomplete="off" />
      <button type="submit">Enviar</button>
    </form>
  </div>

  <script>
    const chatContainer = document.getElementById("chatContainer");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatList = document.getElementById("chatList");
    const newChatBtn = document.getElementById("newChatBtn");

    let currentChat = [];
    let chatHistory = JSON.parse(localStorage.getItem("edwinChats")) || [];
    let selectedChatId = null;
    let waiting = false;

    // Mostrar mensaje inicial
    window.onload = () => {
      setTimeout(() => {
        addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
      }, 1000);
      loadChatList();
    };

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.classList.add("message", sender);
      msg.innerText = text;
      chatContainer.appendChild(msg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      currentChat.push({ sender, text });
    }

    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (waiting) return;

      const text = chatInput.value.trim();
      if (!text) return;

      addMessage(text, "user");
      chatInput.value = "";
      chatInput.disabled = true;
      waiting = true;

      const typingMessage = document.createElement("div");
      typingMessage.classList.add("message", "bot");
      typingMessage.innerText = "Edwin AI está escribiendo...";
      chatContainer.appendChild(typingMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        const res = await fetch("https://manuachinelli.app.n8n.cloud/webhook/aa0c7c03-a737-43b0-8656-b03c0ad9c32b", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text })
        });

        const data = await res.json();
        chatContainer.removeChild(typingMessage);
        addMessage(data.reply || "Ups, no tengo una respuesta.", "bot");
      } catch (err) {
        chatContainer.removeChild(typingMessage);
        addMessage("Hubo un error al responder.", "bot");
      }

      chatInput.disabled = false;
      waiting = false;
    });

    newChatBtn.addEventListener("click", () => {
      if (currentChat.length > 0) {
        const chatName = currentChat.find(m => m.sender === "user")?.text?.slice(0, 20) || "Chat sin título";
        chatHistory.push({ id: Date.now(), name: chatName, messages: currentChat });
        localStorage.setItem("edwinChats", JSON.stringify(chatHistory));
        loadChatList();
      }
      currentChat = [];
      chatContainer.innerHTML = "";
      setTimeout(() => {
        addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
      }, 1000);
    });

    function loadChatList() {
      chatList.innerHTML = "";
      chatHistory.forEach((chat) => {
        const btn = document.createElement("button");
        btn.textContent = chat.name;
        btn.onclick = () => {
          selectedChatId = chat.id;
          currentChat = chat.messages;
          chatContainer.innerHTML = "";
          currentChat.forEach((m) => addMessage(m.text, m.sender));
        };
        chatList.appendChild(btn);
      });
    }
  </script>
</body>
</html>
