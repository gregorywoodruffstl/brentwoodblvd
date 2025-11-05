// Business data will be loaded from businesses.json
let allBusinesses = [];
let displayedBusinesses = [];

// DOM elements
const businessGrid = document.getElementById('businessGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const levelFilter = document.getElementById('levelFilter');
const resetBtn = document.getElementById('resetBtn');

// Load business data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadBusinessData();
    displayBusinesses(allBusinesses);
    populateFilters();
    setupEventListeners();
});

// Load business data from JSON file
async function loadBusinessData() {
    try {
        const response = await fetch('data/businesses.json');
        if (!response.ok) {
            throw new Error('Failed to load business data');
        }
        allBusinesses = await response.json();
        displayedBusinesses = [...allBusinesses];
    } catch (error) {
        console.error('Error loading business data:', error);
        businessGrid.innerHTML = '<div class="no-results">Unable to load business directory. Please try again later.</div>';
    }
}

// Display businesses in the grid
function displayBusinesses(businesses) {
    if (businesses.length === 0) {
        businessGrid.innerHTML = '<div class="no-results">No businesses found matching your criteria. Try adjusting your filters.</div>';
        return;
    }

    businessGrid.innerHTML = businesses.map(business => `
        <div class="business-card" data-id="${business.id}">
            <span class="business-tier">Tier ${business.tier}</span>
            <h3 class="business-name">${business.name}</h3>
            <span class="business-category">${business.category}</span>
            
            <div class="business-address">
                📍 ${business.address}
            </div>
            
            ${business.phone ? `
                <div class="business-phone">
                    📞 <a href="tel:${business.phone.replace(/[^0-9]/g, '')}">${business.phone}</a>
                </div>
            ` : ''}
            
            ${business.website ? `
                <div class="business-website">
                    🌐 <a href="${business.website}" target="_blank" rel="noopener">Visit Website</a>
                </div>
            ` : ''}
            
            ${business.promotion ? `
                <div class="business-promotion">
                    <strong>Special Offer:</strong> ${business.promotion}
                </div>
            ` : ''}
            
            ${business.affiliate ? `
                <span class="affiliate-badge">Featured Partner</span>
            ` : ''}
        </div>
    `).join('');

    // Add click events to business cards
    document.querySelectorAll('.business-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link
            if (e.target.tagName === 'A') return;
            
            const businessId = card.dataset.id;
            const business = allBusinesses.find(b => b.id == businessId);
            if (business && business.website) {
                window.open(business.website, '_blank', 'noopener');
            }
        });
    });
}

// Populate category and level filters
function populateFilters() {
    // Get unique categories
    const categories = [...new Set(allBusinesses.map(b => b.category))].sort();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter businesses based on search and filters
function filterBusinesses() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedLevel = levelFilter.value;

    displayedBusinesses = allBusinesses.filter(business => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            business.name.toLowerCase().includes(searchTerm) ||
            business.category.toLowerCase().includes(searchTerm) ||
            business.address.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = selectedCategory === 'all' || 
            business.category === selectedCategory;

        // Tier filter
        const matchesTier = selectedLevel === 'all' || 
            business.tier.toString() === selectedLevel;

        return matchesSearch && matchesCategory && matchesTier;
    });

    displayBusinesses(displayedBusinesses);
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    categoryFilter.value = 'all';
    levelFilter.value = 'all';
    displayedBusinesses = [...allBusinesses];
    displayBusinesses(displayedBusinesses);
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', filterBusinesses);
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterBusinesses();
        }
    });

    // Real-time filtering as user types (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterBusinesses, 300);
    });

    categoryFilter.addEventListener('change', filterBusinesses);
    levelFilter.addEventListener('change', filterBusinesses);
    resetBtn.addEventListener('click', resetFilters);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }

    lastScroll = currentScroll;
});

// Google AdSense integration placeholder
// Once approved, add your AdSense code here
function initializeAds() {
    // Example ad placement in business cards
    // This will be implemented once AdSense is approved
    console.log('Ad system ready for integration');
}

// Analytics tracking (placeholder for Google Analytics)
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track business clicks for analytics
document.addEventListener('click', (e) => {
    const businessCard = e.target.closest('.business-card');
    if (businessCard) {
        const businessName = businessCard.querySelector('.business-name').textContent;
        trackEvent('Business', 'Click', businessName);
    }
});