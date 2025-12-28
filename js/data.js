/**
 * DATA LAYER
 * Separating Providers from Category Rules
 */

// 1. The Companies (Providers)
// 'basePrice' is the starting price for Economy
const PROVIDERS = [
    { id: 1, name: 'Bolt', class: 'bolt', basePrice: 4.50, speed: 'Fast' },
    { id: 2, name: 'Uber', class: 'uber', basePrice: 5.20, speed: 'Normal' },
    { id: 3, name: 'Yango', class: 'yango', basePrice: 4.10, speed: 'Fast' },
    { id: 4, name: '189', class: 't189', basePrice: 6.00, speed: 'Slow' },
    { id: 5, name: 'Maxim', class: 'maxim', basePrice: 3.80, speed: 'Normal' }
];

// 2. The Rules (Business Logic)
// Multiplier: How much more expensive is this category?
// Cars: What specific cars appear in this category?
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