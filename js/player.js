let reciters = [];
let editions = [];

const reciterSelect = document.getElementById('reciter');
const moshafSelect = document.getElementById('moshaf');
const surahSelect = document.getElementById('surah');
const playButton = document.getElementById('play-btn');
const audioPlayer = document.getElementById('audio-player');
const downloadButton = document.getElementById('download-btn');
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.id = 'reciter-search';
searchInput.placeholder = 'ابحث عن القارئ مع مراعاة حساسية الأحرف، تأكد من كتابة الاسم بشكل صحيح، مثل الفرق بين "ا" و "أ".';
searchInput.className = 'search-input';
const searchResults = document.createElement('div');
searchResults.id = 'search-results';
searchResults.className = 'search-results';
const searchContainer = document.createElement('div');
searchContainer.className = 'search-container';
searchContainer.appendChild(searchInput);
searchContainer.appendChild(searchResults);

function setupSearchFeature() {
    if (!window.isSecondAPI) {
        const playerCard = document.querySelector('.player-card');
        const selectionGroup = document.querySelector('.selection-group');
        playerCard.insertBefore(searchContainer, selectionGroup);
        
        searchInput.addEventListener('input', handleSearch);
    } else {
        const existingSearchContainer = document.querySelector('.search-container');
        if (existingSearchContainer) {
            existingSearchContainer.remove();
        }
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const matchedReciters = reciters.filter(reciter => 
        reciter.name.toLowerCase().includes(searchTerm)
    );
    
    if (matchedReciters.length === 0) {
        searchResults.innerHTML = '<p class="no-results">لا توجد نتائج</p>';
        searchResults.style.display = 'block';
        return;
    }
    
    matchedReciters.forEach(reciter => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const reciterNameDiv = document.createElement('div');
        reciterNameDiv.className = 'reciter-name';
        reciterNameDiv.textContent = reciter.name;
        resultItem.appendChild(reciterNameDiv);
        
        const moshafOptionsDiv = document.createElement('div');
        moshafOptionsDiv.className = 'moshaf-options';
        
        reciter.moshaf.forEach(moshaf => {
            const moshafOption = document.createElement('div');
            moshafOption.className = 'moshaf-option';
            moshafOption.textContent = moshaf.name;
            moshafOption.addEventListener('click', (event) => {
                event.stopPropagation(); 
                selectReciterWithMoshaf(reciter, moshaf.name);
            });
            moshafOptionsDiv.appendChild(moshafOption);
        });
        
        resultItem.appendChild(moshafOptionsDiv);
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
}

function selectReciterWithMoshaf(reciter, moshafName) {
    searchInput.value = '';
    searchResults.style.display = 'none';
    
    for (let i = 0; i < moshafSelect.options.length; i++) {
        if (moshafSelect.options[i].value === moshafName) {
            moshafSelect.selectedIndex = i;
            break;
        }
    }
    
    moshafSelect.dispatchEvent(new Event('change'));
    
    for (let i = 0; i < reciterSelect.options.length; i++) {
        if (parseInt(reciterSelect.options[i].value) === reciter.id) {
            reciterSelect.selectedIndex = i;
            break;
        }
    }
    reciterSelect.dispatchEvent(new Event('change'));
    updateButtonStates();
}
document.addEventListener('click', (event) => {
    if (!searchContainer.contains(event.target)) {
        searchResults.style.display = 'none';
    }
});
async function initializePlayer() {
    try {
        const data = await fetchReciters();
        reciters = data;
        populateMoshaf();
        populateSurahs();
        populateReciters();
        setupSearchFeature(); 
    } catch (error) {
        console.warn("First API failed, switching to second API");
        const data = await fetchRecitersSecondAPI();
        editions = data;
    }
    populateSurahs();
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
    if (!window.isSecondAPI) {
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
    else{
        console.log("Loading editions....")
        reciterSelect.innerHTML = '<option value="">-- اختر القارئ --</option>';
        editions2.forEach(edition => {
            const option = document.createElement('option');
            option.value = edition.identifier;
            option.textContent = edition.name.match(/\((.*?)\)/)?.[1] || edition.name; 
            reciterSelect.appendChild(option);
        });
        console.log("DONE");
    }
}

function populateSurahs() {
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    if (window.isSecondAPI) {
        if (typeof surahNames !== 'undefined' && Array.isArray(surahNames)) {
            for (let i = 1; i <= 114; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `سورة ${surahNames[i - 1]}`;
                surahSelect.appendChild(option);
            }
        } else {
            console.error("surahNames.js not loaded correctly.");
        }
    } else {
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
}

function playSurah() {
    const reciterId = reciterSelect.value;
    const surahNumber = surahSelect.value;
    
    if (!reciterId || !surahNumber) {
        alert("يرجى اختيار القارئ والسورة");
        return;
    }
    
    if (window.isSecondAPI) {
        const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.code === 200 && data.data.ayahs) {
                    ayahAudioQueue = data.data.ayahs.map(ayah => ayah.audio);
                    currentAyahIndex = 0;
                    playNextAyah();
                } else {
                    console.error("Invalid response", data);
                    alert("تعذر تحميل التلاوة. يرجى المحاولة لاحقًا.");
                }
            })
            .catch(error => {
                console.error("Error fetching surah audio:", error);
                alert("حدث خطأ أثناء تحميل التلاوة.");
            });
    } else {
        const reciterData = reciters.find(r => r.id == reciterId);
        if (!reciterData || !reciterData.moshaf.length) {
            alert("بيانات القارئ غير متوفرة.");
            return;
        }
        const serverUrl = reciterData.moshaf[0].server;
        const formattedSurahNumber = surahNumber.padStart(3, '0');
        const audioUrl = `${serverUrl}${formattedSurahNumber}.mp3`;
        audioPlayer.src = audioUrl;
        audioPlayer.hidden = false;
        audioPlayer.play();
    }
}

function playNextAyah() {
    if (currentAyahIndex < ayahAudioQueue.length) {
        audioPlayer.src = ayahAudioQueue[currentAyahIndex];
        audioPlayer.hidden = false;
        audioPlayer.play();
        audioPlayer.onended = () => {
            currentAyahIndex++;
            playNextAyah();
        };
    }
}


function downloadSurah() {
    let downloadUrl, fileName;
    if (window.isSecondAPI) {
        const editionIdentifier = reciterSelect.value;
        const surahNumber = surahSelect.value;
        downloadUrl = `https://cdn.alquran.cloud/media/surah/${editionIdentifier}/${surahNumber}.mp3`;
        fileName = `Surah_${surahNumber}.mp3`;
    } else {
        const serverUrl = reciters.find(r => r.id === parseInt(reciterSelect.value))
                               .moshaf.find(m => m.name === moshafSelect.value).server;
        const surahNumber = surahSelect.value.padStart(3, '0');
        downloadUrl = `${serverUrl}${surahNumber}.mp3`;
        fileName = `Surah_${surahNumber}.mp3`;
    }

    fetch(downloadUrl)
        .then(response => response.blob())
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

function updateButtonStates() {
    const isReady = window.isSecondAPI 
        ? reciterSelect.value && surahSelect.value 
        : reciterSelect.value && moshafSelect.value && surahSelect.value;
    playButton.disabled = !isReady;
    downloadButton.disabled = !isReady;
}

moshafSelect.addEventListener('change', () => {
    populateReciters();
    populateSurahs();
    updateButtonStates();
});

reciterSelect.addEventListener('change', populateSurahs);
playButton.addEventListener('click', playSurah);
downloadButton.addEventListener('click', downloadSurah);

[reciterSelect, moshafSelect, surahSelect].forEach(select => {
    select.addEventListener('change', updateButtonStates);
});

initializePlayer();