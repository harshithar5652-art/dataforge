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

        fetch("http://127.0.0.1:8000/voice?text=" + encodeURIComponent(transcript), {
    method: "POST"
})
.then(response => response.json())
.then(data => {
    status.textContent = `VoiceFlow: ${data.response}`;
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