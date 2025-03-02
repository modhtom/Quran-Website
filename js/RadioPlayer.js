document.getElementById("play-btn").addEventListener("click", () => {
    const selectedRadio = document.getElementById("radio-list").value;
    const audioPlayer = document.getElementById("audio-player");

    if (selectedRadio) {
        audioPlayer.src = selectedRadio;
        audioPlayer.play();
    }
});
