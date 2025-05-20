const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let currentChat = [];
let chatHistory = JSON.parse(localStorage.getItem("edwinChats")) || [];
let selectedChatId = null;
let isWaiting = false;

// Mensaje inicial
window.onload = () => {
  setTimeout(() => {
    addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
  }, 1000);
  loadChatList();
};

// Agregar mensaje
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  currentChat.push({ sender, text });
}

// Habilitar/deshabilitar input
function setInputEnabled(enabled) {
  chatInput.disabled = !enabled;
  chatInput.style.backgroundColor = enabled ? "white" : "#eee";
  chatInput.placeholder = enabled ? "Escribí tu mensaje..." : "Edwin AI está escribiendo...";
}

// Enviar mensaje
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || isWaiting) return;

  addMessage(text, "user");
  chatInput.value = "";
  setInputEnabled(false);
  isWaiting = true;

  // Indicador de "escribiendo..."
  const typingMessage = document.createElement("div");
  typingMessage.classList.add("message", "bot");
  typingMessage.innerText = "Edwin AI está escribiendo...";
  chatContainer.appendChild(typingMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch("https://manuachinelli.app.n8n.cloud/webhook/aa0c7c03-a737-43b0-8656-b03c0ad9c32b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        chatId: selectedChatId || "default"  // <-- acá se pasa el chatId
      }),
    });

    const data = await res.json();
    chatContainer.removeChild(typingMessage);
    addMessage(data.reply || "No tengo una respuesta para eso por ahora.", "bot");
  } catch (err) {
    chatContainer.removeChild(typingMessage);
    addMessage("Hubo un error al responder. Intentá de nuevo más tarde.", "bot");
  }

  setInputEnabled(true);
  isWaiting = false;
});

// Nuevo chat
newChatBtn.addEventListener("click", () => {
  if (currentChat.length > 0) {
    const name = currentChat.find(m => m.sender === "user")?.text || "Chat nuevo";
    const chatName = name.length > 25 ? name.slice(0, 25) + "..." : name;
    const chatId = Date.now();
    chatHistory.push({ id: chatId, name: chatName, messages: currentChat });
    localStorage.setItem("edwinChats", JSON.stringify(chatHistory));
    loadChatList();
    selectedChatId = chatId;
  }
  currentChat = [];
  chatContainer.innerHTML = "";
  setTimeout(() => {
    addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
  }, 500);
});

// Cargar lista de chats
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
