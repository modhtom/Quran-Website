document.addEventListener("DOMContentLoaded", async () => {
    const radioList = document.createElement("select");
    radioList.className = "custom-select";
    radioList.id = "radio-list";
    document.querySelector(".container").insertBefore(radioList, document.getElementById("play-btn"));

    const loadingNotification = document.getElementById("loading-notification");
    loadingNotification.style.display = "flex";

    const excludedIds =[108, 109, 110, 113, 114, 116, 123, 9,33,39,40,58,63,65,66,69,74,76,79,91,102,217,261,265];
    const excludedNamePrefixes = [
        "ترجمة معاني القرآن باللغة",
        "المختصر في تفسير القرآن الكريم",
        "تدبر معاني القرآن باللغة الفارسية",
        "ترجمة معاني القرآن الكريم باللغة الأوردية"
    ];

    try {
        const response = await fetch("https://mp3quran.net/api/v3/radios");
        const data = await response.json();
        if (data.radios && data.radios.length > 0) {
            data.radios
                .filter(radio => {
                    const radioId = parseInt(radio.id);
                    if ((radioId >= 1 && radioId <= 307) && !excludedIds.includes(radioId)) {
                        return false;
                    }
                    if (radio.name) {
                        return !excludedNamePrefixes.some(prefix => radio.name.startsWith(prefix));
                    }
                    return true;
                })
                .forEach(radio => {
                    const option = document.createElement("option");
                    option.value = radio.url;
                    option.textContent = radio.name;
                    radioList.appendChild(option);
                });

            if (radioList.options.length > 0) {
                document.getElementById("play-btn").disabled = false;
            }
        }
    } catch (error) {
        console.error("Error fetching radio data:", error);
    } finally {
        loadingNotification.style.display = "none";
    }
});
