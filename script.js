import { Loader } from 'https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.2/+esm';

const API_KEY = 'AIzaSyD9Z2Iu74KeOVz0lnWsK8X-g-15FoKZTm8'; 
let map;

const loader = new Loader({
    apiKey: API_KEY,
    version: 'weekly',
    libraries: ['places', 'marker']
});

// --- HELPER FUNCTION (Must be top-level) ---
async function addMarker(location, title) {
    try {
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');
        new AdvancedMarkerElement({
            map: map,
            position: location,
            title: title,
        });
    } catch (e) {
        console.error("Marker error:", e);
    }
}

async function initMap() {
    try {
        const { Map } = await loader.importLibrary('maps');
        
        map = new Map(document.getElementById('map'), {
            center: { lat: 52.3550, lng: -7.7022 }, 
            zoom: 10,
            mapId: 'DEMO_MAP_ID' 
        });

        const btn = document.getElementById('geo-btn');
        if (btn) btn.addEventListener('click', startSequence);
        
        console.log("1. Map and button initialized.");
    } catch (e) {
        console.error("Initialization Error:", e);
    }
}

function startSequence() {
    console.log("2. Button clicked.");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(coords);
            map.setZoom(13);
            findGolfCourses();
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function findGolfCourses() {
    console.log("Searching for courses...");
    const { Place, SearchNearbyRankPreference } = await loader.importLibrary('places');
    
    let resultsBox = document.querySelector('.results-box');
    if (!resultsBox) {
        resultsBox = document.createElement('div');
        resultsBox.className = 'results-box';
        document.body.appendChild(resultsBox);
    }

    resultsBox.innerHTML = '<div class="text-center">🔍 Searching for fairways...</div>';

    const request = {
        // Use these stable fields that are guaranteed to work in Nearby Search
        fields: ['displayName', 'formattedAddress', 'id', 'location', 'rating'],
        locationRestriction: {
            center: map.getCenter(),
            radius: 10000, 
        },
        includedPrimaryTypes: ['golf_course'],
        maxResultCount: 15,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
    };

    try {
        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
            resultsBox.innerHTML = '<h2 class="mb-4">Golf Courses Near You</h2>';

            places.forEach((place, index) => {
                const div = document.createElement('div');
                div.className = "card mb-3 p-3 shadow-sm border-0";
                div.style.borderLeft = "6px solid #28a745"; 
                
                // Create a "Search Google" link using the Place Name
                // This is a 100% reliable way to get them to the club's info
                const searchLink = `https://www.google.com/search?q=${encodeURIComponent(place.displayName + ' golf club')}`;
                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName)}&query_place_id=${place.id}`;

                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1" style="font-weight: bold;">${place.displayName}</h5>
                            <p class="mb-2 text-muted small">${place.formattedAddress}</p>
                            <div class="mt-2">
                                <a href="${searchLink}" target="_blank" class="btn btn-success btn-sm me-2">More Info</a>
                                <a href="${mapsLink}" target="_blank" class="btn btn-outline-primary btn-sm">View on Maps</a>
                            </div>
                        </div>
                        ${place.rating ? `<div><span class="badge bg-warning text-dark">${place.rating} ★</span></div>` : ''}
                    </div>
                `;
                resultsBox.appendChild(div);

                // Add marker in background
                addMarker(place.location, place.displayName);
            });
        } else {
            resultsBox.innerHTML = "<div class='alert alert-info'>No courses found. Try a different location!</div>";
        }
    } catch (err) {
        console.error("Search failed:", err);
        resultsBox.innerHTML = "<div class='alert alert-danger'>API Error. Check console.</div>";
    }
}

// Start the app
initMap();