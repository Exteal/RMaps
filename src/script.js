
const formSearch = document.querySelector("#formSearch");
const formSearchAdvanced = document.querySelector("#formSearchAdvanced");
const searchMotor = document.querySelector("#searchMotor");
const typeSearch = document.querySelector("#type-search");
const buttonAdvancedForm = document.querySelector("#btnAdvancedSearch");

let map;

const onMapClick = function(e) {
    L.marker(e.latlng).addTo(map);
}

const init = function () {

    fetch("https://nominatim.openstreetmap.org/search?country=france&limit=1&format=json&addressdetails=1")
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {

        const lat = Number.parseFloat(res[0].lat);
        const lon = Number.parseFloat(res[0].lon);

        map = L.map('map').setView([lat,lon], 13);
        
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: "pk.eyJ1IjoiYWxwaG9uc2VhbG9uenkiLCJhIjoiY2t6aWZ2ZGlzMDg5dzJvbDQyY3JldTAzeiJ9.y_8yWktMT0rmyYFi19aJig"
        }).addTo(map);

        map.on("click", onMapClick);
       /* const osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { // LIGNE 20
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
        });
    
        map.addLayer(osmLayer);
        */
    })
}

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

buttonAdvancedForm.addEventListener("click", function(e) {
    formSearch.hidden = !(formSearch.hidden);
    formSearchAdvanced.hidden = !(formSearchAdvanced.hidden);
})




