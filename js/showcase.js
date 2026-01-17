// js/showcase.js - Təqdimat və Animasiya Məntiqi

const Showcase = (() => {
    
    const init = () => {
        // iOS Saatını canlı et
        setInterval(updateTime, 1000);
        updateTime();
    };

    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
        
        // Status bar və Widget saatlarını yenilə
        document.querySelectorAll('.js-time').forEach(el => el.textContent = timeString);
        
        // Tarixi yenilə (Məs: 29 Dek, Bazar)
        const dateOptions = { month: 'short', day: 'numeric', weekday: 'long' };
        const dateString = now.toLocaleDateString('az-AZ', dateOptions).toUpperCase();
        const dateEl = document.getElementById('js-date');
        if(dateEl) dateEl.textContent = dateString;
    };

    const openApp = () => {
        // 1. iOS Ana Ekranını gizlət
        const iosHome = document.getElementById('ios-home-screen');
        if(iosHome) iosHome.classList.add('hidden');

        // 2. SmartYol Tətbiqini aç (Scale animasiyası ilə)
        const appContainer = document.getElementById('smartyol-app-container');
        if(appContainer) appContainer.classList.add('active');

        // 3. Leaflet xəritəsinin ölçüsünü düzəlt (Render problemi olmasın)
        setTimeout(() => {
            if (window.SmartYol && SmartYol.init) {
                // Əgər hələ başladılmayıbsa başlat, yoxsa sadəcə xəritəni yenilə
                // (app.js daxilindəki mapInstance-a çatmaq üçün sadə bir yol)
                const mapEl = document.getElementById('main-map');
                if(mapEl) mapEl.style.opacity = '1'; 
            }
        }, 300);
    };

    const closeApp = () => {
        // Tətbiqi bağla
        document.getElementById('smartyol-app-container').classList.remove('active');
        
        // iOS ekranını geri gətir
        document.getElementById('ios-home-screen').classList.remove('hidden');
    };

    return { init, openApp, closeApp };
})();

// Səhifə yüklənəndə başlat
document.addEventListener('DOMContentLoaded', Showcase.init);