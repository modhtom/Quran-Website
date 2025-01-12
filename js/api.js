async function fetchReciters() {
    const loadingNotification = document.getElementById('loading-notification');
    loadingNotification.style.display = 'flex';
    
    try {
        const response = await fetch("https://www.mp3quran.net/api/v3/reciters?language=ar");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.reciters;
    } catch (error) {
        console.error('Error fetching reciters:', error);
        alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
        loadingNotification.style.display = 'none';
    }
}