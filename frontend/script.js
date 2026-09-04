const button = document.getElementById("startButton");
const status = document.getElementById("status");
const conversation = document.getElementById("conversation");
const sessionId = crypto.randomUUID();
let currentAudio= null;

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.textContent = "Voice recognition is not supported in this browser.";
} else {
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    button.addEventListener("click", () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    status.textContent = "🎙️ Listening... Speak now!";
    recognition.start();
});

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        // Display user message
        const userMessage = document.createElement("div");
        userMessage.className = "message user-message";
        userMessage.textContent = `You: ${transcript}`;
        conversation.appendChild(userMessage);
        conversation.scrollTop=conversation.scrollHeight;

        status.textContent = `You said: "${transcript}"`;

        fetch("http://127.0.0.1:8000/voice", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
    text: transcript,
    session_id: sessionId
})
})
.then(response => {
    if (!response.ok) {
        throw new Error("Backend error");
    }

    return response.blob();
})
.then(audioBlob => {
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudio = new Audio(audioUrl);

currentAudio.play();

status.textContent = "🔊 VoiceFlow is speaking...";
})
.catch(error => {
    console.error(error);
    status.textContent = "Could not connect to the backend.";
});
    };
    recognition.onspeechstart = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
        status.textContent = "🛑 VoiceFlow interrupted. Listening...";
    }
};
    recognition.onerror = (event) => {
        status.textContent = `Voice error: ${event.error}`;
    };

    recognition.onend = () => {
        console.log("Voice recognition ended.");
    };
}