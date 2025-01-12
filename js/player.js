let reciters = [];

const reciterSelect = document.getElementById('reciter');
const moshafSelect = document.getElementById('moshaf');
const surahSelect = document.getElementById('surah');
const playButton = document.getElementById('play-btn');
const audioPlayer = document.getElementById('audio-player');

async function initializePlayer() {
    reciters = await fetchReciters();
    if (reciters) {
        populateMoshaf();
    }
}

function populateMoshaf() {
    moshafSelect.innerHTML = '<option value="">-- اختر الرواية --</option>';
    const allMoshaf = Array.from(new Set(reciters.flatMap(r => r.moshaf.map(m => m.name))));
    
    allMoshaf.forEach(moshafName => {
        const option = document.createElement('option');
        option.value = moshafName;
        option.textContent = moshafName;
        moshafSelect.appendChild(option);
    });
}

function populateReciters() {
    reciterSelect.innerHTML = '<option value="">-- اختر القارئ --</option>';
    const selectedMoshaf = moshafSelect.value;
    
    const filteredReciters = reciters.filter(reciter => 
        reciter.moshaf.some(m => m.name === selectedMoshaf));

    filteredReciters.forEach(reciter => {
        const option = document.createElement('option');
        option.value = reciter.id;
        option.textContent = reciter.name;
        reciterSelect.appendChild(option);
    });
}

function populateSurahs() {
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    const selectedMoshaf = moshafSelect.value;
    const selectedReciter = reciterSelect.value;

    const reciterData = reciters.find(r => r.id === parseInt(selectedReciter));
    const selectedMoshafData = reciterData?.moshaf.find(m => m.name === selectedMoshaf);

    if (selectedMoshafData) {
        const surahList = selectedMoshafData.surah_list.split(',');
        surahList.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah;
            option.textContent = `سورة ${surahNames[parseInt(surah) - 1]}`;  
            surahSelect.appendChild(option);
        });
    }
}

function playSurah() {
    const serverUrl = reciters.find(r => r.id === parseInt(reciterSelect.value))
                           .moshaf.find(m => m.name === moshafSelect.value).server;
    const surahNumber = surahSelect.value;

    if (serverUrl && surahNumber) {
        audioPlayer.src = `${serverUrl}${surahNumber.padStart(3, '0')}.mp3`;
        audioPlayer.hidden = false;
        audioPlayer.play();
    }
}

moshafSelect.addEventListener('change', () => {
    populateReciters();
    populateSurahs();
    playButton.disabled = true;
});

reciterSelect.addEventListener('change', populateSurahs);
playButton.addEventListener('click', playSurah);

[reciterSelect, moshafSelect, surahSelect].forEach(select => {
    select.addEventListener('change', () => {
        playButton.disabled = !(reciterSelect.value && moshafSelect.value && surahSelect.value);
    });
});

const downloadButton = document.getElementById('download-btn');
function downloadSurah() {
    const serverUrl = reciters.find(r => r.id === parseInt(reciterSelect.value))
                           .moshaf.find(m => m.name === moshafSelect.value).server;
    const surahNumber = surahSelect.value;

    if (serverUrl && surahNumber) {
        const downloadUrl = `${serverUrl}${surahNumber.padStart(3, '0')}.mp3`;
        const fileName = `Surah_${surahNumber}.mp3`;

        fetch(downloadUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(error => {
                console.error('Error downloading Surah:', error);
                alert('حدث خطأ أثناء تنزيل السورة. يرجى المحاولة مرة أخرى.');
            });
    }
}

// Enable or disable the download button based on selection
[reciterSelect, moshafSelect, surahSelect].forEach(select => {
    select.addEventListener('change', () => {
        const isReady = reciterSelect.value && moshafSelect.value && surahSelect.value;
        downloadButton.disabled = !isReady;
    });
});

// Event listener for the download button
downloadButton.addEventListener('click', downloadSurah);

// Initialize the player
initializePlayer();