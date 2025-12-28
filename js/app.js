const SmartYol = (() => {

    // #region 1. KONFİQURASİYA
    const CONFIG = {
        APP_NAME: "SmartYol",
        MAP_CENTER: [40.377, 49.892], // Bakı Mərkəz
        MAP_ZOOM: 14,
        ORDER_SIMULATION_TIME: 3000   // Sürücü axtarış müddəti (ms)
    };

    const MOCK_DB = {
        DRIVERS: ["Elçin Quliyev", "Rəşad Əliyev", "Kamran Həsənov", "Orxan Məmmədov", "Samir Vəliyev"],
        PLATES: ["99-LZ-123", "10-MK-888", "77-XV-404", "90-OJ-007", "99-XX-555"]
    };
    // #endregion

    // #region 2. STATE
    const state = {
        currentFilter: 'economy',
        destination: 'Aeroport',
        providers: [...PROVIDERS],
        calculatedResults: [],
        sortAscending: true
    };

    // Xəritə alətləri (Artıq animasiya yoxdur, sadəcə xəritə var)
    let mapInstance = null;
    // #endregion

    // #region 3. INIT
    const init = () => {
        console.log(`🚀 ${CONFIG.APP_NAME} başladılır...`);
        
        // Yaddaşdan temanı oxu
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            // Ayarlardakı düyməni də "işarələnmiş" (checked) et
            setTimeout(() => {
                const toggle = document.getElementById('theme-toggle');
                if(toggle) toggle.checked = true;
            }, 100);
        }

        const savedNewYear = localStorage.getItem('newYearMode');
        if (savedNewYear === 'true') {
            document.body.classList.add('new-year-mode');
            document.getElementById('snow-container').style.display = 'block';
            _createSnowflakes(); // Qarı başlat
            
            setTimeout(() => {
                const toggle = document.getElementById('newyear-toggle');
                if(toggle) toggle.checked = true;
            }, 100);
        }

        calculatePrices();
        renderResults();
        initMap();
    };
    // #endregion

    // #region 4. NAVİQASİYA
    const goTo = (viewId) => {
        document.querySelectorAll('.app-view').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        
        const target = document.getElementById(viewId);
        if (target) {
            target.style.display = 'flex';
            void target.offsetWidth; 
            target.classList.add('active');
        }

        if(viewId === 'view-search') {
            setTimeout(() => document.getElementById('destInput').focus(), 300);
        }
    };

    const simulateSearch = (type) => {
        const title = type == 'airport' ? 'Aeroport' : '28 Mall';
        state.destination = title;
        document.getElementById('routeTitle').textContent = `Gənclik → ${title}`;
        
        const btnElement = event.currentTarget
        btnElement.style.opacity = '0.5';
        
        setTimeout(() => {
            btnElement.style.opacity = '1';
            calculatePrices();
            renderResults();
            goTo('view-results');
        }, 400);
    };

    const toggleFilter = (el, type) => {
        document.querySelectorAll('.filter-chip').forEach(c => {
            c.classList.remove('chip-active');
            c.classList.add('chip-inactive');
        });
        el.classList.remove('chip-inactive');
        el.classList.add('chip-active');
        
        state.currentFilter = type;
        calculatePrices();
        renderResults();
    };

    const sortRides = () => {
        state.sortAscending = !state.sortAscending;
        state.calculatedResults.sort((a, b) => {
            return state.sortAscending 
                ? a.finalPrice - b.finalPrice 
                : b.finalPrice - a.finalPrice;
        });
        renderResults();
    };
    // #endregion

    // #region 5. XƏRİTƏ MÜHƏRRİKİ (Sadələşdirildi)
    const initMap = () => {
        const mapContainer = L.DomUtil.get('main-map');
        if(mapContainer !== null) { 
            mapContainer._leaflet_id = null; 
        }

        mapInstance = L.map('main-map', { 
            zoomControl: false, 
            attributionControl: false 
        }).setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
        }).addTo(mapInstance);

        // İstifadəçi İkonu (Göy nöqtə) qalır
        const userIcon = L.divIcon({
            className: 'user-pulse-icon',
            html: '<div style="background:#1A4175; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20]
        });

        L.marker(CONFIG.MAP_CENTER, {icon: userIcon})
            .addTo(mapInstance)
            .bindPopup("Siz buradasınız");
    };
    // #endregion

    // #region 6. SİFARİŞ MƏNTİQİ (Animasiyasız)
    const startOrder = (index) => {
        const selectedRide = state.calculatedResults[index];
        console.log(`🚖 Sifariş: ${selectedRide.name}`);

        // 1. Ekranları Dəyiş
        _switchScreensForOrder();

        // 2. UI - Axtarış rejimi
        document.getElementById('state-searching').style.display = 'block';
        document.getElementById('state-found').style.display = 'none';

        // 3. Panel məlumatlarını doldur (Sadəcə gözləmə)
        setTimeout(() => {
            _fillDriverInfo(selectedRide);
        }, CONFIG.ORDER_SIMULATION_TIME);
    };

    const cancelOrder = () => {
        if(!confirm("Sifarişi ləğv etmək istəyirsiniz?")) return;

        // Ekranları geri qaytar
        document.getElementById('view-order').style.display = 'none';
        document.getElementById('view-order').classList.remove('active');
        
        document.getElementById('view-home').style.display = 'none';
        document.getElementById('view-home').classList.remove('active');

        // Results ekranını aç
        const resultsView = document.getElementById('view-results');
        resultsView.style.display = 'flex';
        resultsView.classList.add('active');

        // Xəritəni sıfırla
        if(mapInstance) {
            mapInstance.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
        }

        setTimeout(() => alert("Sifariş ləğv edildi ❌"), 300);
    };

    // --- Köməkçi Funksiyalar ---

    const _switchScreensForOrder = () => {
        const resultsView = document.getElementById('view-results');
        resultsView.classList.remove('active');
        resultsView.style.display = 'none';

        const homeView = document.getElementById('view-home');
        homeView.style.display = 'flex';
        homeView.classList.add('active');

        const orderView = document.getElementById('view-order');
        orderView.style.display = 'flex';     
        orderView.classList.add('active');    
        orderView.style.zIndex = '1000'; 
    };

    const _fillDriverInfo = (selectedRide) => {
        const randomDriver = MOCK_DB.DRIVERS[Math.floor(Math.random() * MOCK_DB.DRIVERS.length)];
        const randomPlate = MOCK_DB.PLATES[Math.floor(Math.random() * MOCK_DB.PLATES.length)];

        document.getElementById('driver-name').textContent = randomDriver;
        document.getElementById('driver-plate').textContent = randomPlate;
        document.getElementById('driver-car').textContent = `${selectedRide.displayCar} • ${selectedRide.name}`; 

        document.getElementById('state-searching').style.display = 'none';
        document.getElementById('state-found').style.display = 'block';
    };
    // #endregion

    // #region 7. HESABLAMA & RENDERING
    const getRandomCar = (carList) => {
        return carList[Math.floor(Math.random() * carList.length)];
    };

    const calculatePrices = () => {
        const rules = CATEGORY_RULES[state.currentFilter];
        state.calculatedResults = state.providers.map(provider => {
            let finalPrice = (provider.basePrice * rules.multiplier);
            finalPrice += (Math.random() * 0.5); 
            
            return {
                ...provider,
                finalPrice: finalPrice,
                displayCar: getRandomCar(rules.cars),
                time: Math.floor(Math.random() * 10) + 2
            };
        });

        state.sortAscending = true;
        state.calculatedResults.sort((a, b) => a.finalPrice - b.finalPrice);
    };

    const safeHTML = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    const renderResults = () => {
        const container = document.getElementById('taxiList');
        const minPrice = Math.min(...state.calculatedResults.map(d => d.finalPrice));

        const html = state.calculatedResults.map((ride, index) => {
            const isBest = ride.finalPrice <= minPrice;
            const borderClass = isBest ? 'best-border' : '';
            const badge = isBest ? '<div style="position:absolute; top:-10px; right:15px; background:#8CC63F; color:white; font-size:10px; padding:3px 8px; border-radius:10px;">ƏN UCUZ</div>' : '';
            const btnClass = isBest ? 'btn-green' : 'btn-outline';

            return `
            <div class="taxi-card ${borderClass}">
                ${badge}
                <div class="logo-box ${ride.class}">${safeHTML(ride.name)}</div>
                <div>
                    <div style="font-weight:bold; color:#2c3e50;">${safeHTML(ride.name)}</div>
                    <div style="font-size:12px; color:#999; margin-top:3px;">
                        <span style="color:#2c3e50; font-weight:600;">${safeHTML(ride.displayCar)}</span> 
                        • ${ride.time} dəq
                    </div>
                </div>
                <div class="price-area">
                    <div class="price-val">${ride.finalPrice.toFixed(2)} ₼</div>
                    <button class="btn-sm ${btnClass}" onclick="SmartYol.startOrder(${index})">Sifariş</button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = html;
    };
    // #endregion

    // #region 8. MODAL & CALL ACTIONS
    const toggleModal = (show) => {
        const modal = document.getElementById('priceModal');
        show ? modal.classList.add('show') : modal.classList.remove('show');
    };

    const setAlert = () => {
        toggleModal(false);
        setTimeout(() => alert('Bildiriş quruldu! ✅'), 200);
    };

    const logout = () => {
        if(confirm("Hesabdan çıxmaq istədiyinizə əminsiniz?")) {
            alert("Uğurla çıxış edildi! 👋");
            window.location.reload();
        }
    };

    const makeCall = () => {
        const driverName = document.getElementById('driver-name').textContent;
        document.getElementById('call-name').textContent = driverName;
        document.getElementById('call-status').textContent = "Zəng gedir...";

        const callView = document.getElementById('view-call');
        callView.style.display = 'flex';
        callView.classList.add('active');

        setTimeout(() => { document.getElementById('call-status').textContent = "00:01"; }, 2000);
        setTimeout(() => { document.getElementById('call-status').textContent = "00:02"; }, 3000);
    };

    const endCall = () => {
        const callView = document.getElementById('view-call');
        callView.classList.remove('active');
        callView.style.display = 'none';
    };

    /**
     * Gecə/Gündüz rejimini dəyişir və yadda saxlayır
     */
    const toggleTheme = () => {
        const body = document.body;
        
        // 1. Klassı əlavə et və ya sil
        body.classList.toggle('dark-mode');
        
        // 2. Hazırkı vəziyyəti yoxla
        const isDark = body.classList.contains('dark-mode');
        
        // 3. Yaddaşa yaz (LocalStorage)
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        console.log(`Tema dəyişdi: ${isDark ? 'Qaranlıq 🌙' : 'Aydınlıq ☀️'}`);
    };

    // --- NEW YEAR LOGIC ---

    const toggleNewYear = () => {
        const body = document.body;
        const snowContainer = document.getElementById('snow-container');
        
        body.classList.toggle('new-year-mode');
        const isActive = body.classList.contains('new-year-mode');

        if (isActive) {
            snowContainer.style.display = 'block';
            _createSnowflakes();
            alert("Xoşbəxt illər! 🎄🎅");
        } else {
            snowContainer.style.display = 'none';
            snowContainer.innerHTML = ''; // Qarı təmizlə ki, RAM dolmasın
        }

        localStorage.setItem('newYearMode', isActive);
    };

    // Qar dənələrini yaradan köməkçi funksiya
    const _createSnowflakes = () => {
        const container = document.getElementById('snow-container');
        container.innerHTML = ''; // Köhnələri sil
        
        const flakeCount = 50; // Neçə dənə qar yağsın? (Çox olsa telefon donar)
        const characters = ['❄', '❅', '❆', '•']; // Qar formaları

        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            flake.textContent = characters[Math.floor(Math.random() * characters.length)];
            
            // Təsadüfi mövqe və sürət
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5 saniyə arası sürət
            flake.style.fontSize = (Math.random() * 10 + 10) + 'px'; // Ölçü
            flake.style.animationDelay = Math.random() * 5 + 's'; // Gecikmə
            
            container.appendChild(flake);
        }
    };

    // --- RATING LOGIC (YENİ) ---

    let currentRating = 0; // Seçilən ulduz sayı

    const finishRide = () => {
        // 1. Sürücünün adını order panelindən götürək
        const driverName = document.getElementById('driver-name').textContent;
        document.getElementById('rate-driver-name').textContent = driverName;

        // 2. Sifariş panelini bağla, Rating ekranını aç
        document.getElementById('view-order').style.display = 'none';
        document.getElementById('view-order').classList.remove('active');
        
        goTo('view-rating');
        
        // 3. Xəritə arxa fonda qalmasın deyə home-u da bağlaya bilərik
        document.getElementById('view-home').style.display = 'none';
    };

    const selectStar = (count) => {
        currentRating = count;
        const stars = document.querySelectorAll('.star');
        
        // Ulduzları rənglə
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    };

    const toggleComplaint = (el) => {
        // Şikayət seçiləndə qırmızı olsun
        el.classList.toggle('selected');
    };

    const submitFeedback = () => {
        const feedbackText = document.getElementById('feedback-text').value;
        
        // Şikayət var? (Seçilmiş teqləri tapırıq)
        const complaints = document.querySelectorAll('.complaint-tag.selected');
        let complaintList = [];
        complaints.forEach(c => complaintList.push(c.textContent));

        console.log("📝 Feedback:", {
            rating: currentRating,
            complaints: complaintList,
            note: feedbackText
        });

        // Simulyasiya
        alert("Fikriniz üçün təşəkkürlər! Səfər tamamlandı. ✅");
        
        // Tətbiqi sıfırla və ana səhifəyə qaytar
        window.location.reload(); 
    };
    // #endregion

    // #region 9. PUBLIC API
    return {
        init, goTo, simulateSearch, toggleFilter, toggleModal, setAlert, 
        sortRides, logout, startOrder, cancelOrder, makeCall, endCall,
        finishRide,
        selectStar,
        toggleComplaint,
        submitFeedback,
        toggleTheme,
        toggleNewYear
    };
    // #endregion

})();

document.addEventListener('DOMContentLoaded', SmartYol.init);