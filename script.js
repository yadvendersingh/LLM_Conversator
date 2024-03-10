const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container")
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const initialHeight = chatInput.scrollHeight;
let userText=null;
const API_KEY = prompt("Please enter your API key:");
const loadDataFromLocalStorage = () =>{
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor==="light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    const defaultText = `<div class="default-text">
                        <h1>LLM Conversator</h1>
                        <p>Start a conversation to explore LLM</p>`
    chatContainer.innerHTML = localStorage.getItem("all-chats")||defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}
loadDataFromLocalStorage();

const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}
const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const pElement = document.createElement("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(
            {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": userText}],
                "temperature": 0.7
              }
            )
        }
        try {
            const response = await(await fetch(API_URL, requestOptions)).json();
            pElement.textContent=response.choices[0].message.content.trim();
        }
        catch(error){
            pElement.classList.add("error");
            pElement.textContent="Error: Unable to Connect; Reload and input correct API KEY";
        }
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}
const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent="done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}
const showTypingAnimation =() => {
    const html=`<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/bot.png" alt="bot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                            <div class="typing-dot" style="--delay: 0.5s"></div>
                         </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;
    document.querySelector(".default-text")?.remove();
    chatInput.value="";
    chatInput.style.height = `${initialHeight}px`;
    const html = `<div class="chat-content">
                        <div class="chat-details">
                            <img src="images/profile.jpeg" alt="profile-img">
                            <p></p>
                        </div>
                    </div>`;
    const outgoingChatDiv = createElement(html, "outgoing");
    //To Handle html tag inputs
    outgoingChatDiv.querySelector("p").textContent=userText;
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation);
}
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});
deleteButton.addEventListener("click", () => {
    if(confirm("Are your sure you want to delete chat history?")){
       localStorage.removeItem("all-chats");
       loadDataFromLocalStorage(); 
    }
});

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth>800){
        e.preventDefault();
        handleOutgoingChat();
    }
})
sendButton.addEventListener("click", handleOutgoingChat);
