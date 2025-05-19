const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let currentChat = [];
let chatHistory = JSON.parse(localStorage.getItem("edwinChats")) || [];
let selectedChatId = null;
let pendingReply = false;

// Mostrar mensaje inicial con delay
window.onload = () => {
  setTimeout(() => {
    addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
  }, 3000);
  loadChatList();
};

// Agrega mensaje al chat
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  currentChat.push({ sender, text });
}

// Enviar pregunta
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (pendingReply) return;

  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";
  chatInput.disabled = true;
  pendingReply = true;

  // Mostrar "Edwin está escribiendo..."
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("message", "bot");
  typingMsg.innerText = "Edwin está escribiendo...";
  typingMsg.id = "typing-msg";
  chatContainer.appendChild(typingMsg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Enviar al webhook
  const res = await fetch("https://webhook.site/your-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: text }),
  });

  const data = await res.json();

  // Eliminar mensaje "Edwin está escribiendo..."
  document.getElementById("typing-msg")?.remove();

  addMessage(data.reply || "Lo estoy pensando...", "bot");
  chatInput.disabled = false;
  chatInput.focus();
  pendingReply = false;

  // Si es el primer mensaje, cambiar nombre del chat
  if (currentChat.length === 2) {
    const chatName = text.slice(0, 25) + (text.length > 25 ? "..." : "");
    if (selectedChatId !== null) {
      const index = chatHistory.findIndex(chat => chat.id === selectedChatId);
      if (index !== -1) {
        chatHistory[index].name = chatName;
        localStorage.setItem("edwinChats", JSON.stringify(chatHistory));
        loadChatList();
      }
    }
  }
});

// Guardar nuevo chat
newChatBtn.addEventListener("click", () => {
  if (currentChat.length > 0) {
    const defaultName = "Chat " + new Date().toLocaleString();
    chatHistory.push({ id: Date.now(), name: defaultName, messages: currentChat });
    localStorage.setItem("edwinChats", JSON.stringify(chatHistory));
    loadChatList();
    currentChat = [];
    chatContainer.innerHTML = "";
    selectedChatId = chatHistory[chatHistory.length - 1].id;
    setTimeout(() => {
      addMessage("Hola, soy Edwin AI. ¿En qué puedo ayudarte?", "bot");
    }, 1000);
  }
});

// Cargar chats guardados
function loadChatList() {
  chatList.innerHTML = "";
  chatHistory.forEach((chat) => {
    const btn = document.createElement("button");
    btn.textContent = chat.name || "Chat";
    btn.onclick = () => {
      selectedChatId = chat.id;
      currentChat = chat.messages;
      chatContainer.innerHTML = "";
      currentChat.forEach((m) => addMessage(m.text, m.sender));
    };
    chatList.appendChild(btn);
  });
}

