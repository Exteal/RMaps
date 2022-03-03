const formSearch = document.querySelector("#formSearch");
const formSearchAdvanced = document.querySelector("#formSearchAdvanced");
const searchMotor = document.querySelector("#searchMotor");
const typeSearch = document.querySelector("#type-search");
const btnAdvancedForm = document.querySelector("#btnAdvancedSearch");
const btnTraceRoute = document.querySelector("#btnTraceRoute");

//routing 
const btOpennRoute = document.querySelector("#btnOpenRoute");
const btnCloseRoute = document.querySelector("#btnCloseRoute");
const routeInterface = document.querySelector("#routeInterface");
const routeStartInput = document.querySelector("#routeStartInput");
const routeDestinationInput = document.querySelector("#routeDestinationInput");


const accessToken = "pk.eyJ1IjoiYWxwaG9uc2VhbG9uenkiLCJhIjoiY2t6aWZ2ZGlzMDg5dzJvbDQyY3JldTAzeiJ9.y_8yWktMT0rmyYFi19aJig";
const locationList = [null,null];
const tempMarkers = [];
const routesList = [];
let map;

const init = function () {

    fetch("https://nominatim.openstreetmap.org/search?country=france&limit=1&format=json&addressdetails=1")
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {

        const lat = Number.parseFloat(res[0].lat);
        const lon = Number.parseFloat(res[0].lon);

        map = L.map('map').setView([lat,lon], 10);
        
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            minZoom:1,
            maxZoom: 10,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: accessToken
        }).addTo(map);

        map.on("click", onMapClick);
    
    })
}
window.onload = init();

formSearch.addEventListener("submit",function(e) {
    e.preventDefault();aaaaaaaaaaaaaaa
    
    //${typeSearch.value}
    const query = `https://nominatim.openstreetmap.org/search?q=${searchMotor.value}&limit=1&format=json&addressdetails=1`;

    fetch(query)
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {

        const lat = Number.parseFloat(res[0].lat);
        const lon = Number.parseFloat(res[0].lon);

        map.setView([lat,lon], 13);


        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: "pk.eyJ1IjoiYWxwaG9uc2VhbG9uenkiLCJhIjoiY2t6aWZ2ZGlzMDg5dzJvbDQyY3JldTAzeiJ9.y_8yWktMT0rmyYFi19aJig"
        }).addTo(map);
    
        searchMotor.value="";
    })
})

btnAdvancedForm.addEventListener("click", function(e) {
    formSearch.hidden = !(formSearch.hidden);
    formSearchAdvanced.hidden = !(formSearchAdvanced.hidden);
});


btnOpenRoute.addEventListener("click", function(e) {
    
    routeInterface.hidden = false;
    this.hidden = true;  
    traceRoute();  
});

btnCloseRoute.addEventListener("click",function(e) {
    routeInterface.hidden = true;
    btnOpenRoute.hidden = false;
    routesList.forEach(e => e.remove());
    locationList.splice(0,locationList.length,null);
    routeStartInput.value = "";
    routeDestinationInput.value="";
});

btnTraceRoute.addEventListener("click",function(e) {
    traceRoute();
});

const onMarkerClick = function(e) {
    e.preventDefault();
}

const onMapClick = function(e) {
    var container = L.DomUtil.create('div'),
    startBtn = createButton('Partir d\'ici', container),
    destBtn = createButton('Aller jusqu\'ici', container);

    L.popup()
    .setContent(container)
    .setLatLng(e.latlng)
    .openOn(map);

    L.DomEvent.on(startBtn, 'click', function() {
        locationList.splice(0, 1, e.latlng);
        const lat = e.latlng["lat"];
        const lng = e.latlng["lng"];
        const query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;
        fetch(query)
        .then(function(res) {
           return res.json();
        })
        .then(function(res) {
            routeStartInput.value = res.features[2]["text"];
            btnOpenRoute.click();
            traceRoute();
        })

        map.closePopup();
    });

    L.DomEvent.on(destBtn, 'click', function() {
        locationList.splice(1, 1, e.latlng);
        

        const lat = e.latlng["lat"];
        const lng = e.latlng["lng"];
        const query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;
        fetch(query)
        .then(function(res) {
           return res.json();
        })
        .then(function(res) {
            routeDestinationInput.value = res.features[2]["text"];
            btnOpenRoute.click();
            traceRoute();
        })

        map.closePopup();
    });
}

const createButton = function (label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerText = label;
    return btn;
}

const traceRoute = function() {
    if (locationList[0] && locationList[1]) {
        routesList.forEach(e => e.remove());
        const control = L.Routing.control({
            waypoints: [
                locationList[0],
                locationList[1]
            ],
            router: L.Routing.mapbox(accessToken,{language : 'fr'})
        });
        routesList.push(control);
        control.addTo(map);
    }
}

routeStartInput.addEventListener("change", function(e) {
    fetch(`https://nominatim.openstreetmap.org/search?q=${e.target.value}&limit=1&format=json&addressdetails=1`)
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {

    const lat = Number.parseFloat(res[0].lat);
    const lon = Number.parseFloat(res[0].lon);

    const coord = L.latLng(lat,lon);
    locationList.splice(0,1,coord);
    });
})

routeDestinationInput.addEventListener("change", function(e) {
    fetch(`https://nominatim.openstreetmap.org/search?q=${e.target.value}&limit=1&format=json&addressdetails=1`)
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {

    const lat = Number.parseFloat(res[0].lat);
    const lon = Number.parseFloat(res[0].lon);

    const coord = L.latLng(lat,lon);
    locationList.splice(1,1,coord);
    });
})