import { Loader } from 'https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.2/+esm';

console.log("0. Script loaded successfully");

let map;
const API_KEY = 'AIzaSyD9Z2Iu74KeOVz0lnWsK8X-g-15FoKZTm8';

const loader = new Loader({
    apiKey: API_KEY,
    version: 'weekly',
    libraries: ['places']
});

async function startApp() {
    console.log("1. startApp triggered");
    try {
        const { Map } = await loader.importLibrary('maps');
        await loader.importLibrary('places');
        
        console.log("2. Libraries Loaded");

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error("Error: Could not find <div id='map'> in your HTML.");
            return;
        }

        map = new Map(mapElement, {
            center: { lat: 48.8566, lng: 2.3522 },
            zoom: 10,
        });

        getLocation();
    } catch (e) {
        console.error("Error loading maps:", e);
    }
}

function getLocation() {
    console.log("3. Asking for GPS...");
    navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("4. GPS Success! Latitude: " + coords.lat + " Longitude: " + coords.lng);
        
        map.setCenter(coords);
        map.setZoom(13);
        findGolfCourses();
    }, (err) => {
        console.error("GPS Error: ", err.message);
        alert("Please enable location permissions.");
    });
}

async function findGolfCourses() {
    console.log("5. Searching for golf courses using the New Place API...");

    // 1. Import the 'Place' and 'SearchNearbyRankPreference' classes
    const { Place, SearchNearbyRankPreference } = await loader.importLibrary('places');
    const resultsDiv = document.querySelector('.results-box');

    // 2. Prepare the request
    const request = {
        // Required fields for the NEW API
        fields: ['displayName', 'formattedAddress', 'rating', 'location'],
        locationRestriction: {
            center: map.getCenter(),
            radius: 5000, // 5km
        },
        includedPrimaryTypes: ['golf_course'],
        maxResultCount: 10,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
    };

    try {
        // 3. The actual search call
        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
            console.log(`6. Found ${places.length} courses!`);
            resultsDiv.innerHTML = '<h3 class="mt-4">Golf Courses Near You</h3>';

            places.forEach((place) => {
                const div = document.createElement('div');
                div.className = "card mb-3 p-3 shadow-sm";
                
                // Note: The new API uses displayName.text instead of name
                div.innerHTML = `
                    <h5 class="mb-1">${place.displayName}</h5>
                    <p class="mb-0 text-muted">${place.formattedAddress || 'Address unavailable'}</p>
                    ${place.rating ? `<small class="text-success">Rating: ${place.rating} ★</small>` : ''}
                `;
                resultsDiv.appendChild(div);
            });
        } else {
            resultsDiv.innerHTML = '<p>No courses found nearby.</p>';
        }
    } catch (error) {
        console.error("New Search API Error:", error);
        // If the NEW API fails, it might be due to billing or API settings
        resultsDiv.innerHTML = '<p class="text-danger">Search failed. Check your API console permissions.</p>';
    }
}

// Ensure the button is ready before attaching the click event
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('geo-btn');
    if (btn) {
        btn.addEventListener('click', startApp);
        console.log("Button 'geo-btn' is ready for clicking.");
    } else {
        console.error("Button with id 'geo-btn' not found!");
    }
});