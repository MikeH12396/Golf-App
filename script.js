const geoPos = document.getElementById("location");

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