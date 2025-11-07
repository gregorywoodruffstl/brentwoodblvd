// Business data will be loaded from businesses.json
let allBusinesses = [];
let displayedBusinesses = [];
let allEvents = [];

// DOM elements
const businessGrid = document.getElementById('businessGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const levelFilter = document.getElementById('levelFilter');
const statusFilter = document.getElementById('statusFilter');
const resetBtn = document.getElementById('resetBtn');
const resultsCount = document.getElementById('resultsCount');
const eventsGrid = document.getElementById('eventsGrid');

// Load business data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadBusinessData();
    await loadEventsData();
    displayBusinesses(allBusinesses);
    displayEvents('all');
    setupEventListeners();
    updateResultsCount();
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
    displayedBusinesses = businesses;
    
    if (businesses.length === 0) {
        businessGrid.innerHTML = '<div class="no-results">📭 No businesses found matching your criteria. Try adjusting your filters.</div>';
        updateResultsCount();
        return;
    }

    businessGrid.innerHTML = businesses.map((business, index) => `
        <div class="business-card ${business.featured ? 'featured' : ''}" data-id="${business.id}">
            ${business.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
            <span class="business-tier">Tier ${business.tier}</span>
            <h3 class="business-name">${business.name}</h3>
            <span class="business-category">${business.category}</span>
            
            <div class="business-address">
                📍 ${business.address}
            </div>
            
            ${business.phone ? `
                <div class="business-phone">
                    📞 <a href="tel:${business.phone.replace(/[^0-9]/g, '')}" onclick="event.stopPropagation()">${business.phone}</a>
                </div>
            ` : ''}
            
            ${business.email ? `
                <div class="business-email">
                    ✉️ <a href="mailto:${business.email}" onclick="event.stopPropagation()">Email</a>
                </div>
            ` : ''}
            
            ${business.website ? `
                <div class="business-website">
                    🌐 <a href="${business.website}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Visit Website</a>
                </div>
            ` : ''}
            
            ${business.hours ? `
                <div class="business-hours">
                    🕐 ${business.hours}
                </div>
            ` : ''}
            
            ${business.promotion ? `
                <div class="business-promotion">
                    🎁 <strong>Special:</strong> ${business.promotion}
                </div>
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
    
    updateResultsCount();
}

// Update results counter
function updateResultsCount() {
    if (!resultsCount) return;
    
    const total = allBusinesses.length;
    const showing = displayedBusinesses.length;
    
    if (showing === total) {
        resultsCount.textContent = `Showing all ${total} businesses`;
    } else {
        resultsCount.textContent = `Showing ${showing} of ${total} businesses`;
    }
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
    const selectedStatus = statusFilter.value;

    let filtered = allBusinesses.filter(business => {
        // Search filter - search across multiple fields
        const matchesSearch = searchTerm === '' || 
            business.name.toLowerCase().includes(searchTerm) ||
            (business.category && business.category.toLowerCase().includes(searchTerm)) ||
            (business.address && business.address.toLowerCase().includes(searchTerm)) ||
            (business.description && business.description.toLowerCase().includes(searchTerm));

        // Category filter
        const matchesCategory = selectedCategory === '' || 
            business.category === selectedCategory;

        // Tier filter
        const matchesTier = selectedLevel === '' || 
            business.tier.toString() === selectedLevel;
            
        // Status filter
        const matchesStatus = selectedStatus === '' ||
            (selectedStatus === 'featured' && business.featured) ||
            (selectedStatus === 'open' && isOpenNow(business));

        return matchesSearch && matchesCategory && matchesTier && matchesStatus;
    });

    displayBusinesses(filtered);
}

// Check if business is currently open (placeholder - needs real hours data)
function isOpenNow(business) {
    // This would check actual business hours
    // For now, return true as placeholder
    return true;
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    levelFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    displayBusinesses(allBusinesses);
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
    if (statusFilter) statusFilter.addEventListener('change', filterBusinesses);
    updateResultsCount();
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

// ============== PHOTO GALLERY ==============

const photos = [
    {
        id: 1,
        title: "Brentwood Boulevard - 1925",
        description: "Main street view showing early commercial development",
        era: "1920s",
        image: "https://via.placeholder.com/400x300/8B4513/FFFFFF?text=1925+Brentwood+Blvd",
        category: "streetview"
    },
    {
        id: 2,
        title: "Corner Store - 1928",
        description: "Traditional corner grocery and general store",
        era: "1920s",
        image: "https://via.placeholder.com/400x300/6B8E23/FFFFFF?text=1928+Corner+Store",
        category: "business"
    },
    {
        id: 3,
        title: "Street Parade - 1922",
        description: "Community celebration along the Boulevard",
        era: "1920s",
        image: "https://via.placeholder.com/400x300/4682B4/FFFFFF?text=1922+Parade",
        category: "event"
    },
    {
        id: 4,
        title: "Brentwood Boulevard - 1956",
        description: "Post-war expansion and new storefronts",
        era: "1950s",
        image: "https://via.placeholder.com/400x300/CD5C5C/FFFFFF?text=1956+Boulevard",
        category: "streetview"
    },
    {
        id: 5,
        title: "Drive-In Restaurant - 1960",
        description: "Classic car culture on Brentwood Boulevard",
        era: "1950s",
        image: "https://via.placeholder.com/400x300/20B2AA/FFFFFF?text=1960+Drive-In",
        category: "business"
    },
    {
        id: 6,
        title: "Shopping Center - 1965",
        description: "Modern retail plaza opens on the Boulevard",
        era: "1950s",
        image: "https://via.placeholder.com/400x300/9370DB/FFFFFF?text=1965+Shopping",
        category: "business"
    },
    {
        id: 7,
        title: "Brentwood Boulevard Today",
        description: "Thriving commercial corridor with modern businesses",
        era: "modern",
        image: "https://via.placeholder.com/400x300/2F4F4F/FFFFFF?text=Modern+Boulevard",
        category: "streetview"
    },
    {
        id: 8,
        title: "Local Restaurant - 2024",
        description: "Contemporary dining on the Boulevard",
        era: "modern",
        image: "https://via.placeholder.com/400x300/B8860B/FFFFFF?text=2024+Restaurant",
        category: "business"
    },
    {
        id: 9,
        title: "Community Event - 2023",
        description: "Annual street festival celebrating local businesses",
        era: "modern",
        image: "https://via.placeholder.com/400x300/DC143C/FFFFFF?text=2023+Festival",
        category: "event"
    }
];

let currentEra = 'all';

function loadPhotoGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    displayPhotos(currentEra);
    
    // Tab switching
    const tabs = document.querySelectorAll('.gallery-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentEra = tab.dataset.era;
            displayPhotos(currentEra);
        });
    });
}

