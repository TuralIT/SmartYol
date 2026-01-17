// 1. The Companies (Providers)
// 'basePrice' is the starting price for Economy
const PROVIDERS = [
    { id: 1, name: 'Bolt', class: 'bolt', basePrice: 4.50, speed: 'Fast' },
    { id: 2, name: 'Uber', class: 'uber', basePrice: 5.20, speed: 'Normal' },
    { id: 3, name: 'Yango', class: 'yango', basePrice: 4.10, speed: 'Fast' },
    { id: 4, name: '189', class: 't189', basePrice: 6.00, speed: 'Slow' },
    { id: 5, name: 'Maxim', class: 'maxim', basePrice: 3.80, speed: 'Normal' }
];

const CATEGORY_RULES = {
    'economy': {
        multiplier: 1.0, // Normal Price
        cars: ['Prius 20', 'Accent', 'Rio', 'Vesta', 'Logan']
    },
    'comfort': {
        multiplier: 1.6, // 60% more expensive
        cars: ['Corolla', 'Elantra', 'Cruze', 'Cerato', 'Insight']
    },
    'business': {
        multiplier: 2.8, // almost 3x price
        cars: ['E-Class', 'BMW 5', 'Land Cruiser', 'Avalon', 'Passat']
    }
};

// Localization Dictionary
const I18N = {
    az: {
        searching: "Sürücü axtarılır...",
        driver_found: "Sürücü gəlir",
        cancel_confirm: "Sifarişi ləğv etmək istəyirsiniz?",
        cancel_done: "Sifariş ləğv edildi ❌",
        feedback_thanks: "Fikriniz üçün təşəkkürlər! Səfər tamamlandı. ✅"
    }
    // en: { ... } future support
};