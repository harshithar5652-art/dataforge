const button = document.getElementById("startButton");
const status = document.getElementById("status");

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
        status.textContent = "🎙️ Listening... Speak now!";
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        status.textContent = `You said: "${transcript}"`;

        fetch("http://127.0.0.1:8000/voice", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        text: transcript
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
    const audio = new Audio(audioUrl);

    audio.play();

    status.textContent = "🔊 VoiceFlow is speaking...";
})
.catch(error => {
    console.error(error);
    status.textContent = "Could not connect to the backend.";
});
    };

    recognition.onerror = (event) => {
        status.textContent = `Voice error: ${event.error}`;
    };

    recognition.onend = () => {
        console.log("Voice recognition ended.");
    };
}