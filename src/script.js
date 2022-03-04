const formSearch = document.querySelector("#formSearch");
const formSearchAdvanced = document.querySelector("#formSearchAdvanced");
const searchMotor = document.querySelector("#searchMotor");
const typeSearch = document.querySelector("#type-search");
const btnAdvancedForm = document.querySelector("#btnAdvancedSearch");
const btnTraceRoute = document.querySelector("#btnTraceRoute");
const btnRouteShowOptions = document.querySelector("#btnRouteShowOptions");
const btnRouteHideOptions = document.querySelector("#btnRouteHideOptions");
const btnsTransports = document.querySelectorAll(".btnMeansOfTransport");
//routing 
const btOpennRoute = document.querySelector("#btnOpenRoute");
const btnCloseRoute = document.querySelector("#btnCloseRoute");
const routeInterface = document.querySelector("#routeInterface");
const routeStartInput = document.querySelector("#routeStartInput");
const routeDestinationInput = document.querySelector("#routeDestinationInput");


const accessToken = "pk.eyJ1IjoiYWxwaG9uc2VhbG9uenkiLCJhIjoiY2t6aWZ2ZGlzMDg5dzJvbDQyY3JldTAzeiJ9.y_8yWktMT0rmyYFi19aJig";
const locationList = [null,null];
const routesList = [];
let meanOfTransport = undefined;

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
            minZoom:3,
            maxZoom: 10,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: accessToken
        }).addTo(map);

        map.on("click", onMapClick);
    
        const southWest = L.latLng(-89.98155760646617, -180);
        const northEast = L.latLng(89.99346179538875, 180);
        const bounds = L.latLngBounds(southWest, northEast);

        map.setMaxBounds(bounds);
        map.on('drag', function() {
	        map.panInsideBounds(bounds, { animate: false });
        });
    })
}
window.onload = init();

formSearch.addEventListener("submit",function(e) {
    e.preventDefault();
    
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
    meanOfTransport = undefined;
    unselectTransportButton();
});
btnTraceRoute.addEventListener("click",function(e) {
    traceRoute(meanOfTransport);
});
const onMarkerClick = function(e) {
    e.preventDefault();
}
const onMapClick = function(e) {
    
    const latClick = e.latlng["lat"];
    const lngClick = e.latlng["lng"];
    const query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngClick},${latClick}.json?access_token=${accessToken}`;
    fetch(query)
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {
        const container = L.DomUtil.create('div','container');
        const divInfos = L.DomUtil.create('div','infos');

        const divCountry = L.DomUtil.create('div','country');
        const countryInfos = res.features[res.features.length-1]["place_name"];
        divCountry.append(countryInfos);

        const divLocation = L.DomUtil.create('div','location');
        const locationInfos = res.features[1]["place_name"];
        divLocation.append(locationInfos);

        divInfos.append(divCountry);
        divInfos.append(divLocation);
        const btnShowInfos = createButton("Détail",divInfos )

        const divRouting = L.DomUtil.create('div','routing');
        const startBtn = createButton('Partir d\'ici',divRouting);
        const destBtn = createButton('Aller jusqu\'ici', divRouting);
    
        
        container.append(divInfos);
        container.append(divRouting);
    

        L.popup().setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);

        const loc = document.querySelectorAll(".location");
        loc.forEach(e => e.hidden = true);

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
                routeStartInput.value = res.features[res.features.length-1]["text"];
                btnOpenRoute.click();
                traceRoute(meanOfTransport);
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
                routeDestinationInput.value = res.features[res.features.length-1]["text"];
                btnOpenRoute.click();
                traceRoute(meanOfTransport);
            })

            map.closePopup();
        });

        L.DomEvent.on(btnShowInfos, 'click', function() {
            document.querySelector(".country").hidden = !(document.querySelector(".country").hidden);
            document.querySelector(".location").hidden = !(document.querySelector(".location").hidden);
            this.hidden = true;
        });
    })
}
const createButton = function (label, container) {
    const btn = L.DomUtil.create('button', 'btnPopup', container);
    btn.setAttribute('type', 'button');
    btn.innerText = label;
    return btn;
}

const traceRoute = function(meanOfTransport = "driving-traffic") {
    if (locationList[0] && locationList[1]) {
        routesList.forEach(e => e.remove());
        const control = L.Routing.control({
            waypoints: [
                locationList[0],
                locationList[1]
            ],
            router: L.Routing.mapbox(accessToken,{profile : `mapbox/${meanOfTransport}`, language : 'fr'})
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

btnRouteShowOptions.addEventListener("click", function(e) {
    btnRouteHideOptions.hidden = false;
    btnsTransports.forEach(e => e.hidden = false);

    this.hidden = true;
});

btnRouteHideOptions.addEventListener("click", function(e) {
    btnRouteShowOptions.hidden = false;
    
    this.hidden = true;
    btnsTransports.forEach(e => e.hidden = true);
});


btnsTransports.forEach(e => e.addEventListener("click",function(e) {
    meanOfTransport = e.target.value;
    unselectTransportButton();
    e.target.classList.add('selected');
}))

const unselectTransportButton = function() {
    btnsTransports.forEach(e => e.classList.remove('selected'))
}