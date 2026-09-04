const button = document.getElementById("startButton");
const status = document.getElementById("status");
const conversation = document.getElementById("conversation");
const voiceState = document.getElementById("voiceState");

const sessionId =
    (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "session-" + Date.now();

let currentAudio = null;
let isListening = false;

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.textContent =
        "Voice recognition is not supported in this browser.";
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
        voiceState.textContent = "🔴 Listening";
button.textContent = "🔴 Listening...";
isListening = true;

        recognition.start();
    });

    recognition.onspeechstart = () => {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;

        status.textContent =
            "🛑 VoiceFlow interrupted. Listening...";

        voiceState.textContent = "🔴 Listening";
        button.textContent = "🔴 Listening...";
    }
};

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        // Show user's message
        const userMessage =
            document.createElement("div");

        userMessage.className =
            "message user-message";

        userMessage.textContent =
            `You: ${transcript}`;

        conversation.appendChild(userMessage);

        conversation.scrollTop =
            conversation.scrollHeight;

        status.textContent =
            `You said: "${transcript}"`;

        // Send request to backend
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

            return response.json();
        })
        .then(data => {

            // Show VoiceFlow's response
            const botMessage =
                document.createElement("div");

            botMessage.className =
                "message bot-message";

            botMessage.textContent =
                `VoiceFlow: ${data.response}`;

            conversation.appendChild(botMessage);

            conversation.scrollTop =
                conversation.scrollHeight;

            // Convert base64 audio to MP3
            const audioBytes =
                Uint8Array.from(
                    atob(data.audio),
                    c => c.charCodeAt(0)
                );

            const audioBlob =
                new Blob(
                    [audioBytes],
                    { type: "audio/mpeg" }
                );

            const audioUrl =
                URL.createObjectURL(audioBlob);

            currentAudio =
                new Audio(audioUrl);

            currentAudio.play();

            status.textContent =
                "🔊 VoiceFlow is speaking...";
                voiceState.textContent = "🔊 Speaking";
button.textContent = "🔊 Speaking...";
currentAudio.onended = () => {
    voiceState.textContent = "Ready";
    button.textContent = "🎤 Start Voice Assistant";
    status.textContent = "Click the button and start speaking.";
};
        })
        .catch(error => {

            console.error(error);

            status.textContent =
                "Could not connect to VoiceFlow.";
        });
    };

    recognition.onerror = (event) => {

        status.textContent =
            `Voice error: ${event.error}`;
    };

    recognition.onend = () => {
    isListening = false;

    console.log(
        "Voice recognition ended."
    );
};
}