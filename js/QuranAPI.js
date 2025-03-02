async function fetchReciters() {
    const loadingNotification = document.getElementById('loading-notification');
    loadingNotification.style.display = 'flex';
    
    try {
        const response = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        window.isSecondAPI = false;
        document.getElementById('reciterPlace').style.display = 'block';
        return data.reciters;
    } catch (error) {
        console.error('Error fetching reciters:', error);
        alert('حدث خطأ أثناء تحميل البيانات.\n سيتم استخدام مزود خدمه اخر.');
        return fetchRecitersSecondAPI();
    } finally {
        loadingNotification.style.display = 'none';
    }
}
async function fetchRecitersSecondAPI() {
    const loadingNotification = document.getElementById('loading-notification');
    loadingNotification.style.display = 'flex';
    document.getElementById('reciterPlace').style.display = 'none';
    window.isSecondAPI = true;
    
    try {
        const response = await fetch("http://api.alquran.cloud/v1/edition?format=audio");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const editions = data.data;
        
        const reciterSelect = document.getElementById('reciter');
        reciterSelect.innerHTML = '<option value="">-- اختر القارئ --</option>';
        editions.forEach(edition => {
            const option = document.createElement('option');
            option.value = edition.identifier;
            option.textContent = edition.name;
            reciterSelect.appendChild(option);
        });
        
        return editions;
    } catch (error) {
        console.error('Error fetching reciters:', error);
        alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
        loadingNotification.style.display = 'none';
    }
}