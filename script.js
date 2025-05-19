const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");

let currentChat = [];
let chatHistory = JSON.parse(localStorage.getItem("edwinChats")) || [];
let selectedChatId = null;

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
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  // Enviar al webhook
  const res = await fetch("https://webhook.site/your-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: text }),
  });

  const data = await res.json();
  addMessage(data.reply || "Lo estoy pensando...", "bot");
});

// Guardar nuevo chat
newChatBtn.addEventListener("click", () => {
  if (currentChat.length > 0) {
    const chatName = "Chat " + new Date().toLocaleString();
    chatHistory.push({ id: Date.now(), name: chatName, messages: currentChat });
    localStorage.setItem("edwinChats", JSON.stringify(chatHistory));
    loadChatList();
    currentChat = [];
    chatContainer.innerHTML = "";
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