function displayPhotos(era) {
    const galleryGrid = document.getElementById('galleryGrid');
    const filteredPhotos = era === 'all' 
        ? photos 
        : photos.filter(p => p.era === era);
    
    galleryGrid.innerHTML = filteredPhotos.map(photo => `
        <div class="gallery-item" data-id="${photo.id}">
            <div class="gallery-image">
                <img src="${photo.image}" alt="${photo.title}" loading="lazy">
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <h4>${photo.title}</h4>
                        <p>${photo.description}</p>
                    </div>
                </div>
            </div>
            <div class="gallery-caption">
                <span class="era-tag">${formatEra(photo.era)}</span>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for lightbox (future enhancement)
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const photoId = parseInt(item.dataset.id);
            const photo = photos.find(p => p.id === photoId);
            openLightbox(photo);
        });
    });
}

function formatEra(era) {
    const eraMap = {
        '1920s': '📷 1920s',
        '1950s': '📸 1950s-60s',
        'modern': '📱 Modern',
        'all': '📷 All Eras'
    };
    return eraMap[era] || era;
}

function openLightbox(photo) {
    // Create lightbox modal
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${photo.image}" alt="${photo.title}">
            <div class="lightbox-caption">
                <h3>${photo.title}</h3>
                <p>${photo.description}</p>
                <span class="lightbox-era">${formatEra(photo.era)}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Close lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.className === 'lightbox-close') {
            document.body.removeChild(lightbox);
            document.body.style.overflow = 'auto';
        }
    });
}

// ===================================
// EVENTS CALENDAR
// ===================================

// Load events data from JSON file
async function loadEventsData() {
    try {
        const response = await fetch('data/events.json');
        if (!response.ok) {
            throw new Error('Failed to load events data');
        }
        const data = await response.json();
        allEvents = data.events;
    } catch (error) {
        console.error('Error loading events data:', error);
        if (eventsGrid) {
            eventsGrid.innerHTML = '<div class="no-results">Unable to load events. Please try again later.</div>';
        }
    }
}

// Display events with optional category filter
function displayEvents(category = 'all') {
    if (!eventsGrid) return;
    
    // Filter events by category and site (show brentwood and community events)
    let filteredEvents = allEvents.filter(event => 
        (category === 'all' || event.category === category) &&
        (event.site === 'brentwood' || event.category === 'community' || event.category === 'historical')
    );
    
    // Sort events by date
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredEvents.length === 0) {
        eventsGrid.innerHTML = '<div class="no-results">📅 No events found in this category.</div>';
        return;
    }
    
    eventsGrid.innerHTML = filteredEvents.map(event => `
        <div class="event-card" data-category="${event.category}">
            <div class="event-icon">${event.image}</div>
            <div class="event-content">
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <span class="event-category ${event.category}">${event.category}</span>
                </div>
                <div class="event-details">
                    <p class="event-date">📅 ${formatEventDate(event.date)}</p>
                    <p class="event-time">🕒 ${event.time}</p>
                    <p class="event-location">📍 ${event.location}</p>
                    <p class="event-price">💵 ${event.price}</p>
                </div>
                <p class="event-description">${event.description}</p>
            </div>
        </div>
    `).join('');
}

// Format event date to readable format
function formatEventDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Setup event filter buttons
document.addEventListener('DOMContentLoaded', () => {
    const eventFilterBtns = document.querySelectorAll('.event-filter-btn');
    eventFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            eventFilterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Display filtered events
            displayEvents(btn.dataset.category);
        });
    });
});

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPhotoGallery();
});

// ============== PHOTO GALLERY ==============

const galleryPhotos = [
    {
        id: 1,
        title: "Brentwood Boulevard - 1925",
        description: "Historic view of Brentwood Boulevard looking south from Manchester Road",
        era: "1920s",
        source: "Library of Congress",
        type: "historical",
        thumbnail: "data/photos/placeholder-blvd-1920s.jpg",
        full: "data/photos/placeholder-blvd-1920s.jpg"
    },
    {
        id: 2,
        title: "Maddenville Settlement - Early 1900s",
        description: "Original Maddenville settlement buildings along the boulevard",
        era: "1920s",
        source: "Library of Congress",
        type: "historical",
        thumbnail: "data/photos/placeholder-maddenville.jpg",
        full: "data/photos/placeholder-maddenville.jpg"
    },
    {
        id: 3,
        title: "Streetcar Service - 1920s",
        description: "Electric streetcar on Brentwood Boulevard",
        era: "1920s",
        source: "Library of Congress",
        type: "historical",
        thumbnail: "data/photos/placeholder-streetcar.jpg",
        full: "data/photos/placeholder-streetcar.jpg"
    },
    {
        id: 4,
        title: "Modern Brentwood Boulevard",
        description: "Contemporary view of thriving business district",
        era: "modern",
        source: "AI Generated Visualization",
        type: "ai-generated",
        thumbnail: "data/photos/placeholder-modern.jpg",
        full: "data/photos/placeholder-modern.jpg"
    },
    {
        id: 5,
        title: "Retail Shops - 1950s",
        description: "Mid-century shopping along the boulevard",
        era: "1950s",
        source: "Library of Congress",
        type: "historical",
        thumbnail: "data/photos/placeholder-1950s.jpg",
        full: "data/photos/placeholder-1950s.jpg"
    },
    {
        id: 6,
        title: "Historic Manchester Road Intersection",
        description: "The iconic intersection of Brentwood and Manchester",
        era: "1920s",
        source: "AI Generated Historical Recreation",
        type: "ai-generated",
        thumbnail: "data/photos/placeholder-intersection.jpg",
        full: "data/photos/placeholder-intersection.jpg"
    }
];

let currentGalleryFilter = 'all';

function loadPhotoGallery() {
    displayGalleryPhotos(currentGalleryFilter);
    setupGalleryFilters();
}

function setupGalleryFilters() {
    const galleryTabs = document.querySelectorAll('.gallery-tab');
    galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            galleryTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');
            // Filter gallery
            const era = tab.dataset.era;
            currentGalleryFilter = era;
            displayGalleryPhotos(era);
        });
    });
}

function displayGalleryPhotos(filter = 'all') {
    const galleryContainer = document.getElementById('galleryGrid');
    if (!galleryContainer) return;
    
    let filteredPhotos = galleryPhotos;
    if (filter !== 'all') {
        filteredPhotos = galleryPhotos.filter(photo => photo.era === filter);
    }
    
    galleryContainer.innerHTML = filteredPhotos.map(photo => `
        <div class="gallery-item" data-era="${photo.era}" data-type="${photo.type}">
            <div class="gallery-image-container">
                <div class="gallery-placeholder">
                    <span class="placeholder-icon">📸</span>
                    <p>Photo Coming Soon</p>
                </div>
            </div>
            <div class="gallery-caption">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
                <div class="gallery-meta">
                    <span class="era-badge">${photo.era}</span>
                    <span class="source-badge ${photo.type === 'ai-generated' ? 'ai-badge' : ''}">
                        ${photo.type === 'ai-generated' ? '🤖 ' : '📚 '}${photo.source}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}
