const geoPos = document.getElementById("location");
const btn = document.querySelector(".btn");

btn.addEventListener("click", getLocation);

function getLocation(){
    if(navigator.getLocation){
      navigator.geolocation.getCurrentPosition(showLoc);  
    }
    else{
        geoPos.innerHTML = "Geolocation is not supported on this browser.";
    }
    
}

function showLoc(pos){
    console.log("Location found!");
    geoPos.innerHTML=
        console.log("Latitude: " + pos.coords.latitude + "Longitude: " + pos.coords.longitude);
}

function showError(error) {
    console.error("Error occurred:", error); // Debug Step 3
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            geoPos.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            geoPos.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            geoPos.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            geoPos.innerHTML = "An unknown error occurred.";
            break;
    }
}