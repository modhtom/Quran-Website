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
        document.getElementById('moshafPlace').style.display = 'block';
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
    try {
        loadingNotification.style.display = 'flex';
        document.getElementById('moshafPlace').style.display = 'none';
        window.isSecondAPI = true;
        populateReciters()
    } catch (error) {
        console.error('Error fetching reciters:', error);
        alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
        loadingNotification.style.display = 'none';
    }
}